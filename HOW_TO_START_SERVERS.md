# 🚀 QUICK FIX - Start Servers

## ✅ SOLUTION

Your servers aren't starting properly. Here's how to fix it:

### **Method 1: Manual Start (RECOMMENDED)**

#### **Step 1: Start Backend**
```powershell
# Open PowerShell terminal and run:
cd "C:\Users\Roudra\Music\project\New folder\backend"
uvicorn main:app --reload
```

**Keep this terminal open!** You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

#### **Step 2: Start Frontend**  
Open a **NEW PowerShell terminal** and run:
```powershell
cd "C:\Users\Roudra\Music\project\New folder\frontend"
npm start
```

**Keep this terminal open too!** You should see:
```
webpack compiled successfully
```

#### **Step 3: Open Browser**
After 15-20 seconds, open:
```
http://localhost:3000
```

---

### **Method 2: Double-Click Batch File**

1. Navigate to: `C:\Users\Roudra\Music\project\New folder`
2. Double-click: **`START-ALL-SERVERS.bat`**
3. Wait 20 seconds
4. Open browser: http://localhost:3000

---

### **Method 3: Use VS Code Terminals**

#### **Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

#### **Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## 🔧 If Servers Won't Start

### **Check for Port Conflicts:**

```powershell
# Check what's using port 8000
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

# Check what's using port 3000  
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# If something is using these ports, kill those processes:
Stop-Process -Id <PROCESS_ID> -Force
```

### **Check if Python/Node are installed:**

```powershell
# Check Python
python --version

# Check Node
node --version
npm --version
```

---

## ✅ How to Know Servers Are Running

### **Backend (Port 8000):**
Visit: http://localhost:8000/health

Should show:
```json
{"status": "healthy"}
```

### **Frontend (Port 3000):**
Visit: http://localhost:3000

Should show: Your homepage with book recommendations

---

## 📊 Server Status Check

Run this command to see if servers are running:

```powershell
Get-Process | Where-Object { $_.ProcessName -like "*uvicorn*" -or $_.ProcessName -like "*node*" } | Select-Object ProcessName, Id, StartTime
```

Should show:
- `uvicorn` process (backend)
- `node` process (frontend)

---

## 🆘 STILL NOT WORKING?

### **Option 1: Restart Everything**

```powershell
# Kill all servers
Get-Process | Where-Object { $_.ProcessName -like "*uvicorn*" } | Stop-Process -Force
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 3

# Start backend
cd "C:\Users\Roudra\Music\project\New folder\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend
cd "C:\Users\Roudra\Music\project\New folder\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
```

### **Option 2: Check Dependencies**

Backend:
```powershell
cd backend
pip install -r requirements.txt
```

Frontend:
```powershell
cd frontend
npm install
```

---

## 🎯 SIMPLEST METHOD - COPY & PASTE

### **Open PowerShell and paste this:**

```powershell
# Go to project folder
cd "C:\Users\Roudra\Music\project\New folder"

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; uvicorn main:app --reload"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start frontend in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"

# Wait 20 seconds
Start-Sleep -Seconds 20

# Open browser
Start-Process "http://localhost:3000"
```

This will:
1. ✅ Start backend automatically
2. ✅ Start frontend automatically
3. ✅ Open browser automatically
4. ✅ Open in separate windows

---

## 📞 After Servers Start

You'll have **3 windows open:**
1. **This PowerShell** - You can close this
2. **Backend Terminal** - Keep open (shows API logs)
3. **Frontend Terminal** - Keep open (shows React logs)
4. **Browser** - Your app!

**Don't close the backend or frontend terminals while using the app!**

---

## ✨ Quick Reference

| What | URL | Status Check |
|------|-----|--------------|
| Backend | http://localhost:8000 | http://localhost:8000/health |
| Frontend | http://localhost:3000 | Just visit it |
| API Docs | http://localhost:8000/docs | Interactive API docs |
| Browse Books | http://localhost:3000/browse | External books page |

---

**Try Method 1 (Manual Start) first - it's most reliable!**
