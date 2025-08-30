import os
import json
import psycopg2
from datetime import datetime
from decimal import Decimal
from dotenv import load_dotenv
from fastapi.encoders import jsonable_encoder
from supabase import create_client
import boto3
from botocore.exceptions import ClientError


# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

DB_CONFIG = {
    "dbname": os.getenv("SUPABASE_DB"),
    "user": os.getenv("SUPABASE_USER"),
    "password": os.getenv("SUPABASE_PASS"),
    "host": os.getenv("SUPABASE_HOST"),
    "port": "5432",
    "sslmode": "require",
}

# -------------------------
# Helper to make data serializable
# -------------------------
def make_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(i) for i in obj]
    elif isinstance(obj, (datetime,)):
        return obj.isoformat()
    elif isinstance(obj, set):
        return list(obj)
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj

# -------------------------
# AWS Account Management
# -------------------------
def save_aws_account(user_id, account_id, role_arn):
    """
    Save the AWS account for a user. Ensures only one account exists per user.
    If an account already exists, it updates it with the new account_id and role_arn,
    and also refreshes created_at.
    """
    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO aws_accounts (user_id, account_id, role_arn, created_at)
                VALUES (%s, %s, %s, NOW())
                ON CONFLICT (user_id, account_id)
                DO UPDATE SET 
                    account_id = EXCLUDED.account_id,
                    role_arn = EXCLUDED.role_arn,
                    created_at = NOW();
                """,
                [user_id, account_id, role_arn]
            )
            conn.commit()


def get_user_aws_account(user_id):
    """
    Returns the latest AWS account info for a user, including validation status.
    """
    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, account_id, role_arn
                FROM aws_accounts
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 1;
                """,
                [user_id]
            )
            row = cur.fetchone()
            if not row:
                return None

            account_id, role_arn = row[1], row[2]
            is_valid = False
            validation_error = None

            try:
                sts_client = boto3.client("sts")
                assumed_role = sts_client.assume_role(
                    RoleArn=role_arn,
                    RoleSessionName="validation-session"
                )
                returned_account_id = assumed_role['AssumedRoleUser']['Arn'].split(":")[4]
                if returned_account_id == account_id:
                    is_valid = True
                else:
                    validation_error = (
                        f"Role ARN does not match account ID. Expected {account_id}, got {returned_account_id}"
                    )
            except ClientError as e:
                validation_error = f"Failed to assume role: {e}"
            except Exception as e:
                validation_error = f"Unexpected validation error: {e}"

            return {
                "id": row[0],
                "account_id": account_id,
                "role_arn": role_arn,
                "is_valid": is_valid,
                "validation_error": validation_error
            }

# -------------------------
# Scans
# -------------------------
def save_scan_result(user_id, data, aws_account_id=None, scan_type="unknown"):
    try:
        serializable_data = make_serializable(data)
        json_string = json.dumps(serializable_data)

        with psycopg2.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO scans (user_id, aws_account_id, data, scan_type)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                    """,
                    [user_id, aws_account_id, json_string, scan_type]
                )
                scan_id = cur.fetchone()[0]
                conn.commit()
                return scan_id
    except Exception as e:
        print(f"Error saving scan result: {e}")
        # Save minimal data if serialization fails
        simplified_data = {
            "scan_type": data.get("scan_type", "unknown"),
            "timestamp": data.get("timestamp", ""),
            "error": f"Failed to serialize full data: {str(e)}"
        }
        with psycopg2.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO scans (user_id, aws_account_id, data, scan_type)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                    """,
                    [user_id, aws_account_id, json.dumps(simplified_data), scan_type]
                )
                scan_id = cur.fetchone()[0]
                conn.commit()
                return scan_id



def fetch_user_scan_history(user_id, scan_type=None):
    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            query = "SELECT id, data, created_at FROM scans WHERE user_id = %s"
            params = [user_id]

            if scan_type:
                query += " AND data->>'scan_type' = %s"
                params.append(scan_type)

            query += " ORDER BY created_at DESC LIMIT 50;"
            cur.execute(query, params)
            rows = cur.fetchall()
            return [{"id": r[0], "data": r[1], "timestamp": r[2].isoformat()} for r in rows]
def get_dashboard_stats(user_id):
    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            # Total scans
            cur.execute("SELECT COUNT(*) FROM scans WHERE user_id = %s;", [user_id])
            total_scans = cur.fetchone()[0]

            # Fetch scan JSON
            cur.execute("SELECT data FROM scans WHERE user_id = %s;", [user_id])
            rows = cur.fetchall()

            critical = medium = low = 0
            for row in rows:
                scan_data = row[0]
                findings = scan_data.get("findings", [])
                for f in findings:
                    sev = f.get("severity", "").lower()
                    if sev in ["high", "critical"]:
                        critical += 1
                    elif sev == "medium":
                        medium += 1
                    elif sev == "low":
                        low += 1

            # Trend last 7 days
            cur.execute("""
                SELECT to_char(created_at::date, 'YYYY-MM-DD') AS date, COUNT(*) AS scans
                FROM scans
                WHERE user_id = %s
                GROUP BY date
                ORDER BY date ASC
                LIMIT 7;
            """, [user_id])
            trend_rows = cur.fetchall()
            trend = [{"date": row[0], "scans": row[1]} for row in trend_rows]

            return {
                "total_scans": total_scans,
                "critical_findings": critical,
                "medium_findings": medium,
                "low_findings": low,
                "trend": trend
            }


def fetch_scan_history(user_id: str, scan_type: str = None):
    query = supabase.table("scan_results").select("*").eq("user_id", user_id)
    if scan_type:
        query = query.eq("scan_type", scan_type)
    return query.order("created_at", desc=True).execute()

def update_scan_result_with_aws_account(scan_id: str, aws_account_id: str):
    return (
        supabase.table("scan_results")
        .update({"aws_account_id": aws_account_id})
        .eq("id", scan_id)
        .execute()
    )

def validate_aws_account(account_id: str, role_arn: str) -> bool:
    try:
        sts_client = boto3.client("sts")
        assumed_role = sts_client.assume_role(
            RoleArn=role_arn,
            RoleSessionName="validation-session"
        )
        # Optional: check the returned account matches the provided account_id
        returned_account_id = assumed_role['AssumedRoleUser']['Arn'].split(":")[4]
        return returned_account_id == account_id
    except Exception:
        return False


def save_aws_account_clean(user_id, account_id, role_arn):
    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            # Delete any old rows for this user
            cur.execute(
                "DELETE FROM aws_accounts WHERE user_id = %s;",
                [user_id]
            )
            # Insert the new, correct row
            cur.execute(
                """
                INSERT INTO aws_accounts (user_id, account_id, role_arn)
                VALUES (%s, %s, %s);
                """,
                [user_id, account_id, role_arn]
            )
            conn.commit()


def cleanup_invalid_aws_accounts(user_id):
    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM aws_accounts WHERE user_id = %s AND account_id IS NULL;",
                [user_id]
            )
            conn.commit()
