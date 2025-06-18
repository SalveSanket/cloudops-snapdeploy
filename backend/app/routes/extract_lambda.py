from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError
from app.utils.dynamodb import get_account_credentials
import os
from dotenv import load_dotenv
import traceback

load_dotenv()

lambda_bp = Blueprint("extract_lambda", __name__)

# List of commonly used AWS regions
ALL_REGIONS = [
    "us-east-1", "us-west-1", "us-west-2", "eu-west-1",
    "eu-central-1", "ap-south-1", "ap-northeast-1", "ap-northeast-2",
    "ap-southeast-1", "ap-southeast-2"
]

@lambda_bp.route("/extract/lambda", methods=["GET"])
def extract_lambda():
    try:
        account_id = request.args.get("account_id")
        if not account_id:
            return jsonify({"error": "Missing required parameter: account_id"}), 400

        print("Received account_id:", account_id)

        is_local = os.getenv("IS_LOCAL", "false").lower() == "true"
        print("IS_LOCAL =", is_local)

        access_key = secret_key = None

        if is_local:
            access_key = os.getenv("AWS_ACCESS_KEY_ID")
            secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
            if not access_key or not secret_key:
                return jsonify({"error": "Missing AWS credentials in .env file"}), 500
        else:
            credentials = get_account_credentials(account_id)
            if not credentials:
                return jsonify({"error": f"Account ID '{account_id}' not found in database"}), 404
            access_key = credentials.get("access_key_id")
            secret_key = credentials.get("secret_access_key")

        if not access_key or not secret_key:
            return jsonify({"error": "AWS credentials not provided"}), 500

        output = []
        for region in ALL_REGIONS:
            try:
                print("Checking region:", region)
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
                lambda_client = session.client("lambda")
                response = lambda_client.list_functions()
                functions = response.get("Functions", [])

                region_data = {
                    "Region": region,
                    "Functions": [
                        {
                            "FunctionName": fn.get("FunctionName"),
                            "Runtime": fn.get("Runtime"),
                            "Handler": fn.get("Handler"),
                            "Description": fn.get("Description", ""),
                            "LastModified": fn.get("LastModified"),
                            "MemorySize": fn.get("MemorySize"),
                            "Timeout": fn.get("Timeout"),
                            "EnvironmentVariables": fn.get("Environment", {}).get("Variables", {})
                        }
                        for fn in functions
                    ] if functions else ["No Lambda functions found in this region"]
                }
                output.append(region_data)

            except ClientError as e:
                print("Exception in region:", region)
                traceback.print_exc()
                output.append({
                    "Region": region,
                    "Error": str(e)
                })

        return jsonify({"functions": output})

    except Exception as e:
        print("Unexpected error in extract_lambda:", str(e))
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500