import boto3

def check_s3_public_buckets():
    s3 = boto3.client("s3")
    violations = []
    response = s3.list_buckets()

    for bucket in response["Buckets"]:
        bucket_name = bucket["Name"]
        try:
            acl = s3.get_bucket_acl(Bucket=bucket_name)
            for grant in acl["Grants"]:
                grantee = grant.get("Grantee", {})
                if grantee.get("URI") == "http://acs.amazonaws.com/groups/global/AllUsers":
                    violations.append({
                        "bucket": bucket_name,
                        "issue": "Public bucket detected"
                    })
        except Exception as e:
            violations.append({"bucket": bucket_name, "error": str(e)})

    return violations
