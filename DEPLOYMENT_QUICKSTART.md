# 🚀 Quick Deployment Guide for Task Management System

## GitHub Repository
Your code is at: https://github.com/tejinderpa/Task-Management

---

## ⚡ FASTEST DEPLOYMENT (Recommended - 30 minutes total)

### Option 1: Vercel + Render + MongoDB Atlas (FREE)

#### Step 1: Deploy MongoDB Atlas (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up → Create **FREE M0 Cluster**
3. Choose **AWS** → Region closest to you → Create
4. Security Quickstart:
   - Username: `taskadmin`
   - Password: `<generate-strong-password>` (save it!)
   - Click "Create User"
5. IP Access: Add IP Address → `0.0.0.0/0` → Add Entry
6. Click "Finish and Close"
7. Click "Connect" → "Drivers" → Copy connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://taskadmin:YourPassword@cluster0.xxxxx.mongodb.net/`

#### Step 2: Deploy Backend to Render (10 minutes)

1. Go to [Render.com](https://render.com) → Sign up with GitHub
2. Dashboard → **New +** → **Web Service**
3. Connect repository: `tejinderpa/Task-Management`
4. Configure:
   ```
   Name: task-management-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node src/index.js
   Instance Type: Free
   ```

5. **Environment Variables** - Click "Add Environment Variable" for each:
   ```
   NODE_ENV=production
   PORT=8000
   MONGODB_URI=mongodb+srv://taskadmin:YourPassword@cluster0.xxxxx.mongodb.net/
   DB_NAME=task_management_db
   ACCESS_TOKEN_SECRET=<generate-using-command-below>
   REFRESH_TOKEN_SECRET=<generate-using-command-below>
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   EMAIL_VERIFICATION_SECRET=<generate-using-command-below>
   CORS_ORIGIN=*
   LOG_LEVEL=info
   ```
   
   **Generate Strong Secrets (run locally in PowerShell):**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Run this 3 times to get 3 different secrets
   ```

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. Copy your backend URL: `https://task-management-backend-xxxx.onrender.com`
9. Test: Visit `https://your-backend-url/health` - should show "Server is running"

#### Step 3: Deploy Frontend to Vercel (5 minutes)

1. Go to [Vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New"** → **"Project"**
3. Import `tejinderpa/Task-Management`
4. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Environment Variables** - Add this:
   ```
   VITE_API_URL=https://task-management-backend-xxxx.onrender.com/api/v1
   ```
   (Replace with your actual Render backend URL from Step 2)

6. Click **"Deploy"**
7. Wait 3-5 minutes
8. Copy your Vercel URL: `https://your-app.vercel.app`
9. Your app is live! 🎉

#### Step 4: Update CORS on Backend (2 minutes)

1. Go back to Render.com → Your backend service
2. Environment → Find `CORS_ORIGIN`
3. Click Edit → Change from `*` to your Vercel URL: `https://your-app.vercel.app`
4. Save → Service will auto-redeploy (2-3 minutes)

#### Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Click "Register" → Create a new account
3. Login with your credentials
4. Create a test task
5. ✅ Success! Your app is deployed!

---

## 🔥 Alternative Option 2: Railway (All-in-One - 20 minutes)

### Deploy Everything to Railway

1. Go to [Railway.app](https://railway.app) → Sign up with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Select `tejinderpa/Task-Management`

#### Add MongoDB Database:
1. In your project → **New** → **Database** → **Add MongoDB**
2. Click on MongoDB → **Variables** tab
3. Copy `MONGO_URL` value

#### Configure Backend:
1. Click on `backend` service
2. **Settings**:
   - Root Directory: `backend`
   - Start Command: `node src/index.js`
3. **Variables** → Add all from Step 2 above
   - Use Railway's `MONGO_URL` for `MONGODB_URI`
4. Copy the generated backend URL (under Deployments)

#### Configure Frontend:
1. Click on `frontend` service
2. **Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: Leave empty (will auto-detect)
3. **Variables** → Add:
   ```
   VITE_API_URL=https://your-backend.railway.app/api/v1
   ```

4. Both services will auto-deploy! 🚀
5. Click on frontend service → Copy the URL
6. Update backend `CORS_ORIGIN` with frontend URL

---

## 🐳 Option 3: Docker on VPS (DigitalOcean/AWS/Azure)

### Prerequisites:
- A VPS with Ubuntu 22.04 (1GB RAM minimum)
- Domain name (optional)
- SSH access

### Quick Setup Commands:

```powershell
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone repository
git clone https://github.com/tejinderpa/Task-Management.git
cd Task-Management/backend

# 4. Create .env file
nano .env
# Copy environment variables from backend/.env.example
# Update with your actual values

# 5. Start services with Docker Compose
docker-compose up -d

# 6. Check status
docker-compose ps
docker-compose logs -f backend

# 7. Test
curl http://localhost:8000/health
```

### Setup Nginx Reverse Proxy (Optional - for domain):

```bash
# Install Nginx
sudo apt update && sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/taskmanagement
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/taskmanagement /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get free SSL certificate
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend `/health` endpoint works
- [ ] MongoDB connection successful  
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Can create/edit/delete tasks
- [ ] CORS configured correctly
- [ ] Environment variables are secure
- [ ] Backend logs are accessible

---

## 🧪 Testing Your Deployment

### Test Backend API:
```powershell
# Health check
curl https://your-backend-url.com/health

# Register user
curl -X POST https://your-backend-url.com/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test123!@","fullName":"Test User","username":"testuser"}'

# Login
curl -X POST https://your-backend-url.com/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test123!@"}'
```

### Test Frontend:
1. Visit your Vercel/Railway URL
2. Register a new user
3. Login
4. Create a task with title and description
5. Change task status (Todo → In Progress → Completed)
6. Test all features

---

## 🐛 Common Issues & Solutions

### Issue: Backend won't start on Render
**Solution:**
- Check Render logs for errors
- Verify `MONGODB_URI` format is correct
- Ensure all required environment variables are set
- Confirm `PORT=8000` is set

### Issue: Frontend can't connect to backend
**Solution:**
- Verify `VITE_API_URL` matches your backend URL exactly
- Check browser console (F12) for errors
- Ensure backend URL ends with `/api/v1`
- Clear browser cache and reload

### Issue: CORS errors in browser
**Solution:**
- Update `CORS_ORIGIN` in backend to match frontend URL
- No trailing slash in URLs
- Wait for backend to redeploy after changing CORS

### Issue: MongoDB connection failed
**Solution:**
- Verify MongoDB Atlas cluster is running
- Check IP whitelist includes `0.0.0.0/0`
- Confirm username/password in connection string
- Test connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/`

### Issue: Render free instance sleeping
**Solution:**
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Use a service like [UptimeRobot](https://uptimerobot.com) to ping every 5 minutes
- Or upgrade to Render paid tier ($7/month)

---

## 🔐 Security Best Practices

1. **Strong Secrets**: Always generate random 32+ character secrets
2. **CORS**: Set to specific frontend URL, not `*` in production
3. **HTTPS**: Free with Vercel/Render
4. **MongoDB**: Use strong passwords, restrict IP access when possible
5. **Environment Variables**: Never commit `.env` files to git
6. **Rate Limiting**: Already configured in your backend
7. **Input Validation**: Already implemented with express-validator

---

## 💰 Cost Breakdown

### FREE Tier (Perfect for learning/testing):
- **Frontend (Vercel)**: FREE forever
- **Backend (Render)**: FREE (with sleep after inactivity)
- **Database (MongoDB Atlas)**: FREE (512MB storage, good for ~50k tasks)
- **Domain**: Optional ($10-15/year)
- **Total**: $0/month

### Production Tier (No sleep, better performance):
- **Frontend (Vercel)**: FREE or $20/month (Pro)
- **Backend (Render Starter)**: $7/month
- **Database (MongoDB M10)**: $57/month (Shared cluster)
- **Total**: ~$64-84/month

---

## 📊 Monitoring (Optional but Recommended)

### Free Monitoring Tools:
1. **Render**: Built-in metrics and logs
2. **Vercel**: Analytics dashboard (included)
3. **MongoDB Atlas**: Performance monitoring (included)
4. **UptimeRobot**: Uptime monitoring (free tier: https://uptimerobot.com)

### Setup UptimeRobot:
1. Sign up at uptimerobot.com
2. Add New Monitor → HTTP(s)
3. URL: `https://your-backend-url.com/health`
4. Monitoring Interval: 5 minutes
5. Get email alerts if backend goes down

---

## 🔄 Updating Your Deployment

### For Vercel & Render (Auto-deploy):
```powershell
# Make your changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel and Render will auto-deploy!
# Check deployment status on their dashboards
```

### For Docker VPS:
```bash
# SSH into your server
ssh root@your-server-ip
cd Task-Management

# Pull latest changes
git pull origin main

# Restart services
cd backend
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

---

## 🚀 Quick Commands Reference

```powershell
# Generate secure secret keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test backend locally
cd backend
npm install
npm run dev

# Test frontend locally
cd frontend
npm install
npm run dev

# Build frontend for production
npm run build

# Docker commands (on VPS)
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f        # View logs
docker-compose restart        # Restart
docker-compose ps             # Status

# Git commands
git add .
git commit -m "Your message"
git push origin main
```

---

## 📚 Additional Resources

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Railway Docs**: https://docs.railway.app
- **Your Backend API Docs**: See backend/API_TESTING.md

---

## 📞 Need Help?

- **GitHub Issues**: https://github.com/tejinderpa/Task-Management/issues
- **Check backend logs on Render**: Dashboard → Your Service → Logs
- **Check Vercel deployment logs**: Your Project → Deployments → View Logs
- **MongoDB Atlas support**: Support tab in Atlas dashboard

---

## 🎉 Success!

**Your Task Management System is now live and accessible worldwide!**

**What's Next?**
- ✅ Share your app URL with friends/team
- ✅ Add your custom domain (optional)
- ✅ Setup email notifications (see backend/EMAIL_NOTIFICATIONS.md)
- ✅ Monitor your app's performance
- ✅ Keep dependencies updated

**Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`
- Health Check: `https://your-backend.onrender.com/health`

🚀 **Happy Task Managing!**

## GitHub Repository
Your code is at: https://github.com/tejinderpa/Task-Management

---

## ⚡ FASTEST DEPLOYMENT (Recommended)

### Option 1: Vercel + Render + MongoDB Atlas (FREE)

#### Step 1: Deploy MongoDB (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up → Create **FREE M0 Cluster**
3. Choose **AWS** → Region closest to you → Create
4. Security Quickstart:
   - Username: `taskadmin`
   - Password: `<generate-strong-password>` (save it!)
   - Click "Create User"
5. IP Access: Add IP Address → `0.0.0.0/0` → Add Entry
6. Click "Finish and Close"
7. Click "Connect" → "Drivers" → Copy connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://taskadmin:YourPassword@cluster0.xxxxx.mongodb.net/`

#### Step 2: Deploy Backend to Render (10 minutes)

1. Go to [Render.com](https://render.com) → Sign up with GitHub
2. Dashboard → **New +** → **Web Service**
3. Connect repository: `tejinderpa/Task-Management`
4. Configure:
   ```
   Name: task-management-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node src/index.js
   Instance Type: Free
   ```

5. **Environment Variables** (click "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=8000
   MONGODB_URI=mongodb+srv://taskadmin:YourPassword@cluster0.xxxxx.mongodb.net/
   DB_NAME=task_management_db
   ACCESS_TOKEN_SECRET=your-super-secret-access-key-minimum-32-characters-long-abc123
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-minimum-32-characters-long-xyz789
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   EMAIL_VERIFICATION_SECRET=your-email-verification-secret-key-32-chars-min-def456
   CORS_ORIGIN=*
   LOG_LEVEL=info
   ```
   
   **Generate Strong Secrets:**
   ```bash
   # Run these commands locally to generate secure secrets:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. Copy your backend URL: `https://task-management-backend-xxxx.onrender.com`
9. Test: Visit `https://task-management-backend-xxxx.onrender.com/health`

#### Step 3: Update Frontend Configuration (2 minutes)

1. **Update frontend API base URL:**

<function_calls>
<invoke name="read_file">
<parameter name="filePath">f:\Task Management\frontend\src\services\api.js