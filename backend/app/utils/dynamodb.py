import boto3
import os
from botocore.exceptions import ClientError

def get_account_credentials(account_id, region="us-east-1"):
    is_local = os.getenv("IS_LOCAL", "false").lower() == "true"
    table_name = os.getenv("DYNAMODB_TABLE_NAME", "snapdeploy-accounts")

    if is_local:
        # Use credentials from environment variables for local testing
        session = boto3.Session(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", region)
        )
    else:
        # Use IAM role for deployed Lambda
        session = boto3.Session(region_name=region)

    dynamodb = session.resource("dynamodb")
    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(Key={"account_id": account_id})
        item = response.get("Item")
        if not item:
            return None
        return {
            "access_key_id": item["access_key_id"],
            "secret_access_key": item["secret_access_key"],
            "region": item.get("region", region)
        }
    except ClientError as e:
        print(f"Error fetching credentials: {e}")
        return None