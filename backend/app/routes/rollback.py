from flask import Blueprint, request, jsonify
import boto3
import json
import os
from datetime import datetime
from botocore.exceptions import ClientError
from app.utils.dynamodb import get_account_credentials

rollback_bp = Blueprint("rollback", __name__)

@rollback_bp.route("/rollback", methods=["POST"])
def rollback():
    try:
        data = request.get_json()
        account_id = data.get("account_id")
        resource_type = data.get("type")  # 'lambda', 'lex', or 'connect'
        resource_name = data.get("name")
        timestamp = data.get("timestamp")

        if not account_id or not resource_type or not resource_name or not timestamp:
            return jsonify({"error": "Missing required parameters: account_id, type, name, timestamp"}), 400

        credentials = get_account_credentials(account_id)
        if not credentials:
            return jsonify({"error": f"Account ID '{account_id}' not found in database"}), 404

        access_key = credentials["access_key_id"]
        secret_key = credentials["secret_access_key"]
        region = credentials["region"]

        bucket_name = f"cloudops-snapshots-{account_id}"
        # Ensure timestamp in filename uses hyphens instead of colons and T for space, consistent with snapshot creation logic
        timestamp_safe = timestamp.replace(":", "-").replace(" ", "T")
        key = f"{account_id}/{resource_type}/{resource_name}/{resource_type}_{resource_name}_snapshot_{timestamp_safe}.json"
        print(f"Looking for snapshot in bucket: {bucket_name}, key: {key}")

        session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        s3 = session.client("s3")

        try:
            obj = s3.get_object(Bucket=bucket_name, Key=key)
            snapshot_data = json.loads(obj["Body"].read().decode("utf-8"))
        except ClientError as e:
            return jsonify({"error": f"Failed to load snapshot from S3: {str(e)}"}), 500

        if resource_type == "lambda":
            client = session.client("lambda")
            config = snapshot_data.get("Configuration", {})
            try:
                client.update_function_configuration(
                    FunctionName=config.get("FunctionName"),
                    Description=config.get("Description"),
                    Handler=config.get("Handler"),
                    MemorySize=config.get("MemorySize"),
                    Role=config.get("Role"),
                    Runtime=config.get("Runtime"),
                    Timeout=config.get("Timeout"),
                    Environment=config.get("Environment", {})
                )
            except ClientError as e:
                return jsonify({"error": f"Failed to apply Lambda configuration: {str(e)}"}), 500

        elif resource_type == "lex":
            client = session.client("lexv2-models")
            # In real-world scenarios, you'd use snapshot_data to recreate or update a bot.
            return jsonify({"message": "Lex snapshot loaded successfully, rollback logic placeholder"}), 200

        elif resource_type == "connect":
            client = session.client("connect")
            # In real-world scenarios, you'd use snapshot_data to recreate or update an instance or config.
            return jsonify({"message": "Amazon Connect snapshot loaded successfully, rollback logic placeholder"}), 200

        else:
            return jsonify({"error": f"Unsupported resource type: {resource_type}"}), 400

        return jsonify({"message": "Rollback completed successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500