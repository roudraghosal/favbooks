import json

def handler(request, response):
    # Example: parse query params
    name = request.query.get("name", "World")
    # Example: return a JSON response
    response.status_code = 200
    response.headers["Content-Type"] = "application/json"
    response.body = json.dumps({"message": f"Hello, {name}! This is a Python serverless function on Vercel."})
