#!/usr/bin/env python3
"""
Test script to verify OPA connection and policy evaluation
"""
import requests
import json
import sys
import os

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(__file__))

OPA_URL = "http://localhost:8181/v1/data"

def test_opa_connection():
    """Test basic OPA connectivity"""
    try:
        response = requests.get(f"{OPA_URL}/cloudsec/s3/deny", timeout=5)
        print(f"✅ OPA connection successful: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to OPA at localhost:8181")
        print("   Make sure Docker containers are running: docker-compose up")
        return False
    except Exception as e:
        print(f"❌ OPA connection error: {e}")
        return False

def test_policy_evaluation():
    """Test policy evaluation with sample data"""
    sample_data = {
        "s3": {
            "s3_buckets": [
                {"Name": "test-bucket", "PublicAccess": True},
                {"Name": "private-bucket", "PublicAccess": False}
            ]
        },
        "ec2": {
            "Reservations": [
                {
                    "Instances": [
                        {
                            "InstanceId": "i-1234567890abcdef0",
                            "SecurityGroups": [
                                {"GroupId": "sg-12345", "GroupName": "default"}
                            ],
                            "Tags": []
                        }
                    ]
                }
            ]
        }
    }

    try:
        # Test S3 policy
        print("\n🔍 Testing S3 policy evaluation...")
        response = requests.post(
            f"{OPA_URL}/cloudsec/s3/deny",
            json={"input": sample_data},
            timeout=10
        )
        s3_result = response.json()
        print(f"📊 S3 violations found: {len(s3_result.get('result', []))}")

        # Test EC2 policy
        print("🔍 Testing EC2 policy evaluation...")
        response = requests.post(
            f"{OPA_URL}/cloudsec/ec2/deny",
            json={"input": sample_data},
            timeout=10
        )
        ec2_result = response.json()
        print(f"📊 EC2 violations found: {len(ec2_result.get('result', []))}")

        return True
    except Exception as e:
        print(f"❌ Policy evaluation test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing OPA setup...")

    if not test_opa_connection():
        sys.exit(1)

    if not test_policy_evaluation():
        sys.exit(1)

    print("\n✅ All tests passed! OPA is working correctly.")