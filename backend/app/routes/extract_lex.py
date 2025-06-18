from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError, EndpointConnectionError
from botocore.config import Config
from app.utils.dynamodb import get_account_credentials

lex_bp = Blueprint("lex", __name__)

@lex_bp.route("/extract/lex", methods=["GET"])
def extract_lex():
    try:
        account_id = request.args.get("account_id")
        if not account_id:
            return jsonify({"error": "Missing required parameter: account_id"}), 400

        credentials = get_account_credentials(account_id)
        if not credentials:
            return jsonify({"error": f"Account ID '{account_id}' not found in database"}), 404

        access_key = credentials["access_key_id"]
        secret_key = credentials["secret_access_key"]

        retry_config = Config(
            connect_timeout=3,
            read_timeout=5,
            retries={'max_attempts': 2}
        )
        all_regions = [
            "us-east-1", "us-west-2", "us-west-1",
            "eu-west-1", "eu-west-2", "eu-central-1",
            "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
            "ap-northeast-2", "ap-south-1"
        ]

        output = []
        for region in all_regions:
            try:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
                lex_client = session.client("lexv2-models", region_name=region, config=retry_config)
                response = lex_client.list_bots()
                bots = response.get("botSummaries", [])

                if bots:
                    region_data = {
                        "Region": region,
                        "Bots": [
                            {
                                "Name": bot.get("botName"),
                                "Status": bot.get("botStatus"),
                                "LastUpdatedDate": str(bot.get("lastUpdatedDateTime"))
                            }
                            for bot in bots
                        ]
                    }
                else:
                    region_data = {
                        "Region": region,
                        "Message": "No Lex bots found in this region"
                    }

            except EndpointConnectionError:
                region_data = {
                    "Region": region,
                    "Message": "Amazon Lex is not available in this region"
                }
            except ClientError as e:
                region_data = {
                    "Region": region,
                    "Error": str(e)
                }

            output.append(region_data)

        return jsonify({"lex_bots": output})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500