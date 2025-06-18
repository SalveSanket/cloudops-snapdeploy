import json
import base64
import traceback
from app import create_app
from werkzeug.datastructures import Headers
from werkzeug.wrappers import Response
from werkzeug.test import EnvironBuilder
from werkzeug.wsgi import ClosingIterator

app = create_app()

def handler(event, context):
    path = event.get("rawPath", "/")
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    query_string = event.get("rawQueryString", "")
    headers = Headers(event.get("headers", {}))
    body = event.get("body", "")
    if event.get("isBase64Encoded", False) and isinstance(body, str):
        body = base64.b64decode(body)

    builder = EnvironBuilder(
        method=method,
        path=path,
        query_string=query_string,
        headers=headers,
        data=body,
    )
    env = builder.get_environ()
    builder.close()

    try:
        response = Response.from_app(app, env)
        resp_body = b"".join(response.response)
        return {
            "statusCode": response.status_code,
            "headers": dict(response.headers),
            "body": resp_body.decode("utf-8"),
            "isBase64Encoded": False,
        }
    except Exception as e:
        traceback.print_exc()
        return {
            "statusCode": 503,
            "body": json.dumps({"message": "Service Unavailable", "error": str(e)}),
            "headers": {"Content-Type": "application/json"},
            "isBase64Encoded": False,
        }