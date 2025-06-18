from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError
from app.utils.dynamodb import get_account_credentials

snapshot_list_bp = Blueprint("snapshot_list", __name__)

@snapshot_list_bp.route("/snapshots", methods=["GET"])
def list_snapshots():
    try:
        account_id = request.args.get("account_id")
        resource_type = request.args.get("type")  # lambda, lex, or connect
        resource_name = request.args.get("name")

        if not account_id or not resource_type or not resource_name:
            return jsonify({"error": "Missing required query parameters: account_id, type, name"}), 400

        credentials = get_account_credentials(account_id)
        if not credentials:
            return jsonify({"error": f"Account ID '{account_id}' not found in database"}), 404

        session = boto3.Session(
            aws_access_key_id=credentials["access_key_id"],
            aws_secret_access_key=credentials["secret_access_key"],
            region_name=credentials["region"]
        )

        s3 = session.client("s3")
        bucket_name = f"cloudops-snapshots-{account_id}"
        prefix = f"{account_id}/{resource_type}/{resource_name}/"

        try:
            response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
            objects = response.get("Contents", [])

            snapshot_files = [obj["Key"] for obj in objects if obj["Key"].endswith(".json")]
            if not snapshot_files:
                return jsonify({"message": "No snapshots found."}), 200

            return jsonify({"snapshots": snapshot_files}), 200

        except ClientError as e:
            return jsonify({"error": f"S3 error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500