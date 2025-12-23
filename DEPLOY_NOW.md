# 🚀 Deploy Your Task Management App NOW!

## ✅ Your code is on GitHub
Repository: https://github.com/tejinderpa/Task-Management

---

## ⚡ FASTEST PATH TO DEPLOYMENT (30 minutes)

### Step 1: MongoDB Atlas (5 min)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create FREE cluster
3. Create user & Get connection string
4. Save this: `mongodb+srv://username:password@cluster.mongodb.net/`

### Step 2: Deploy Backend (10 min)
1. Go to https://render.com (sign up with GitHub)
2. New → Web Service → Connect `tejinderpa/Task-Management`
3. Settings:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `node src/index.js`
4. Add Environment Variables (click "Add"):
   ```
   NODE_ENV=production
   PORT=8000
   MONGODB_URI=<your-mongodb-string-from-step-1>
   DB_NAME=task_management_db
   ACCESS_TOKEN_SECRET=<generate-with-command-below>
   REFRESH_TOKEN_SECRET=<generate-with-command-below>
   EMAIL_VERIFICATION_SECRET=<generate-with-command-below>
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   CORS_ORIGIN=*
   LOG_LEVEL=info
   ```
   
   **Generate secrets locally:**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Run 3 times for 3 secrets!

5. Click "Create" → Wait 5 minutes
6. Copy your URL: `https://task-management-backend-xxxx.onrender.com`

### Step 3: Deploy Frontend (10 min)
1. Go to https://vercel.com (sign up with GitHub)
2. New Project → Import `tejinderpa/Task-Management`
3. Settings:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Output: `dist`
4. Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url-from-step-2/api/v1
   ```
5. Click "Deploy" → Wait 3 minutes
6. Copy your URL: `https://your-app.vercel.app`

### Step 4: Update CORS (2 min)
1. Back to Render → Your backend → Environment
2. Edit `CORS_ORIGIN`: Change `*` to `https://your-app.vercel.app`
3. Save → Auto-redeploys

### Step 5: TEST! ✅
1. Visit `https://your-app.vercel.app`
2. Register → Login → Create tasks
3. **YOU'RE LIVE!** 🎉

---

## 📖 Detailed Guide
See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for complete instructions.

## 🐛 Issues?
- Backend won't start? Check Render logs
- Frontend can't connect? Verify `VITE_API_URL`
- CORS errors? Update backend `CORS_ORIGIN`
- MongoDB failed? Check connection string format

## 💰 Cost
**Everything is FREE!**
- Vercel: FREE
- Render: FREE (sleeps after 15 min)
- MongoDB Atlas: FREE (512MB)

---

**Your app will be live in 30 minutes! Let's go! 🚀**
