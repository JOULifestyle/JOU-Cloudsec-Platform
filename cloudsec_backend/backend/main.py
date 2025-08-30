from fastapi import FastAPI, Depends, Query, Body, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.security import HTTPAuthorizationCredentials
from cwpp.runtime_scanner import classify_severity
from pydantic import BaseModel
from datetime import datetime
import subprocess
import json
import traceback
import boto3
from botocore.exceptions import ClientError
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv
import psycopg2

from .aws_scanner import scan_all, scan_all_with_assumed_role, clear_default_aws_creds
from cwpp.runtime_scanner import run_runtime_checks
from .db import (
    save_scan_result,
    fetch_scan_history,
    get_dashboard_stats,
    save_aws_account,
    get_user_aws_account,
    update_scan_result_with_aws_account,
    fetch_user_scan_history
)
from .auth import auth_scheme, verify_token
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DB_CONFIG = {
   "dbname": os.getenv("SUPABASE_DB"),
    "user": os.getenv("SUPABASE_USER"),
    "password": os.getenv("SUPABASE_PASS"),
    "host": os.getenv("SUPABASE_HOST"),
    "port": "5432",
    "sslmode": "require",
}


app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class ContactForm(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://cloudsec-dashboard.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AWSAccountData(BaseModel):
    account_id: str
    role_arn: str

# -----------------------------
# Utility: Clean AWS scan results
# -----------------------------
def clean_aws_results(results: dict) -> dict:
    import copy, traceback
    results_clean = copy.deepcopy(results)
    findings = []

    try:
        # EC2
        ec2_data = results_clean.get('ec2', {}).get('ec2_instances', {})
        if isinstance(ec2_data, dict):
            ec2_data.pop('ResponseMetadata', None)
            total = running = stopped = 0
            for res in ec2_data.get('Reservations', []):
                res.pop('ResponseMetadata', None)
                for inst in res.get('Instances', []):
                    if 'LaunchTime' in inst and hasattr(inst['LaunchTime'], 'isoformat'):
                        inst['LaunchTime'] = inst['LaunchTime'].isoformat()
                    state = inst.get('State', {}).get('Name')
                    total += 1
                    if state == "running":
                        running += 1
                    elif state == "stopped":
                        stopped += 1
            results_clean['ec2']['summary'] = {
                "total_instances": total,
                "running": running,
                "stopped": stopped
            }

        # IAM
        iam_data = results_clean.get('iam', {}).get('iam_users', {})
        if isinstance(iam_data, dict):
            iam_data.pop('ResponseMetadata', None)
            for user in iam_data.get('Users', []):
                if 'CreateDate' in user and hasattr(user['CreateDate'], 'isoformat'):
                    user['CreateDate'] = user['CreateDate'].isoformat()
                if not user.get('MFA', False):
                    findings.append({
                        "service": "IAM",
                        "resource": user.get("UserName"),
                        "issue": "MFA not enabled",
                        "severity": "Medium"
                    })

        # S3
        s3_buckets = results_clean.get('s3', {}).get('s3_buckets', [])
        if isinstance(s3_buckets, list):
            for bucket in s3_buckets:
                if 'CreationDate' in bucket and hasattr(bucket['CreationDate'], 'isoformat'):
                    bucket['CreationDate'] = bucket['CreationDate'].isoformat()
                bucket.pop('ResponseMetadata', None)
                if bucket.get("PublicAccess", False):
                    findings.append({
                        "service": "S3",
                        "resource": bucket.get("Name"),
                        "issue": "Public bucket",
                        "severity": "High"
                    })

        results_clean["findings"] = findings

    except Exception as e:
        print(f"Error cleaning AWS results: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return results

    return results_clean

# -----------------------------
# CSPM Scan
# -----------------------------
@app.get("/scan/cspm")
def scan_cspm(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    user_info = verify_token(credentials)
    user_id = user_info["id"]
    try:
        results = scan_all()
        results = clean_aws_results(results)

        results["scan_type"] = "cspm"
        results["timestamp"] = datetime.utcnow().isoformat()

        # 🔑 Encode for JSON safety
        safe_results = jsonable_encoder(results)

        # 🔑 Always save findings under data
        scan_id = save_scan_result(
            user_id=user_id,
            data=safe_results,
            scan_type="cspm",
            aws_account_id=None
        )

        return {"status": "ok", "results": safe_results}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "traceback": traceback.format_exc()}
        )


@app.get("/scan/cspm-multi")
def scan_cspm_multi(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    user_info = verify_token(credentials)
    user_id = user_info["id"]

    # Fetch AWS account
    aws_account = get_user_aws_account(user_id)
    if not aws_account:
        raise HTTPException(status_code=400, detail="No AWS account registered for this user")

    # Reject invalid accounts
    if not aws_account.get("is_valid", False):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid AWS account: {aws_account.get('validation_error', 'Unknown error')}"
        )

    role_arn = aws_account.get("role_arn")
    if not role_arn:
        raise HTTPException(status_code=400, detail="No role ARN found for this AWS account")

    try:
        # 🚀 Clear default AWS creds to avoid scanning the wrong environment
        clear_default_aws_creds()

        # Run scan with assumed role (always tenant role)
        results = scan_all_with_assumed_role(role_arn)
        results = clean_aws_results(results)

        # Add metadata
        results["scan_type"] = "cspm"
        results["timestamp"] = datetime.utcnow().isoformat()

        # Save scan result
        safe_results = jsonable_encoder(results)
        scan_id = save_scan_result(
            user_id=user_id,
            data=safe_results,
            aws_account_id=str(aws_account["id"]),
            scan_type="cspm"
        )

        return {"status": "ok", "results": safe_results}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})

# -----------------------------
# CWPP Scan
# -----------------------------
@app.get("/scan/cwpp")
def scan_cwpp(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    user_info = verify_token(credentials)
    user_id = user_info["id"]
    try:
        results = run_runtime_checks()
        for finding in results.get("findings", []):
            sev = finding.get("severity", "").lower()
            if sev in ["critical", "high"]:
                finding["severity"] = "High"
            elif sev == "medium":
                finding["severity"] = "Medium"
            elif sev == "low":
                finding["severity"] = "Low"
            elif sev:
                finding["severity"] = "Info"
            else:
                finding["severity"] = classify_severity(finding.get("type", ""), finding.get("message", ""))
        results["scan_type"] = "cwpp"
        results["timestamp"] = datetime.utcnow().isoformat()
        scan_id = save_scan_result(user_id, results,  scan_type="cwpp",
            aws_account_id=None)
        return {"status": "ok", "results": results}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})

# -----------------------------
# Scan History
# -----------------------------
@app.get("/results/history")
def scan_history(scan_type: str = Query(None), credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    user_info = verify_token(credentials)
    user_id = user_info["id"]
    try:
        history = fetch_scan_history(user_id, scan_type)
        return {"status": "ok", "history": history.data}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})

@app.get("/results/history-multi")
def scan_history_multi(scan_type: str = Query(None), credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    user_info = verify_token(credentials)
    user_id = user_info["id"]
    try:
        history = fetch_user_scan_history(user_id, scan_type)
        return {"status": "ok", "history": history}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})

# -----------------------------
# Dashboard Stats
# -----------------------------
@app.get("/dashboard/stats")
def dashboard_stats(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    payload = verify_token(credentials)
    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")
    try:
        stats = get_dashboard_stats(user_id)
        return {"status": "ok", **stats}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})

# -----------------------------
# AWS Account Endpoints (Updated)
# -----------------------------
@app.post("/aws-account")
def store_aws_account_endpoint(
    aws_account_data: AWSAccountData, 
    user_info: dict = Depends(verify_token)
):
    user_id = user_info.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or missing user ID")
    if not aws_account_data.account_id or not aws_account_data.role_arn:
        raise HTTPException(status_code=400, detail="account_id and role_arn are required")
    
    # --- Validate the AWS account and role ARN ---
    try:
        sts_client = boto3.client("sts")
        assumed_role = sts_client.assume_role(
            RoleArn=aws_account_data.role_arn,
            RoleSessionName="validation-session"
        )
        returned_account_id = assumed_role['AssumedRoleUser']['Arn'].split(":")[4]
        if returned_account_id != aws_account_data.account_id:
            raise HTTPException(
                status_code=400,
                detail=f"Role ARN does not match the provided account ID. Expected {aws_account_data.account_id}, got {returned_account_id}"
            )
    except ClientError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to assume role. Check the role ARN and permissions. Error: {e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during AWS validation: {e}"
        )

    # --- Save to database if validation passed ---
    try:
        save_aws_account(user_id, aws_account_data.account_id, aws_account_data.role_arn)
        return {"status": "ok", "message": "AWS account info saved successfully"}
    except psycopg2.IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="This AWS account is already registered for this user."
        )
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

@app.get("/aws-account")
def get_aws_account(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    user_info = verify_token(credentials)
    user_id = user_info.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or missing user ID")
    
    try:
        aws_account = get_user_aws_account(user_id)
        if not aws_account:
            return {"status": "ok", "data": None}

        # --- Validate the stored role ARN ---
        is_valid = False
        validation_error = None
        try:
            sts_client = boto3.client("sts")
            assumed_role = sts_client.assume_role(
                RoleArn=aws_account["role_arn"],
                RoleSessionName="validation-session"
            )
            returned_account_id = assumed_role['AssumedRoleUser']['Arn'].split(":")[4]
            if returned_account_id == aws_account["account_id"]:
                is_valid = True
            else:
                validation_error = f"Role ARN does not match account ID. Expected {aws_account['account_id']}, got {returned_account_id}"
        except ClientError as e:
            validation_error = f"Failed to assume role: {e}"
        except Exception as e:
            validation_error = f"Unexpected error during validation: {e}"

        # --- Return the AWS account with validation status ---
        return {
            "status": "ok",
            "data": {
                **aws_account,
                "is_valid": is_valid,
                "validation_error": validation_error if not is_valid else None
            }
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})
# -----------------------------
# Steampipe Query
# -----------------------------
@app.get("/steampipe/results")
def steampipe_results(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    verify_token(credentials)
    try:
        query = "select * from aws_iam_user limit 5;"
        completed_process = subprocess.run(
            ['steampipe', 'query', '--json', query],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        results = json.loads(completed_process.stdout)
        return {"status": "ok", "results": results}
    except subprocess.CalledProcessError as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": e.stderr, "traceback": traceback.format_exc()})



@app.post("/contact")
async def submit_contact(form: ContactForm):  # remove token if you don't enforce auth
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO contact_messages (name, email, subject, message) VALUES (%s, %s, %s, %s)",
            (form.name, form.email, form.subject, form.message)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"status": "ok", "message": "Contact form saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
