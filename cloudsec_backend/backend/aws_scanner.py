import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")


def assume_role(role_arn, session_name="CloudSecSession"):
    """
    Assume a role and return a boto3.Session locked to that role.
    """
    sts = boto3.client("sts")
    response = sts.assume_role(
        RoleArn=role_arn,
        RoleSessionName=session_name
    )

    creds = response["Credentials"]

    # Create a session pinned to assumed role creds
    return boto3.Session(
        aws_access_key_id=creds["AccessKeyId"],
        aws_secret_access_key=creds["SecretAccessKey"],
        aws_session_token=creds["SessionToken"]
    )


def get_session(credentials: dict = None):
    """
    Returns a boto3 session (either from credentials or default env vars).
    """
    if credentials:
        return boto3.Session(
            aws_access_key_id=credentials["aws_access_key_id"],
            aws_secret_access_key=credentials["aws_secret_access_key"],
            aws_session_token=credentials.get("aws_session_token"),
            region_name=AWS_REGION,
        )

    return boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION,
    )


def scan_ec2(session):
    ec2 = session.client("ec2")
    instances = ec2.describe_instances()
    return instances


def scan_s3(session):
    s3 = session.client("s3")
    buckets = s3.list_buckets()
    return buckets


def scan_iam(session):
    iam = session.client("iam")
    users_response = iam.list_users()
    users = users_response.get("Users", [])

    findings = []

    for user in users:
        username = user["UserName"]

        # Check MFA devices
        mfa_devices = iam.list_mfa_devices(UserName=username).get("MFADevices", [])
        if not mfa_devices:
            findings.append({
                "resource": username,
                "issue": "MFA not enabled",
                "severity": "Medium"
            })

    # Return both IAM users + findings
    return {
        "Users": users,
        "findings": findings,
        "ResponseMetadata": users_response.get("ResponseMetadata", {})
    }



def scan_all(credentials=None):
    """
    Scans AWS using provided credentials or default session.
    """
    session = get_session(credentials)

    # Run individual scans
    ec2 = scan_ec2(session)
    s3 = scan_s3(session)
    iam = scan_iam(session)

    # Collect findings
    findings = []
    findings.extend(iam.get("findings", []))  # ✅ pulls IAM findings up

    return {
        "ec2": ec2,
        "s3": s3,
        "iam": iam,
        "findings": findings  # ✅ now populated
    }


def scan_all_with_assumed_role(role_arn):
    """
    Scans AWS using only the assumed role session (no fallback).
    """
    try:
        session = assume_role(role_arn)

        # Verify identity (no chance of falling back now)
        sts = session.client("sts")
        identity = sts.get_caller_identity()
        print(f"🔑 Scanning as Account: {identity['Account']} | Arn: {identity['Arn']}")

        # Run individual scans
        ec2 = scan_ec2(session)
        s3 = scan_s3(session)
        iam = scan_iam(session)

        # Collect findings
        findings = []
        findings.extend(iam.get("findings", []))
        return {
            "account_identity": identity,
            "ec2": ec2,
            "s3": s3,
            "iam": iam,
            "findings": findings  # 🔥 bubble up findings here
        }

    except Exception as e:
        raise Exception(f"Failed to scan with assumed role: {str(e)}")



def get_account_id(credentials=None):
    """
    Returns the AWS Account ID for the provided credentials.
    """
    session = get_session(credentials)
    sts = session.client("sts")
    identity = sts.get_caller_identity()
    return {
        "Account": identity["Account"],
        "Arn": identity["Arn"],
        "UserId": identity["UserId"]
    }


def clear_default_aws_creds():
    for var in ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN"]:
        if var in os.environ:
            del os.environ[var]
