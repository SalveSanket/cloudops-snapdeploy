from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError
from app.utils.dynamodb import get_account_credentials


deploy_bp = Blueprint("deploy", __name__)

@deploy_bp.route("/deploy", methods=["POST"])
def deploy():
    try:
        data = request.get_json()
        account_id = data.get("account_id")
        resource_type = data.get("type")  # lambda, lex, connect
        resource_name = data.get("name")
        config = data.get("configuration")

        if not all([account_id, resource_type, resource_name, config]):
            return jsonify({"error": "Missing one or more required parameters: account_id, type, name, configuration"}), 400

        credentials = get_account_credentials(account_id)
        if not credentials:
            return jsonify({"error": f"Account ID '{account_id}' not found in database"}), 404

        session = boto3.Session(
            aws_access_key_id=credentials["access_key_id"],
            aws_secret_access_key=credentials["secret_access_key"],
            region_name=credentials["region"]
        )

        if resource_type == "lambda":
            client = session.client("lambda")
            try:
                response = client.update_function_configuration(
                    FunctionName=resource_name,
                    **config
                )
                return jsonify({"message": "Lambda function updated successfully", "response": response}), 200
            except ClientError as e:
                return jsonify({"error": f"Failed to deploy Lambda function: {str(e)}"}), 500

        elif resource_type == "lex":
            try:
                client = session.client("lex-models")
                response = client.put_bot(
                    name=resource_name,
                    **config
                )
                return jsonify({"message": "Lex bot deployed successfully", "response": response}), 200
            except ClientError as e:
                return jsonify({"error": f"Failed to deploy Lex bot: {str(e)}"}), 500

        elif resource_type == "connect":
            try:
                client = session.client("connect")
                instance_id = config.pop("InstanceId", None)
                if not instance_id:
                    return jsonify({"error": "Missing 'InstanceId' in configuration for Connect deployment"}), 400

                response = client.update_instance_attribute(
                    InstanceId=instance_id,
                    **config
                )
                return jsonify({"message": "Amazon Connect instance attribute updated successfully", "response": response}), 200
            except ClientError as e:
                return jsonify({"error": f"Failed to deploy Amazon Connect change: {str(e)}"}), 500

        else:
            return jsonify({"error": f"Unsupported resource type: {resource_type}"}), 400

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500