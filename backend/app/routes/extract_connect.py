from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError, EndpointConnectionError
from botocore.config import Config
from app.utils.dynamodb import get_account_credentials

connect_bp = Blueprint("connect", __name__)

@connect_bp.route("/extract/connect", methods=["GET"])
def extract_connect():
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

    try:
        ec2 = boto3.client(
            "ec2",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="us-east-1",
            config=retry_config
        )
        regions_response = ec2.describe_regions(AllRegions=True)
        all_regions = [r["RegionName"] for r in regions_response["Regions"]
                       if r["OptInStatus"] in ("opt-in-not-required", "opted-in")]
    except ClientError as e:
        return jsonify({"error": f"Failed to get regions: {str(e)}"}), 500

    output = []

    for region in all_regions:
        try:
            client = boto3.client(
                "connect",
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region,
                config=retry_config
            )
            response = client.list_instances()
            instances = response.get("InstanceSummaryList", [])

            if instances:
                output.append({
                    "Region": region,
                    "Instances": [
                        {
                            "Id": i.get("Id"),
                            "Arn": i.get("Arn"),
                            "ServiceRole": i.get("ServiceRole"),
                            "InstanceAlias": i.get("InstanceAlias"),
                            "CreatedTime": str(i.get("CreatedTime"))
                        } for i in instances
                    ]
                })
            else:
                output.append({
                    "Region": region,
                    "Message": "No Amazon Connect instances found in this region"
                })

        except EndpointConnectionError:
            output.append({
                "Region": region,
                "Message": "Amazon Connect is not available in this region"
            })
        except ClientError as e:
            output.append({
                "Region": region,
                "Error": str(e)
            })

    return jsonify({"connect_instances": output})