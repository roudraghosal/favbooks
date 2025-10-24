# Render Deployment Guide for FastAPI Backend

## 🚀 Quick Deploy to Render.com (FREE)

### Step 1: Prepare Repository

Your backend code is ready in the `backend/` folder.

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Authorize Render to access your repositories

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Select your repository: `roudraghosal/favbooks`
3. Configure deployment:

   **Basic Settings:**
   - **Name:** `favbooks-api` (or any name you prefer)
   - **Region:** Choose closest to your users
   - **Branch:** `master`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`

   **Build & Deploy:**
   - **Build Command:** 
     ```bash
     pip install -r requirements.txt
     ```
   
   - **Start Command:**
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

4. **Environment Variables** (if needed):
   - Add any secrets from your `.env` file
   - Click "Add Environment Variable"

5. Click **"Create Web Service"**

### Step 4: Wait for Deployment

- First deployment takes 3-5 minutes
- Watch the logs for any errors
- When complete, you'll get a URL like:
  `https://favbooks-api.onrender.com`

### Step 5: Update Frontend

1. Open `frontend/.env.production`
2. Update the API URL:
   ```
   REACT_APP_API_URL=https://favbooks-api.onrender.com
   ```

3. Redeploy frontend:
   ```bash
   cd frontend
   npm run deploy
   ```

### Step 6: Update CORS in Backend

Update `backend/main.py` to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://roudraghosal.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then commit and push - Render will auto-deploy!

## 🔧 Alternative: Railway.app

### Quick Setup:

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `roudraghosal/favbooks`
5. Railway auto-detects Python
6. Set environment variables if needed
7. Deploy!

## 💡 Alternative: Use ngrok for Testing

If you just want to test temporarily:

```bash
# Install ngrok
# Download from https://ngrok.com

# Run your backend
uvicorn main:app --host 127.0.0.1 --port 8000

# In another terminal
ngrok http 8000

# Copy the https URL and update frontend/.env.production
```

**Note:** ngrok URLs change each time you restart, and only work while your PC is running.

## ✅ After Backend Deployment

Your complete app will be:
- **Frontend:** https://roudraghosal.github.io/favbooks
- **Backend:** https://your-app.onrender.com (or railway.app)

Both will be accessible worldwide! 🌍

## 🐛 Troubleshooting

### Database Issues
Render free tier doesn't include a database. Options:
1. Use SQLite (file-based, included in deployment)
2. Upgrade to paid PostgreSQL
3. Use external free DB (MongoDB Atlas, PlanetScale)

### Cold Starts
Free tier "spins down" after 15 minutes of inactivity:
- First request takes 30-60 seconds
- Subsequent requests are fast
- Consider paid tier for 24/7 uptime

### Build Failures
Check logs in Render dashboard:
- Missing dependencies in requirements.txt
- Python version issues
- Import errors
