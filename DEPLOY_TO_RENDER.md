# Deploy FavBooks to Render

## Prerequisites
✅ Your code is already on GitHub (roudraghosal/favbooks)
✅ render.yaml configuration file is set up

## Deployment Steps

### 1. Sign up/Login to Render
- Go to https://render.com
- Sign up with your GitHub account

### 2. Deploy from GitHub

#### Option A: Using render.yaml (Recommended - One Click Deploy)
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if not already connected
4. Select the **`favbooks`** repository
5. Render will automatically detect the `render.yaml` file
6. Click **"Apply"** to deploy both backend and frontend
7. Wait for the build to complete (5-10 minutes)

#### Option B: Manual Service Creation

**Backend Service:**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `roudraghosal/favbooks`
3. Configure:
   - **Name:** `favbooks-backend`
   - **Region:** Oregon (or your preferred region)
   - **Branch:** `master`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `PYTHON_VERSION` = `3.11`
   - `DATABASE_URL` = `sqlite:///./bookdb.sqlite3`
5. Click **"Create Web Service"**

**Frontend Service:**
1. Click **"New +"** → **"Static Site"**
2. Connect the same repository: `roudraghosal/favbooks`
3. Configure:
   - **Name:** `favbooks-frontend`
   - **Branch:** `master`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Set Environment Variable:
   - `REACT_APP_API_URL` = [Your backend URL from step above]
   - Example: `https://favbooks-backend.onrender.com`
5. Click **"Create Static Site"**

### 3. Configure CORS
After backend is deployed, update `backend/main.py` to include your Render URLs:
```python
allow_origins=[
    "http://localhost:3000",
    "https://your-frontend-app.onrender.com",  # Add your Render frontend URL
    # ... other origins
]
```

### 4. Important Notes

**Database:**
- Currently using SQLite which works on Render's free tier
- For production, consider upgrading to PostgreSQL
- SQLite data will be lost when the service restarts on free tier

**Free Tier Limitations:**
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free (shared across services)
- No persistent storage for free tier

**Upgrade Recommendations:**
1. Use PostgreSQL for persistent database
2. Consider paid tier for 24/7 uptime
3. Set up environment-specific configurations

### 5. Update Your Code for Production

**Frontend (.env.production):**
Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://favbooks-backend.onrender.com
```

**Backend Updates:**
Add your Render URLs to CORS in `backend/main.py`

### 6. Monitor Deployment
- Check logs in Render dashboard
- Test all endpoints work
- Verify CORS is properly configured
- Check that database is initialized

## Troubleshooting

**Build Fails:**
- Check build logs in Render dashboard
- Verify all dependencies are in requirements.txt/package.json
- Ensure Python/Node versions are compatible

**CORS Errors:**
- Add your Render frontend URL to backend CORS allowed origins
- Redeploy backend after updating CORS

**Database Empty:**
- Free tier SQLite gets wiped on restart
- Run database initialization script
- Consider upgrading to PostgreSQL

## Useful Commands

**View Logs:**
Access through Render dashboard → Your Service → Logs

**Redeploy:**
Render auto-deploys on git push to master branch

**Manual Deploy:**
Dashboard → Your Service → Manual Deploy

## Your Deployed URLs
After deployment, you'll get:
- **Backend:** `https://favbooks-backend.onrender.com`
- **Frontend:** `https://favbooks-frontend.onrender.com`

Update these in your environment variables and CORS settings!
