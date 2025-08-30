import os
import requests
from fastapi import HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from fastapi import Depends

load_dotenv()  # Loads variables from .env

auth_scheme = HTTPBearer()

SUPABASE_PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing credentials")

    token = credentials.credentials
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY
    }

    response = requests.get(
        f"https://{SUPABASE_PROJECT_REF}.supabase.co/auth/v1/user",
        headers=headers
    )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_info = response.json()

    if "id" not in user_info:
        raise HTTPException(status_code=400, detail="User ID not found in token")

    return user_info