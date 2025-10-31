import json

def handler(event, context):
    # Example: parse query params
    query_params = event.get("queryStringParameters") or {}
    name = query_params.get("name", "World")
    # Example: return a JSON response
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"message": f"Hello, {name}! This is a Python serverless function on Vercel."})
    }
