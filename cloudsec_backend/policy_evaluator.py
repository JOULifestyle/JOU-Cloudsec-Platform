import requests
import json
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get OPA URL from env (Docker will override it), default to localhost
OPA_URL = os.getenv("OPA_URL", "http://localhost:8181/v1/data")

def evaluate_policy(scan_results: dict, policy_path: str):
    """
    scan_results: dict from scanner
    policy_path: e.g. "cloudsec/s3/deny"
    """
    logger.info(f"🔍 Evaluating policy: {policy_path}")
    logger.info(f"📊 Scan results keys: {list(scan_results.keys())}")

    try:
        # Prepare request payload
        request_data = {"input": scan_results}
        opa_endpoint = f"{OPA_URL}/{policy_path}"

        logger.info(f"📤 Sending request to OPA: {opa_endpoint}")
        logger.debug(f"📤 Request payload size: {len(json.dumps(request_data))} bytes")

        response = requests.post(
            opa_endpoint,
            data=json.dumps(request_data),
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        logger.info(f"📥 OPA response status: {response.status_code}")

        if response.status_code != 200:
            logger.error(f"❌ OPA request failed: {response.status_code} - {response.text}")
            return [f"OPA HTTP error {response.status_code}: {response.text}"]

        data = response.json()
        result = data.get("result", [])

        logger.info(f"✅ Policy evaluation result: {len(result)} violations found")
        if result:
            logger.info(f"🚨 Violations: {result}")

        return result

    except requests.exceptions.ConnectionError as e:
        logger.error(f"❌ Cannot connect to OPA at {OPA_URL}: {e}")
        return [f"OPA connection error: Cannot reach OPA server at {OPA_URL}"]
    except requests.exceptions.Timeout as e:
        logger.error(f"❌ OPA request timeout: {e}")
        return [f"OPA timeout error: Request timed out"]
    except json.JSONDecodeError as e:
        logger.error(f"❌ Invalid JSON response from OPA: {e}")
        return [f"OPA JSON decode error: {e}"]
    except Exception as e:
        logger.error(f"❌ Unexpected error in policy evaluation: {e}")
        return [f"OPA evaluation error: {e}"]
