import json
import os

def handler(event, context):
    try:
        # Check environment variables
        db_url = os.getenv("DATABASE_URL", "not set")
        secret_key = os.getenv("SECRET_KEY", "not set")
        algorithm = os.getenv("ALGORITHM", "not set")

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "healthy",
                "timestamp": "2025-10-30",
                "environment": {
                    "database_configured": db_url != "not set",
                    "secret_key_configured": secret_key != "not set",
                    "algorithm_configured": algorithm != "not set"
                },
                "message": "Vercel serverless function is working!"
            })
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "error",
                "error": str(e)
            })
        }