#!/usr/bin/env python3
"""
Database Connection Diagnostic Script
Tests Supabase PostgreSQL connection and provides troubleshooting information.
"""

import os
import psycopg2
from dotenv import load_dotenv
import requests
from datetime import datetime

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test the database connection with detailed diagnostics."""
    print("🔍 Database Connection Diagnostic")
    print("=" * 50)

    # Check environment variables
    print("\n📋 Environment Variables:")
    db_config = {
        "dbname": os.getenv("SUPABASE_DB"),
        "user": os.getenv("SUPABASE_USER"),
        "password": os.getenv("SUPABASE_PASS"),
        "host": os.getenv("SUPABASE_HOST"),
        "port": "5432",
        "sslmode": "require",
    }

    for key, value in db_config.items():
        if key == "password":
            print(f"  {key}: {'*' * len(value) if value else 'NOT SET'}")
        else:
            print(f"  {key}: {value or 'NOT SET'}")

    # Check if all required variables are set
    missing_vars = [k for k, v in db_config.items() if not v]
    if missing_vars:
        print(f"\n❌ Missing environment variables: {', '.join(missing_vars)}")
        return False

    # Test basic connectivity
    print("\n🌐 Testing Network Connectivity:")
    try:
        import socket
        host = db_config["host"]
        port = int(db_config["port"])

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()

        if result == 0:
            print(f"  ✅ Port {port} is open on {host}")
        else:
            print(f"  ❌ Cannot connect to {host}:{port}")
            return False

    except Exception as e:
        print(f"  ❌ Network test failed: {e}")
        return False

    # Test database connection
    print("\n💾 Testing Database Connection:")
    try:
        print("  Connecting to database...")
        conn = psycopg2.connect(**db_config)
        print("  ✅ Connection successful!")

        # Test a simple query
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"  ✅ PostgreSQL version: {version[:50]}...")

        # Test if our tables exist
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('scans', 'aws_accounts');
        """)
        tables = cur.fetchall()
        table_names = [t[0] for t in tables]
        print(f"  📊 Found tables: {table_names}")

        if 'scans' not in table_names:
            print("  ⚠️  'scans' table not found - you may need to run database migrations")
        if 'aws_accounts' not in table_names:
            print("  ⚠️  'aws_accounts' table not found - you may need to run database migrations")

        cur.close()
        conn.close()
        print("  ✅ Connection test completed successfully!")
        return True

    except psycopg2.OperationalError as e:
        print(f"  ❌ Database connection failed: {e}")

        # Provide specific troubleshooting based on error
        error_msg = str(e).lower()
        if "authentication failed" in error_msg:
            print("  💡 Suggestion: Check your SUPABASE_USER and SUPABASE_PASS")
        elif "does not exist" in error_msg:
            print("  💡 Suggestion: Check your SUPABASE_DB name")
        elif "connection refused" in error_msg:
            print("  💡 Suggestion: Database server may be down or network blocked")
        elif "timeout" in error_msg:
            print("  💡 Suggestion: Network timeout - check firewall/internet connection")

        return False

    except Exception as e:
        print(f"  ❌ Unexpected error: {e}")
        return False

def check_supabase_status():
    """Check Supabase service status."""
    print("\n🔧 Supabase Service Status:")
    try:
        # Check Supabase status page
        response = requests.get("https://status.supabase.com/", timeout=10)
        if response.status_code == 200:
            print("  ✅ Supabase status page is accessible")
        else:
            print(f"  ⚠️  Supabase status page returned: {response.status_code}")
    except:
        print("  ⚠️  Could not check Supabase status")

def main():
    """Main diagnostic function."""
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Run diagnostics
    connection_ok = test_database_connection()
    check_supabase_status()

    print("\n" + "=" * 50)
    if connection_ok:
        print("🎉 Database connection is working correctly!")
    else:
        print("❌ Database connection issues detected.")
        print("\n🔧 Troubleshooting Steps:")
        print("1. Check your .env file has correct SUPABASE_* variables")
        print("2. Verify your Supabase project is active")
        print("3. Check Supabase dashboard for any service issues")
        print("4. Ensure your IP is allowed in Supabase network restrictions")
        print("5. Try resetting your database password in Supabase")
        print("6. Check if you've exceeded connection pool limits")

    print(f"\n🕐 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()