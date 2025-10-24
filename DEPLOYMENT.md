# GitHub Pages Deployment Guide

## 📦 Setup Complete!

Your React app is now configured for GitHub Pages deployment.

## 🚀 Deployment Steps

### 1. Ensure Git Repository is Set Up

```bash
cd "C:\Users\Roudra\Music\project\New folder"
git status
```

If not initialized:
```bash
git init
git add .
git commit -m "Initial commit with GitHub Pages setup"
```

### 2. Connect to GitHub Repository

```bash
git remote add origin https://github.com/roudraghosal/favbooks.git
git branch -M master
git push -u origin master
```

### 3. Deploy to GitHub Pages

```bash
cd frontend
npm run deploy
```

This will:
- Build your React app (`npm run build`)
- Deploy to the `gh-pages` branch
- Your app will be live at: **https://roudraghosal.github.io/favbooks**

### 4. Enable GitHub Pages (First Time Only)

1. Go to your repository: https://github.com/roudraghosal/favbooks
2. Click **Settings** > **Pages**
3. Under "Source", select branch: `gh-pages`
4. Click **Save**
5. Wait 2-3 minutes for deployment

## 🌐 Your Live URL

**Frontend:** https://roudraghosal.github.io/favbooks

## ⚠️ Important Notes

### Backend API
The backend is currently configured to run on `localhost:8000`. For full functionality, you need to:

1. **Deploy Backend** to a cloud service:
   - Heroku
   - Railway
   - Render
   - AWS/Azure/GCP
   - Vercel (serverless)

2. **Update API URL** in `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```

3. **Redeploy Frontend**:
   ```bash
   npm run deploy
   ```

### CORS Configuration
Make sure your backend allows requests from:
```
https://roudraghosal.github.io
```

Update `backend/main.py`:
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

## 🔄 Update and Redeploy

Whenever you make changes:

```bash
cd frontend
npm run deploy
```

## 📝 What Was Changed

### package.json
- Added `homepage` field
- Added `gh-pages` dev dependency
- Added `predeploy` and `deploy` scripts

### App.js
- Added `basename="/favbooks"` to Router for GitHub Pages subdirectory

### .env.production
- Created for production environment variables

## 🐛 Troubleshooting

### Blank Page After Deployment
- Check if `homepage` in package.json matches your repo name
- Verify `basename` in App.js is correct
- Clear browser cache

### 404 Errors on Refresh
- GitHub Pages doesn't support client-side routing by default
- Consider adding a 404.html redirect or using HashRouter

### API Not Working
- Deploy your backend
- Update REACT_APP_API_URL
- Configure CORS properly

## 📚 Resources

- [Create React App Deployment Guide](https://create-react-app.dev/docs/deployment/#github-pages)
- [gh-pages Documentation](https://github.com/tschaub/gh-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
