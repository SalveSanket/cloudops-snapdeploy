from flask import Blueprint, request, jsonify
import boto3
import json
import tempfile
import os
from datetime import datetime
from botocore.exceptions import ClientError
from app.utils.dynamodb import get_account_credentials

snapshot_bp = Blueprint("snapshot", __name__)

@snapshot_bp.route("/snapshot", methods=["POST"])
def snapshot():
    try:
        data = request.get_json()
        account_id = data.get("account_id")
        resource_type = data.get("type")  # 'lambda', 'lex', or 'connect'
        resource_name = data.get("name")

        if not account_id or not resource_type or not resource_name:
            return jsonify({"error": "Missing required parameters: account_id, type, name"}), 400

        credentials = get_account_credentials(account_id)
        if not credentials:
            return jsonify({"error": f"Account ID '{account_id}' not found in database"}), 404

        access_key = credentials["access_key_id"]
        secret_key = credentials["secret_access_key"]
        region = credentials["region"]

        bucket_name = f"cloudops-snapshots-{account_id}"

        session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )

        snapshot_data = {}

        if resource_type == "lambda":
            client = session.client("lambda")
            response = client.get_function(FunctionName=resource_name)
            configuration = response.get("Configuration", {})
            snapshot_data = {
                "FunctionName": configuration.get("FunctionName"),
                "Runtime": configuration.get("Runtime"),
                "Handler": configuration.get("Handler"),
                "MemorySize": configuration.get("MemorySize"),
                "Timeout": configuration.get("Timeout"),
                "Environment": configuration.get("Environment", {})
            }

        elif resource_type == "lex":
            client = session.client("lex-models")
            response = client.get_bot(name=resource_name, versionOrAlias="$LATEST")
            snapshot_data = response

        elif resource_type == "connect":
            client = session.client("connect")
            response = client.describe_instance(InstanceId=resource_name)
            snapshot_data = response

        else:
            return jsonify({"error": f"Unsupported resource type: {resource_type}"}), 400

        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H-%M-%S")
        filename = f"{resource_type}_{resource_name}_snapshot_{timestamp}.json"

        with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
            tmpfile.write(json.dumps(snapshot_data, indent=2, default=str).encode("utf-8"))
            tmpfile_path = tmpfile.name

        s3 = session.client("s3")
        key = f"{account_id}/{resource_type}/{resource_name}/{resource_type}_{resource_name}_snapshot_{timestamp}.json"

        try:
            s3.head_bucket(Bucket=bucket_name)
        except ClientError:
            s3.create_bucket(Bucket=bucket_name)

        s3.upload_file(tmpfile_path, bucket_name, key)
        os.remove(tmpfile_path)

        return jsonify({
            "message": "Snapshot created successfully",
            "s3_path": f"s3://{bucket_name}/{key}"
        }), 200

    except ClientError as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500