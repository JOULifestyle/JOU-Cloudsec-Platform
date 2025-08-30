# Testing Multi-Tenant Implementation

## Overview
This document provides instructions for testing the multi-tenant implementation of the CloudSec backend.

## Prerequisites
- AWS account for testing
- Supabase account with the CloudSec database
- CloudSec backend running locally or deployed

## Test Cases

### 1. AWS Onboarding Flow

#### 1.1 CloudFormation Template
1. Update the CloudFormation template with your CloudSec AWS account ID
2. Deploy the CloudFormation template in a test AWS account
3. Verify that the CloudSecScanRole is created with the correct trust policy
4. Verify that the role has the SecurityAudit and ViewOnlyAccess managed policies attached

#### 1.2 Manual IAM Role Creation
1. Update the aws_role_policy.json with your CloudSec AWS account ID
2. Create an IAM role in a test AWS account using the JSON policy
3. Attach the SecurityAudit and ViewOnlyAccess managed policies to the role
4. Verify that the role can be assumed by your CloudSec account

### 2. AWS Account Registration

#### 2.1 Store AWS Account Information
1. Register a new user in the CloudSec application
2. Obtain an authentication token for the user
3. Call the `/aws-account` endpoint with POST method to store AWS account information:
   ```
   POST /aws-account
   Headers: Authorization: Bearer <token>
   Parameters: account_id=<AWS_ACCOUNT_ID>&role_arn=<ROLE_ARN>
   ```
4. Verify that the AWS account information is stored in the database

#### 2.2 Retrieve AWS Account Information
1. Call the `/aws-account` endpoint with GET method to retrieve AWS account information:
   ```
   GET /aws-account
   Headers: Authorization: Bearer <token>
   ```
2. Verify that the correct AWS account information is returned

### 3. Multi-Tenant Scanning

#### 3.1 CSPM Scan with Assumed Role
1. Ensure the user has registered their AWS account information
2. Call the `/scan/cspm-multi` endpoint:
   ```
   GET /scan/cspm-multi
   Headers: Authorization: Bearer <token>
   ```
3. Verify that the scan completes successfully using the assumed role
4. Verify that the scan results are stored in the database with the aws_account_id

#### 3.2 CWPP Scan (No Change)
1. Call the `/scan/cwpp` endpoint:
   ```
   GET /scan/cwpp
   Headers: Authorization: Bearer <token>
   ```
2. Verify that the scan completes successfully (this should work the same as before)

### 4. Tenant Isolation

#### 4.1 User Scan History
1. Register two users with different AWS accounts
2. Run scans for both users using their respective AWS accounts
3. Call the `/results/history-multi` endpoint for each user:
   ```
   GET /results/history-multi
   Headers: Authorization: Bearer <token>
   ```
4. Verify that each user only sees their own scan results

#### 4.2 Global Scan History
1. Call the `/results/history` endpoint:
   ```
   GET /results/history
   Headers: Authorization: Bearer <token>
   ```
2. Verify that this endpoint still returns all scan results (for backward compatibility)

## Troubleshooting

### Common Issues

1. **STS AssumeRole fails**
   - Verify that the CloudFormation template or manual role creation was done correctly
   - Check that the trust policy allows your CloudSec account to assume the role
   - Verify that the role ARN is correctly stored in the database

2. **Scan fails with permissions error**
   - Verify that the SecurityAudit and ViewOnlyAccess policies are attached to the role
   - Check that the role has not been modified to remove necessary permissions

3. **Tenant isolation not working**
   - Verify that the aws_account_id is correctly associated with scan results
   - Check that the fetch_user_scan_history function is correctly filtering results

### Debugging Steps

1. Check the application logs for error messages
2. Verify database entries for aws_accounts and scans tables
3. Test AWS role assumption manually using AWS CLI:
   ```
   aws sts assume-role --role-arn <ROLE_ARN> --role-session-name test-session
   ```
4. Test individual AWS API calls using the assumed credentials

## Rollback Plan

If issues are encountered during testing:

1. Revert any changes to the database schema
2. Restore the original aws_scanner.py file
3. Remove the new endpoints from main.py
4. Revert any changes to db.py

## Success Criteria

The multi-tenant implementation is successful if:

1. Users can successfully register their AWS accounts
2. Scans can be performed using assumed roles
3. Scan results are correctly associated with user accounts
4. Users can only see their own scan results
5. The existing single-tenant functionality remains unchanged