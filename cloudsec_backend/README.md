# CloudSec Backend - Multi-Tenant Implementation

## Overview
This is the backend for the CloudSec application, which provides cloud security scanning capabilities for AWS accounts. This implementation has been updated to support multi-tenancy, allowing each user to connect their own AWS account.

## Features
- CSPM (Cloud Security Posture Management) scanning
- CWPP (Cloud Workload Protection Platform) scanning
- Multi-tenant architecture with AWS account isolation
- Supabase authentication and database integration

## Multi-Tenant Implementation

### AWS Onboarding Flow
When a new user signs up, they need to create an IAM role in their AWS account that allows the CloudSec application to perform security scans. This can be done in two ways:

1. **CloudFormation Template**: Use the provided CloudFormation template (`backend/cloudformation_template.yaml`) to automatically create the necessary IAM role.
2. **Manual Creation**: Use the provided JSON policy (`backend/aws_role_policy.json`) to manually create the IAM role.

The role should have the following characteristics:
- Trust policy allowing the CloudSec account to assume the role
- Attached managed policies: SecurityAudit and ViewOnlyAccess
- Role name: CloudSecScanRole (recommended)

### Database Schema
The database schema has been extended to support multi-tenancy:

- `users`: Stores user information (existing)
- `aws_accounts`: New table storing each user's AWS account information
- `scans`: Modified to include aws_account_id for tenant isolation

### API Endpoints

#### AWS Account Management
- `POST /aws-account`: Store user's AWS account information
  - Request body: `{ "account_id": "string", "role_arn": "string" }`
- `GET /aws-account`: Retrieve user's AWS account information

#### Multi-Tenant Scanning
- `GET /scan/cspm-multi`: Perform CSPM scan using user's AWS account
- `GET /results/history-multi`: Retrieve user's scan history

#### Legacy Endpoints (Single-Tenant)
- `GET /scan/cspm`: Perform CSPM scan using the CloudSec account's credentials
- `GET /scan/cwpp`: Perform CWPP scan
- `GET /results/history`: Retrieve all scan results

## Setup

### Environment Variables
You can set up your environment variables in two ways:

1. **Using the setup script (recommended)**:
   Run `python setup_env.py` to interactively set up your environment variables.
   This will create a `.env` file with your configuration.

2. **Manual setup**:
   Create a `.env` file in the root of the backend directory with the following variables:

```env
# Supabase Configuration
SUPABASE_PROJECT_ID=your-supabase-project-id
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-role-key

# Database Configuration
SUPABASE_DB=your-database-name
SUPABASE_USER=your-database-user
SUPABASE_PASS=your-database-password
SUPABASE_HOST=your-database-host

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
```

The following environment variables need to be set:

- `SUPABASE_PROJECT_ID`: Supabase project ID for authentication
- `SUPABASE_ANON_KEY`: Supabase anonymous key for authentication
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key
- `SUPABASE_DB`: Supabase database name
- `SUPABASE_USER`: Supabase database user
- `SUPABASE_PASS`: Supabase database password
- `SUPABASE_HOST`: Supabase database host
- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID`: CloudSec AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: CloudSec AWS secret access key

### Database Setup
Run the following SQL to create the aws_accounts table:

```sql
CREATE TABLE aws_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  account_id TEXT,
  role_arn TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Run the following SQL to modify the scans table:

```sql
ALTER TABLE scans ADD COLUMN aws_account_id UUID REFERENCES aws_accounts(id);
```

## Testing
See [TESTING_MULTI_TENANT.md](TESTING_MULTI_TENANT.md) for detailed testing instructions.

## Deployment
The application can be deployed using Docker Compose or Render. See `docker-compose.yml` and `render.yaml` for configuration details.