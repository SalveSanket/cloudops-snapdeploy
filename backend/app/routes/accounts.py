import boto3
import os
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
from botocore.exceptions import BotoCoreError, ClientError

# Load .env variables
load_dotenv()

def get_boto3_session():
    try:
        # Run locally with AWS_PROFILE
        if os.environ.get("IS_LOCAL", "false").lower() == "true":
            profile = os.getenv("AWS_PROFILE", "default")
            return boto3.Session(profile_name=profile, region_name=os.getenv("AWS_REGION", "us-east-1"))
        # Run inside Lambda using IAM Role
        return boto3.Session(region_name=os.getenv("AWS_REGION", "us-east-1"))
    except Exception as e:
        raise RuntimeError(f"Failed to initialize AWS session: {e}")

# Use default AWS profile and region
try:
    session = get_boto3_session()
    dynamodb = session.resource("dynamodb")
    s3 = session.client("s3")
    table = dynamodb.Table("snapdeploy-accounts")
    s3_bucket = os.getenv("S3_BUCKET", "cloudops-snapdeploy-snapshots")
except Exception as e:
    raise RuntimeError(f"Failed to initialize AWS session: {e}")

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/accounts', methods=['GET'])
def get_accounts():
    try:
        response = table.scan()
        data = response.get('Items', [])
        return jsonify(data), 200
    except (BotoCoreError, ClientError) as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/accounts', methods=['POST'])
def create_account():
    try:
        data = request.get_json()
        table.put_item(Item=data)
        folder_prefix = f"{data['friendly_name']}/"
        s3.put_object(Bucket=s3_bucket, Key=folder_prefix)
        return jsonify({"message": "Account created and folder initialized."}), 201
    except (BotoCoreError, ClientError, KeyError) as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/accounts/<account_id>', methods=['DELETE'])
def delete_account(account_id):
    try:
        # Check if item exists
        response = table.get_item(Key={'account_id': account_id})
        item = response.get('Item')

        if item:
            # Delete item from DynamoDB
            table.delete_item(Key={'account_id': account_id})
            friendly_name = item.get('friendly_name')
        else:
            # If no item in DynamoDB, use account_id as friendly_name fallback
            friendly_name = account_id

        # Delete S3 folder based on friendly_name
        if friendly_name:
            paginator = s3.get_paginator('list_objects_v2')
            for page in paginator.paginate(Bucket=s3_bucket, Prefix=friendly_name + '/'):
                for obj in page.get('Contents', []):
                    s3.delete_object(Bucket=s3_bucket, Key=obj['Key'])

            # Attempt to delete the folder marker object regardless
            try:
                s3.delete_object(Bucket=s3_bucket, Key=f"{friendly_name}/")
            except ClientError as e:
                print(f"Failed to delete folder marker object: {e}")

        message = f"Account '{account_id}' deleted successfully." if item else f"S3 data for account '{account_id}' cleaned up."
        return jsonify({"message": message}), 200
    except (BotoCoreError, ClientError) as e:
        return jsonify({"error": str(e)}), 500