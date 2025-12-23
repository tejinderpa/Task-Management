# Deployment Guide

## Prerequisites

Before deployment, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MongoDB 6+ running
- ✅ Docker & Docker Compose (optional)
- ✅ Git installed
- ✅ Environment variables configured

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
DB_NAME=task_management_db
ACCESS_TOKEN_SECRET=your-super-secret-access-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
EMAIL_VERIFICATION_SECRET=your-email-secret
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### 3. Start MongoDB

```bash
# Option 1: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Option 2: Using Docker Compose
docker-compose up -d mongodb

# Option 3: Local MongoDB
mongod --dbpath /path/to/data
```

### 4. Run Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 5. Verify Installation

```bash
# Check health
curl http://localhost:8000/health

# Expected response
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-21T..."
}
```

---

## Docker Deployment

### Option 1: Docker Compose (Recommended)

**Complete stack deployment:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

**Services included:**
- Backend API (Port 8000)
- MongoDB (Port 27017)
- Mongo Express (Port 8081) - Dev only

**Access:**
- API: http://localhost:8000
- Mongo Express: http://localhost:8081 (username: admin, password: admin123)

### Option 2: Docker Only

```bash
# Build image
docker build -t task-management-api:latest .

# Run container
docker run -d \
  --name task-management-api \
  -p 8000:8000 \
  -e PORT=8000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017 \
  -e DB_NAME=task_management_db \
  -e ACCESS_TOKEN_SECRET=your-secret \
  -e REFRESH_TOKEN_SECRET=your-refresh-secret \
  -e ACCESS_TOKEN_EXPIRY=15m \
  -e REFRESH_TOKEN_EXPIRY=7d \
  -e EMAIL_VERIFICATION_SECRET=your-email-secret \
  -e CORS_ORIGIN=http://localhost:3000 \
  -e NODE_ENV=production \
  task-management-api:latest

# View logs
docker logs -f task-management-api

# Stop container
docker stop task-management-api

# Remove container
docker rm task-management-api
```

---

## Production Deployment

### AWS EC2 Deployment

#### 1. Launch EC2 Instance

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Create production environment file
nano .env
# Add production values

# Deploy with Docker Compose
docker-compose up -d

# Or build and run manually
npm install --production
NODE_ENV=production node src/index.js
```

#### 3. Setup Process Manager (PM2)

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start src/index.js --name task-management-api

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### 4. Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo nano /etc/nginx/sites-available/task-management
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/task-management /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### 6. Security Configuration

```bash
# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# MongoDB security (if not using Docker)
# Edit mongod.conf
sudo nano /etc/mongod.conf
```

Add:
```yaml
security:
  authorization: enabled
```

---

### MongoDB Atlas (Cloud Database)

#### 1. Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Configure network access (add your IP or 0.0.0.0/0)
4. Create database user
5. Get connection string

#### 2. Update Environment

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
DB_NAME=task_management_db
```

---

### Heroku Deployment

#### 1. Install Heroku CLI

```bash
# Install
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

#### 2. Create Application

```bash
# Create app
heroku create task-management-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set ACCESS_TOKEN_SECRET=your-secret
heroku config:set REFRESH_TOKEN_SECRET=your-refresh-secret
heroku config:set ACCESS_TOKEN_EXPIRY=15m
heroku config:set REFRESH_TOKEN_EXPIRY=7d
heroku config:set EMAIL_VERIFICATION_SECRET=your-email-secret
heroku config:set CORS_ORIGIN=https://your-frontend.com
```

#### 3. Deploy

```bash
# Add Procfile
echo "web: node src/index.js" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# View logs
heroku logs --tail
```

---

### DigitalOcean Deployment

#### 1. Create Droplet

- Choose Ubuntu 22.04
- Select plan (minimum 1GB RAM)
- Add SSH key
- Create droplet

#### 2. Initial Setup

```bash
# Connect
ssh root@your-droplet-ip

# Create new user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Install dependencies (same as EC2 above)
```

#### 3. Deploy with Docker

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Configure environment
nano .env

# Deploy
docker-compose up -d
```

---

## Environment Variables Reference

### Required Variables

```env
PORT=8000                                    # Server port
NODE_ENV=production                          # Environment
MONGODB_URI=mongodb://localhost:27017        # Database connection
DB_NAME=task_management_db                   # Database name
ACCESS_TOKEN_SECRET=<strong-secret>          # JWT access secret (min 32 chars)
REFRESH_TOKEN_SECRET=<strong-secret>         # JWT refresh secret (min 32 chars)
ACCESS_TOKEN_EXPIRY=15m                      # Access token expiry
REFRESH_TOKEN_EXPIRY=7d                      # Refresh token expiry
EMAIL_VERIFICATION_SECRET=<strong-secret>    # Email verification secret
```

### Optional Variables

```env
CORS_ORIGIN=https://your-frontend.com        # CORS origin
LOG_LEVEL=info                               # Logging level
SMTP_HOST=smtp.gmail.com                     # Email SMTP host
SMTP_PORT=587                                # Email SMTP port
SMTP_USER=your-email@gmail.com              # Email username
SMTP_PASSWORD=your-app-password             # Email password
EMAIL_FROM=noreply@taskmanagement.com       # From email address
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs task-management-api

# Monitor resources
pm2 monit

# Restart application
pm2 restart task-management-api

# Reload with zero downtime
pm2 reload task-management-api
```

### Docker Monitoring

```bash
# View container stats
docker stats task-management-backend

# View logs
docker logs -f task-management-backend

# View logs (last 100 lines)
docker logs --tail 100 task-management-backend

# Restart container
docker restart task-management-backend
```

### Application Logs

```bash
# View error logs
tail -f logs/error.log

# View combined logs
tail -f logs/combined.log

# Search logs
grep "ERROR" logs/error.log
```

---

## Database Management

### Backup MongoDB

```bash
# Backup
mongodump --uri="mongodb://localhost:27017" --db=task_management_db --out=/backup/$(date +%Y%m%d)

# Backup with Docker
docker exec task_management_mongodb mongodump --db=task_management_db --out=/backup/$(date +%Y%m%d)

# Copy backup from container
docker cp task_management_mongodb:/backup ./backups
```

### Restore MongoDB

```bash
# Restore
mongorestore --uri="mongodb://localhost:27017" --db=task_management_db /backup/20241221/task_management_db

# Restore with Docker
docker exec task_management_mongodb mongorestore --db=task_management_db /backup/20241221/task_management_db
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
npm run dev  # Development
pm2 logs     # Production with PM2
docker logs task-management-backend  # Docker

# Verify environment variables
printenv | grep MONGODB_URI

# Test MongoDB connection
mongosh mongodb://localhost:27017
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongo
sudo systemctl status mongod

# Check network
ping mongodb-host
telnet mongodb-host 27017

# Verify credentials
mongosh "mongodb://username:password@host:27017/database"
```

### Memory Issues

```bash
# Check memory usage
free -h
docker stats

# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" node src/index.js

# PM2 with memory limit
pm2 start src/index.js --max-memory-restart 500M
```

### Performance Issues

```bash
# Check database indexes
mongosh
use task_management_db
db.tasks.getIndexes()

# Analyze slow queries
db.setProfilingLevel(2)
db.system.profile.find().sort({ts:-1}).limit(10)

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/health
```

---

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Restart application
pm2 restart task-management-api
# OR
docker-compose restart backend
```

### Database Maintenance

```bash
# Compact database
mongosh
use task_management_db
db.runCommand({compact: 'tasks'})

# Update indexes
db.tasks.reIndex()

# Clean up old audit logs (older than 90 days)
db.auditlogs.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

---

## Security Checklist

- [ ] Strong JWT secrets (min 32 characters)
- [ ] MongoDB authentication enabled
- [ ] Firewall configured
- [ ] SSL/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables secure
- [ ] Regular backups scheduled
- [ ] Logs monitored
- [ ] Security updates applied
- [ ] Access logs reviewed
- [ ] Audit logs enabled

---

## Performance Optimization

### 1. Database Optimization

```javascript
// Add indexes in MongoDB
db.tasks.createIndex({ status: 1, priority: 1 })
db.tasks.createIndex({ assignedTo: 1, status: 1 })
db.tasks.createIndex({ title: "text", description: "text" })
```

### 2. Application Optimization

```bash
# Enable production mode
NODE_ENV=production

# Use clustering
pm2 start src/index.js -i max

# Enable compression
# Already configured in app.js
```

### 3. Caching (Future Enhancement)

```bash
# Install Redis
docker run -d -p 6379:6379 redis:alpine

# Update application to use Redis for caching
```

---

## Support & Documentation

- **API Documentation**: See README.md
- **Testing Guide**: See API_TESTING.md
- **GitHub Issues**: <repository-url>/issues
- **Email Support**: support@taskmanagement.com

---

**Successfully deployed? Start testing with the API Testing Guide!** 🚀
