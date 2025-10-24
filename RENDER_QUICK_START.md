# 🚀 Quick Render Deployment Checklist

## ✅ Step-by-Step Deployment

### 1️⃣ Sign Up
- [ ] Go to https://render.com
- [ ] Click "Sign in with GitHub"
- [ ] Authorize Render

### 2️⃣ Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Select repository: **roudraghosal/favbooks**

### 3️⃣ Configuration
Copy these settings **exactly**:

```
Name: favbooks-api
Region: Oregon (or closest)
Branch: master
Root Directory: backend
Runtime: Python 3

Build Command:
pip install -r requirements.txt

Start Command:
uvicorn main:app --host 0.0.0.0 --port $PORT

Instance Type: Free
```

### 4️⃣ Deploy
- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes
- [ ] Check logs for errors
- [ ] Wait for "Live ✅" status

### 5️⃣ Copy Backend URL
Example: `https://favbooks-api.onrender.com`

---

## 📝 After Backend is Live

### Update Frontend Environment
1. Open: `frontend/.env.production`
2. Change:
   ```
   REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com
   ```
   Replace with your actual Render URL!

### Redeploy Frontend
```bash
cd frontend
npm run deploy
```

### Test Your App
- Frontend: https://roudraghosal.github.io/favbooks
- Backend: https://YOUR-BACKEND-URL.onrender.com/health
- API Docs: https://YOUR-BACKEND-URL.onrender.com/docs

---

## ⚠️ Important Notes

### Free Tier Limitations
- Spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Then works normally

### Database
- SQLite database is included
- File-based, stored with deployment
- Persists between restarts

### CORS Already Configured
Your backend already allows:
- `https://roudraghosal.github.io`
- `http://localhost:3000`

---

## 🐛 Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Verify `requirements.txt` is complete
- Check Python version compatibility

### App Won't Start
- Verify Start Command is exact:
  `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Check for import errors in logs

### 404 on Backend URL
- Wait for deployment to complete
- Check "Events" tab for status
- Verify service is "Live"

---

## ✅ Success Checklist

When deployment works, you should see:
- [ ] Green "Live" badge on Render
- [ ] Backend URL loads: `https://your-url.onrender.com`
- [ ] Health endpoint works: `/health` returns `{"status":"healthy"}`
- [ ] API docs available: `/docs` shows Swagger UI
- [ ] Frontend can connect (after updating .env.production)

---

**Need Help?** Check BACKEND_DEPLOYMENT.md for detailed guide!
