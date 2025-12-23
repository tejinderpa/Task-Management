# 🐳 Docker VPS Deployment Guide

## Complete Step-by-Step Guide to Deploy on DigitalOcean/AWS/Azure

---

## 📋 Prerequisites

- Credit/Debit card for VPS provider
- Domain name (optional but recommended) - $10-15/year from Namecheap/GoDaddy
- SSH client (PowerShell on Windows, Terminal on Mac/Linux)
- 60-90 minutes of time

---

## 🎯 STEP 1: Choose & Setup VPS Provider

### Option A: DigitalOcean (Recommended - Easiest)

#### 1.1 Create Account
1. Go to https://www.digitalocean.com
2. Sign up (get $200 credit for 60 days with referral)
3. Add payment method

#### 1.2 Create Droplet
1. Click **"Create"** → **"Droplets"**
2. Choose Configuration:
   ```
   Image: Ubuntu 22.04 LTS x64
   Plan: Basic
   CPU Options: Regular (Shared CPU)
   Size: $6/month (1GB RAM, 1 vCPU, 25GB SSD) - Minimum
         $12/month (2GB RAM, 1 vCPU, 50GB SSD) - Recommended
   ```

3. Choose Datacenter Region:
   - Select closest to your target users
   - Example: New York, Singapore, London, etc.

4. Authentication:
   - **SSH Key (Recommended)**:
     ```powershell
     # Generate SSH key locally
     ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
     # Press Enter for default location
     # Press Enter twice for no passphrase
     
     # View your public key
     cat ~/.ssh/id_rsa.pub
     # Or on Windows:
     type $env:USERPROFILE\.ssh\id_rsa.pub
     ```
     Copy the output and paste in DigitalOcean
   
   - **OR Password**: Set a strong root password

5. Hostname: `task-management-app`

6. Click **"Create Droplet"**

7. Wait 1-2 minutes → Copy your droplet's IP address

---

### Option B: AWS EC2

#### 1.1 Create Account
1. Go to https://aws.amazon.com
2. Sign up for AWS account
3. Complete verification

#### 1.2 Launch EC2 Instance
1. Go to EC2 Dashboard
2. Click **"Launch Instance"**
3. Configure:
   ```
   Name: task-management-app
   AMI: Ubuntu Server 22.04 LTS
   Instance Type: t2.micro (Free tier) or t2.small ($17/month)
   Key Pair: Create new → Download .pem file (SAVE THIS!)
   Network: Allow SSH, HTTP, HTTPS
   Storage: 20GB gp3
   ```

4. Click **"Launch Instance"**
5. Wait 2-3 minutes → Copy Public IPv4 address

---

### Option C: Azure

#### 1.1 Create Account
1. Go to https://azure.microsoft.com
2. Sign up (get $200 credit for 30 days)

#### 1.2 Create Virtual Machine
1. Portal → **"Virtual Machines"** → **"Create"**
2. Configure:
   ```
   VM Name: task-management-app
   Region: Choose closest
   Image: Ubuntu Server 22.04 LTS
   Size: B1s (1 vCPU, 1GB RAM) or B2s (2 vCPU, 4GB RAM)
   Authentication: SSH public key
   ```

3. Networking: Allow ports 22, 80, 443
4. Click **"Review + Create"**
5. Copy Public IP address

---

## 🔐 STEP 2: Connect to Your Server

### DigitalOcean/Azure (Password or SSH Key):
```powershell
# Connect via SSH
ssh root@YOUR_SERVER_IP

# First time: type 'yes' to continue
# Enter password if prompted
```

### AWS EC2 (Using .pem file):
```powershell
# Set permissions (Mac/Linux)
chmod 400 your-key.pem

# Connect
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# On Windows, use PuTTY or WSL
```

**You're now connected to your server! 🎉**

---

## 🛠️ STEP 3: Initial Server Setup

### 3.1 Update System
```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# This takes 3-5 minutes
```

### 3.2 Create Non-Root User (Recommended for AWS, optional for DO)
```bash
# If you're root (DigitalOcean), create deploy user
adduser deploy
# Set password when prompted
# Press Enter for all other prompts

# Add to sudo group
usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

For AWS: You're already `ubuntu` user, skip this.

---

## 🐳 STEP 4: Install Docker & Docker Compose

### 4.1 Install Docker
```bash
# Download Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh

# Run installation
sudo sh get-docker.sh

# Add current user to docker group (no sudo needed)
sudo usermod -aG docker $USER

# Activate group changes
newgrp docker

# Verify installation
docker --version
# Should show: Docker version 24.x.x
```

### 4.2 Install Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
# Should show: Docker Compose version v2.x.x
```

### 4.3 Test Docker
```bash
# Test Docker installation
docker run hello-world

# You should see "Hello from Docker!"
```

**Docker is ready! ✅**

---

## 📦 STEP 5: Clone & Configure Your Application

### 5.1 Install Git
```bash
sudo apt install git -y
git --version
```

### 5.2 Clone Repository
```bash
# Clone your repo
git clone https://github.com/tejinderpa/Task-Management.git

# Navigate to backend
cd Task-Management/backend

# List files
ls -la
```

### 5.3 Create Environment File
```bash
# Create .env file
nano .env
```

**Paste this configuration** (press Ctrl+Shift+V):
```env
# Server Configuration
PORT=8000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://admin:admin123@mongodb:27017
DB_NAME=task_management_db

# JWT Configuration - GENERATE THESE LOCALLY!
ACCESS_TOKEN_SECRET=your-super-secret-access-key-minimum-32-characters-long-abc123
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-minimum-32-characters-long-xyz789
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email Verification
EMAIL_VERIFICATION_SECRET=your-email-verification-secret-key-32-chars-min-def456

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

**🔐 IMPORTANT: Generate Real Secrets!**

On your **LOCAL machine** (not server), run:
```powershell
# Generate 3 secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy each secret and replace the placeholder values in the .env file.

**Save file**: `Ctrl+X`, then `Y`, then `Enter`

---

## 🚀 STEP 6: Deploy with Docker Compose

### 6.1 Review docker-compose.yml
```bash
# View the docker-compose configuration
cat docker-compose.yml
```

Your existing `docker-compose.yml` is already configured!

### 6.2 Start Services
```bash
# Start all services in detached mode
docker-compose up -d

# This will:
# 1. Pull MongoDB image (~2 minutes)
# 2. Build backend image (~3-5 minutes)
# 3. Start containers

# Watch the build process
docker-compose up -d --build
```

### 6.3 Check Status
```bash
# View running containers
docker-compose ps

# Should show:
# - task_management_mongodb (healthy)
# - task_management_backend (healthy)

# View logs
docker-compose logs -f backend

# Press Ctrl+C to exit logs
```

### 6.4 Test Backend
```bash
# Test health endpoint
curl http://localhost:8000/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

**Your backend is running! 🎉**

---

## 🌐 STEP 7: Configure Nginx Reverse Proxy

### Why Nginx?
- Serve app on port 80 (HTTP) instead of 8000
- Add SSL/HTTPS support
- Better performance and security
- Use custom domain

### 7.1 Install Nginx
```bash
sudo apt install nginx -y

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 7.2 Configure Firewall
```bash
# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Backend (temporary)

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 7.3 Create Nginx Configuration
```bash
# Create config file
sudo nano /etc/nginx/sites-available/taskmanagement
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Replace with your IP or domain

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for slow connections
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Optional: Serve frontend (if you build it on server)
    # location / {
    #     root /var/www/taskmanagement;
    #     try_files $uri $uri/ /index.html;
    # }
}
```

**Replace `YOUR_SERVER_IP`** with your actual server IP.

**Save**: `Ctrl+X`, `Y`, `Enter`

### 7.4 Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/taskmanagement /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"

# Restart Nginx
sudo systemctl restart nginx
```

### 7.5 Test Nginx
```bash
# Test from server
curl http://localhost/health

# Test from your local machine (replace with your IP)
# In PowerShell on your LOCAL machine:
# curl http://YOUR_SERVER_IP/health
```

**Nginx is configured! ✅**

---

## 🔒 STEP 8: Setup Domain & SSL (Optional but Recommended)

### 8.1 Configure Domain (if you have one)

#### A. Point Domain to Server
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. DNS Management → Add A Record:
   ```
   Type: A
   Host: @
   Value: YOUR_SERVER_IP
   TTL: Automatic
   ```
3. Add www subdomain:
   ```
   Type: A
   Host: www
   Value: YOUR_SERVER_IP
   TTL: Automatic
   ```
4. Wait 5-30 minutes for DNS propagation

#### B. Update Nginx Config
```bash
sudo nano /etc/nginx/sites-available/taskmanagement
```

Change `server_name YOUR_SERVER_IP;` to:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Save and restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 8.2 Install SSL Certificate (FREE with Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms (Y)
# - Share email (N)
# - Redirect HTTP to HTTPS (2)

# Certbot automatically configures Nginx for HTTPS!
```

### 8.3 Test Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Should show: "Congratulations, all simulations succeeded"
```

**SSL is active! 🔒 Your site is now HTTPS!**

---

## 🎨 STEP 9: Deploy Frontend (Optional - Deploy on Server)

### Option 1: Keep Frontend on Vercel (Recommended)
Just update the API URL in Vercel:
```
VITE_API_URL=http://YOUR_SERVER_IP/api/v1
# Or with domain:
VITE_API_URL=https://yourdomain.com/api/v1
```

### Option 2: Serve Frontend from VPS

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Navigate to frontend
cd ~/Task-Management/frontend

# Install dependencies
npm install

# Create production env
echo "VITE_API_URL=http://YOUR_SERVER_IP/api/v1" > .env.production

# Build frontend
npm run build

# Copy to web directory
sudo mkdir -p /var/www/taskmanagement
sudo cp -r dist/* /var/www/taskmanagement/

# Set permissions
sudo chown -R www-data:www-data /var/www/taskmanagement

# Nginx is already configured to serve from this directory!
# Uncomment the frontend location block in nginx config
```

Now visit: `http://YOUR_SERVER_IP` 🎉

---

## 📊 STEP 10: Manage Your Application

### Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs mongodb
docker-compose logs -f backend  # Follow logs

# Restart services
docker-compose restart
docker-compose restart backend

# Stop services
docker-compose stop

# Start services
docker-compose start

# Stop and remove containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View container stats (CPU, Memory)
docker stats
```

### Update Application

```bash
# Navigate to project
cd ~/Task-Management

# Pull latest changes
git pull origin main

# Rebuild and restart
cd backend
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

### Database Backup

```bash
# Backup MongoDB
docker exec task_management_mongodb mongodump \
  --db task_management_db \
  --out /data/backup/$(date +%Y%m%d)

# Copy backup to host
docker cp task_management_mongodb:/data/backup ./backups/

# Restore from backup
docker exec task_management_mongodb mongorestore \
  --db task_management_db \
  /data/backup/20241223/task_management_db
```

### Monitor Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top
# Press 'q' to exit

# Check Docker disk usage
docker system df
```

---

## 🧪 STEP 11: Test Your Deployment

### Test Backend API
```bash
# On server
curl http://localhost:8000/health

# From local machine (replace with your IP/domain)
curl http://YOUR_SERVER_IP/health
curl http://YOUR_SERVER_IP/api/v1/health
```

### Test Frontend (if deployed on VPS)
```bash
# Visit in browser
http://YOUR_SERVER_IP
# Or
https://yourdomain.com
```

### Create Test User
```bash
# Register
curl -X POST http://YOUR_SERVER_IP/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@",
    "fullName": "Test User",
    "username": "testuser"
  }'

# Login
curl -X POST http://YOUR_SERVER_IP/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@"
  }'
```

---

## 🔧 STEP 12: Update Backend CORS

### Update for Production

```bash
# Edit .env file
cd ~/Task-Management/backend
nano .env
```

Update `CORS_ORIGIN`:
```env
# If frontend is on Vercel:
CORS_ORIGIN=https://your-app.vercel.app

# If frontend is on same VPS:
CORS_ORIGIN=http://YOUR_SERVER_IP

# If using domain:
CORS_ORIGIN=https://yourdomain.com

# Multiple origins (comma-separated):
CORS_ORIGIN=https://yourdomain.com,https://your-app.vercel.app
```

Save and restart:
```bash
docker-compose restart backend
```

---

## 📈 STEP 13: Performance Optimization (Optional)

### Enable Nginx Caching
```bash
sudo nano /etc/nginx/sites-available/taskmanagement
```

Add caching directives:
```nginx
# Add at top of server block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;

# In location /api block, add:
proxy_cache api_cache;
proxy_cache_valid 200 5m;
proxy_cache_use_stale error timeout invalid_header updating;
add_header X-Cache-Status $upstream_cache_status;
```

### Enable Gzip Compression
```bash
sudo nano /etc/nginx/nginx.conf
```

Uncomment gzip lines:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### Backend Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. MongoDB not ready - wait 30 seconds and check again
# 2. Port conflict - change PORT in .env
# 3. Environment variables - verify .env file

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### MongoDB Connection Failed
```bash
# Check MongoDB status
docker-compose logs mongodb

# Test connection
docker exec -it task_management_mongodb mongosh

# Should open MongoDB shell
# Type 'exit' to quit

# Restart MongoDB
docker-compose restart mongodb
```

### Can't Access from Browser
```bash
# Check if services are running
docker-compose ps

# Check if ports are open
sudo netstat -tulpn | grep 8000
sudo netstat -tulpn | grep 80

# Check firewall
sudo ufw status

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### High Memory Usage
```bash
# Check container memory
docker stats

# Restart containers
docker-compose restart

# If persistent, upgrade VPS to 2GB RAM
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

---

## 💰 Cost Summary

### DigitalOcean
- **Droplet**: $6-12/month
- **Backups**: $1.20-2.40/month (optional)
- **Domain**: $10-15/year
- **Total**: ~$7-15/month

### AWS EC2
- **t2.micro**: FREE (first year) then ~$8/month
- **t2.small**: ~$17/month
- **EBS Storage**: $1-2/month
- **Data Transfer**: First 100GB free
- **Total**: ~$0-20/month

### Azure
- **B1s**: ~$8/month
- **B2s**: ~$36/month
- **Storage**: $1-2/month
- **Total**: ~$9-38/month

---

## 🎉 Success Checklist

- [ ] VPS created and accessible via SSH
- [ ] Docker and Docker Compose installed
- [ ] Application cloned from GitHub
- [ ] Environment variables configured
- [ ] Docker containers running (backend + MongoDB)
- [ ] Backend API responding to /health
- [ ] Nginx installed and configured
- [ ] Domain pointed to server (optional)
- [ ] SSL certificate installed (optional)
- [ ] Frontend connected to backend
- [ ] Test user created successfully
- [ ] CORS configured correctly

---

## 🚀 Your App is Live!

**Access your application:**
- **Backend API**: `http://YOUR_SERVER_IP:8000` or `http://YOUR_SERVER_IP/api`
- **Health Check**: `http://YOUR_SERVER_IP/health`
- **With Domain**: `https://yourdomain.com/api`
- **Frontend**: On Vercel or `http://YOUR_SERVER_IP`

---

## 📚 Additional Resources

- Docker Documentation: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/
- DigitalOcean Tutorials: https://www.digitalocean.com/community/tutorials

---

## 🔄 Next Steps

1. **Setup Monitoring**: Install Uptime Robot or similar
2. **Automated Backups**: Schedule daily MongoDB backups
3. **CI/CD Pipeline**: Auto-deploy on git push
4. **Logging**: Setup centralized logging with ELK
5. **Scaling**: Add load balancer when traffic grows

---

**Congratulations! Your Task Management App is deployed on your own VPS! 🎊**

Need help? Check the logs, review the troubleshooting section, or reach out!
