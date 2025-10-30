import json

def handler(request, response):
    response.status_code = 200
    response.headers["Content-Type"] = "application/json"
    response.body = json.dumps({"status": "healthy"})