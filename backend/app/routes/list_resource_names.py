from flask import Blueprint, request, jsonify
import boto3
from app.utils.dynamodb import get_account_credentials
from botocore.exceptions import ClientError

list_names_bp = Blueprint("list_names", __name__)

@list_names_bp.route("/list-names", methods=["GET"])
def list_names():
    try:
        account_id = request.args.get("account_id")
        resource_type = request.args.get("type")

        if not account_id or not resource_type:
            return jsonify({"error": "Missing required query parameters: account_id, type"}), 400

        credentials = get_account_credentials(account_id)
        if not credentials:
            return jsonify({"error": f"Account ID '{account_id}' not found in database"}), 404

        access_key = credentials["access_key_id"]
        secret_key = credentials["secret_access_key"]
        region = credentials["region"]

        session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )

        names = []

        if resource_type == "lambda":
            client = session.client("lambda")
            paginator = client.get_paginator("list_functions")
            for page in paginator.paginate():
                for function in page.get("Functions", []):
                    names.append(function.get("FunctionName"))

        elif resource_type == "lex":
            client = session.client("lex-models")
            paginator = client.get_paginator("get_bots")
            for page in paginator.paginate():
                for bot in page.get("bots", []):
                    names.append(bot.get("name"))

        elif resource_type == "connect":
            client = session.client("connect")
            paginator = client.get_paginator("list_instances")
            for page in paginator.paginate():
                for instance in page.get("InstanceSummaryList", []):
                    names.append(instance.get("Id"))

        else:
            return jsonify({"error": f"Unsupported resource type: {resource_type}"}), 400

        return jsonify({"names": names}), 200

    except ClientError as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500