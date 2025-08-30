#!/usr/bin/env python3
"""
Script to help set up environment variables for the CloudSec backend.
This script will guide you through setting up the required environment variables
and create a .env file with your configuration.
"""

import os

def setup_environment():
    print("CloudSec Backend Environment Setup")
    print("==================================")
    print()
    
    # Check if .env file already exists
    if os.path.exists(".env"):
        response = input("A .env file already exists. Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("Setup cancelled.")
            return
    
    # Collect environment variables
    print("Please enter your configuration values (press Enter to skip or use defaults):")
    print()
    
    # Supabase Configuration
    print("=== Supabase Configuration ===")
    supabase_project_id = input("SUPABASE_PROJECT_ID (e.g., your-project-id): ").strip()
    supabase_anon_key = input("SUPABASE_ANON_KEY (e.g., your-anon-key): ").strip()
    supabase_url = input("SUPABASE_URL (e.g., https://your-project.supabase.co): ").strip()
    supabase_key = input("SUPABASE_KEY (e.g., your-service-role-key): ").strip()
    
    print()
    
    # Database Configuration
    print("=== Database Configuration ===")
    supabase_db = input("SUPABASE_DB (e.g., postgres): ").strip() or "postgres"
    supabase_user = input("SUPABASE_USER (e.g., postgres): ").strip() or "postgres"
    supabase_pass = input("SUPABASE_PASS (e.g., your-password): ").strip()
    supabase_host = input("SUPABASE_HOST (e.g., db.your-project.supabase.co): ").strip()
    
    print()
    
    # AWS Configuration
    print("=== AWS Configuration ===")
    aws_region = input("AWS_REGION (default: us-east-1): ").strip() or "us-east-1"
    aws_access_key_id = input("AWS_ACCESS_KEY_ID (e.g., your-access-key-id): ").strip()
    aws_secret_access_key = input("AWS_SECRET_ACCESS_KEY (e.g., your-secret-access-key): ").strip()
    
    # Create .env file content
    env_content = f"""# Supabase Configuration
SUPABASE_PROJECT_ID={supabase_project_id}
SUPABASE_ANON_KEY={supabase_anon_key}
SUPABASE_URL={supabase_url}
SUPABASE_KEY={supabase_key}

# Database Configuration
SUPABASE_DB={supabase_db}
SUPABASE_USER={supabase_user}
SUPABASE_PASS={supabase_pass}
SUPABASE_HOST={supabase_host}

# AWS Configuration
AWS_REGION={aws_region}
AWS_ACCESS_KEY_ID={aws_access_key_id}
AWS_SECRET_ACCESS_KEY={aws_secret_access_key}
"""
    
    # Write to .env file
    try:
        with open(".env", "w") as f:
            f.write(env_content)
        print()
        print("✅ Environment variables have been saved to .env file")
        print("   Make sure to keep this file secure and never commit it to version control!")
    except Exception as e:
        print(f"❌ Error writing to .env file: {e}")
        print("   Here are your environment variables:")
        print(env_content)

if __name__ == "__main__":
    setup_environment()