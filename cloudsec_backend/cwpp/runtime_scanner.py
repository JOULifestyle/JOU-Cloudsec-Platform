# cwpp/runtime_scanner.py
from datetime import datetime
import socket
import platform
import random

def run_runtime_checks():
    # Simulated runtime security checks
    findings = []

    if platform.system() != "Linux":
        findings.append({"type": "OS Warning", "message": "Non-Linux system detected"})

    try:
        s = socket.socket()
        s.bind(("0.0.0.0", 8888))
        findings.append({"type": "Open Port", "message": "Port 8888 is open to public"})
        s.close()
    except Exception:
        pass

    if random.random() > 0.5:
        findings.append({"type": "Package Alert", "message": "Outdated curl package found"})

    return {
        "scan_type": "CWPP",
        "timestamp": datetime.utcnow().isoformat(),
        "findings": findings
    }


# cwpp/severity_mapper.py
def classify_severity(finding_type: str, message: str) -> str:
    msg = message.lower()

    if "cve" in msg or "critical" in msg or "malware" in msg or "privilege escalation" in msg:
        return "High"
    if "unpatched" in msg or "outdated" in msg or "exposed key" in msg:
        return "High"

    if "port 8888 is open to public" in msg or "unencrypted" in msg or "insecure config" in msg:
        return "Medium"
    if "no iam role" in msg or "over-permissioned" in msg:
        return "Medium"

    if "warning" in msg or "non-linux" in msg or "missing tag" in msg:
        return "Low"
    if "deprecated" in msg:
        return "Low"

    return "Info"
