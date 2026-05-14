# Axovion.io Deployment Guide

## TL;DR - Quick Decision

**New to deployment?** Use Option 1 (Vercel + Railway) - easiest, free, done in 30 minutes.

**Want cheapest long-term?** Use Option 3 (Hetzner VPS) - $6/month, full control.

---

## Step 0: Pre-Deployment Checklist

Before deploying, ensure:
- [ ] All API keys are working in local environment
- [ ] MongoDB is running locally
- [ ] Frontend loads without errors
- [ ] Chatbot responds correctly
- [ ] AI Audit form submits successfully
- [ ] All `.env` files are configured (NOT committed to git)

---

## Option 1: Vercel + Railway + MongoDB Atlas (RECOMMENDED)

**Best for:** Beginners, fast deployment, zero maintenance
**Cost:** FREE (for moderate traffic)
**Time:** 30 minutes
**Difficulty:** Easy

### Why This Option?
- Zero server management
- Automatic HTTPS/SSL
- Global CDN (fast worldwide)
- Auto-scaling
- Git-based deployment

---

### Step 1: Prepare Your Repository

#### 1.1 Create production environment files

Create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
REACT_APP_SITE_URL=https://your-frontend-url.vercel.app
```

Create `backend/.env.production`:
```env
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/axovion?retryWrites=true&w=majority
DB_NAME=axovion

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_EMAIL=admin@axovion.io
ADMIN_PASSWORD=your-secure-admin-password

# APIs
GROQ_API_KEY=your-groq-key
KIMI_API_KEY=your-kimi-key
RESEND_API_KEY=your-resend-key
RETELL_API_KEY=your-retell-key
VAPI_API_KEY=your-vapi-key

# Email
RESEND_FROM_NAME=Axovion AI
RESEND_FROM_EMAIL=onboarding@resend.dev

# CORS - Add your Vercel URL here
CORS_ORIGINS=https://your-frontend-url.vercel.app,https://www.yourdomain.com

# Lead Scoring
HIGH_VALUE_REVENUE_USD=50000
HIGH_VALUE_BUDGET_USD=5000
```

#### 1.2 Add deployment config files

Create `frontend/vercel.json`:
```json
{
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/index.html",
      "status": 200
    }
  ]
}
```

Create `backend/railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn server:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
```

#### 1.3 Update `.gitignore`
Ensure these are in `.gitignore`:
```
# Environment files
.env
.env.local
.env.production

# Python
venv/
__pycache__/
*.pyc

# Node
node_modules/
build/
```

#### 1.4 Commit your code
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

### Step 2: Setup MongoDB Atlas (Database)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Click "Try Free" and create account
3. Create new project named "Axovion"
4. Build a database:
   - Choose "M0" (free tier)
   - Select region closest to your users
   - Name cluster: "axovion-cluster"
5. Create database user:
   - Username: `axovion_admin`
   - Password: Generate a strong password
   - Click "Create User"
6. Add IP addresses:
   - Click "Add My Current IP Address"
   - Also add: `0.0.0.0/0` (allows Railway to connect)
   - **Note:** For production, restrict this later
7. Get connection string:
   - Click "Connect" → "Drivers"
   - Select "Python"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://axovion_admin:YourPassword@axovion-cluster.xxxxx.mongodb.net/axovion?retryWrites=true&w=majority`

---

### Step 3: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Find and select your repository
6. Click "Add Variables" and add ALL from `backend/.env.production`:
   - MONGO_URL (from Step 2)
   - DB_NAME
   - JWT_SECRET (generate new random string)
   - ADMIN_EMAIL
   - ADMIN_PASSWORD
   - GROQ_API_KEY
   - KIMI_API_KEY
   - RESEND_API_KEY
   - RETELL_API_KEY
   - VAPI_API_KEY
   - RESEND_FROM_NAME
   - RESEND_FROM_EMAIL
   - CORS_ORIGINS (use your Vercel URL from Step 4)
   - HIGH_VALUE_REVENUE_USD
   - HIGH_VALUE_BUDGET_USD
7. Railway auto-detects Python and deploys
8. Wait for deployment (2-3 minutes)
9. Note your Railway URL: `https://axovion-api.up.railway.app`

**Test backend:**
```bash
curl https://axovion-api.up.railway.app/api/health
```
Should return: `{"status":"healthy"}`

---

### Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add Environment Variables:
   - `REACT_APP_API_URL` = `https://axovion-api.up.railway.app/api`
   - `REACT_APP_SITE_URL` = `https://axovion.vercel.app`
7. Click "Deploy"
8. Wait for build (2-3 minutes)
9. Note your Vercel URL: `https://axovion.vercel.app`

---

### Step 5: Update CORS (IMPORTANT)

1. Go back to Railway dashboard
2. Click your project → Variables
3. Update `CORS_ORIGINS`:
   ```
   https://axovion.vercel.app,https://www.yourdomain.com
   ```
4. Railway auto-redeploys

---

### Step 6: Add Custom Domain (Optional)

#### Buy Domain (if needed):
- Namecheap, GoDaddy, or Google Domains
- Recommended: `yourdomain.com`

#### Setup Cloudflare (Recommended):
1. Go to [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers at your registrar
4. Add DNS records:
   
   **Type:** CNAME
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   
   **Type:** CNAME
   - Name: `api`
   - Target: `your-railway-url.up.railway.app`

5. SSL/TLS mode: "Full (Strict)"
6. Always Use HTTPS: ON

#### Add Domain to Vercel:
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add `www.yourdomain.com`
3. Follow instructions

#### Add Domain to Railway:
1. Railway Dashboard → Your Service → Settings → Domains
2. Add `api.yourdomain.com`
3. Update DNS in Cloudflare

---

### Step 7: Verify Everything Works

Test these URLs:
1. **Frontend:** `https://yourdomain.com` (should load)
2. **API Health:** `https://api.yourdomain.com/api/health` (should return healthy)
3. **Chatbot:** Open site → click chat → send "Hello" (should respond)
4. **AI Audit:** Go to /audit → fill form → submit (should work)
5. **Admin Panel:** Go to /admin/login → login with credentials

---

## Option 2: Hetzner VPS (Most Cost-Effective)

**Best for:** Full control, cheapest long-term
**Cost:** $6/month
**Time:** 1-2 hours
**Difficulty:** Intermediate

---

### Step 1: Create Server

1. Go to [console.hetzner.cloud](https://console.hetzner.cloud)
2. Create project → Add server
3. Configuration:
   - Location: Closest to your users (e.g., US East, EU Central)
   - Image: Ubuntu 22.04 LTS
   - Type: CPX11 (2 vCPU, 4 GB RAM, 40 GB SSD) - €5.35/month
   - Name: `axovion-prod`
   - SSH Key: Add your public key (`cat ~/.ssh/id_rsa.pub`)
4. Click Create
5. Note the IP address (e.g., `123.45.67.89`)

---

### Step 2: Connect to Server

```bash
ssh root@123.45.67.89
```

**If you don't have SSH key:**
```bash
ssh-copy-id root@123.45.67.89
```

---

### Step 3: Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git nano ufw fail2ban

# Create non-root user
adduser axovion
usermod -aG sudo axovion

# Switch to new user
su - axovion
```

---

### Step 4: Install Dependencies

```bash
# Install Python & pip
sudo apt install -y python3 python3-pip python3-venv

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

### Step 5: Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/axovion.git
cd axovion
```

---

### Step 6: Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production env file
cp .env .env.production
nano .env.production
```

Update these values:
```env
MONGO_URL=mongodb://localhost:27017/axovion
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

### Step 7: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create production build
npm run build
```

---

### Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/axovion
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend - React build files
    location / {
        root /home/axovion/axovion/frontend/build;
        try_files $uri /index.html;
        
        # Enable gzip
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
        gzip_min_length 1000;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/axovion /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 9: Setup SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts:
- Enter email
- Accept terms
- Choose to redirect HTTP to HTTPS (Option 2)

Auto-renewal test:
```bash
sudo certbot renew --dry-run
```

---

### Step 10: Setup PM2 for Backend

```bash
cd ~/axovion/backend
source venv/bin/activate
```

Create ecosystem file:
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'axovion-api',
    script: 'venv/bin/python',
    args: '-m uvicorn server:app --host 0.0.0.0 --port 8000',
    cwd: '/home/axovion/axovion/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PYTHONUNBUFFERED: '1'
    },
    log_file: '/home/axovion/logs/combined.log',
    out_file: '/home/axovion/logs/out.log',
    error_file: '/home/axovion/logs/error.log',
    time: true
  }]
};
```

Create logs directory:
```bash
mkdir -p ~/logs
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

---

### Step 11: Configure Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Verify:
```bash
sudo ufw status
```

---

### Step 12: Secure MongoDB

```bash
mongosh
```

```javascript
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "YOUR_STRONG_PASSWORD",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

// Create app-specific user
use axovion
db.createUser({
  user: "axovion_app",
  pwd: "APP_STRONG_PASSWORD",
  roles: [
    { role: "readWrite", db: "axovion" }
  ]
})
```

Exit mongosh: `exit`

Enable authentication:
```bash
sudo nano /etc/mongod.conf
```

Add:
```yaml
security:
  authorization: enabled
```

Restart:
```bash
sudo systemctl restart mongod
```

Update backend `.env.production`:
```env
MONGO_URL=mongodb://axovion_app:APP_PASSWORD@localhost:27017/axovion?authSource=axovion
```

---

### Step 13: Create Deployment Script

```bash
nano ~/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "Starting deployment..."

cd ~/axovion

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Update backend
echo "Updating backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Update frontend
echo "Building frontend..."
cd ../frontend
npm install
npm run build

# Restart backend
echo "Restarting backend..."
pm2 restart axovion-api

# Reload nginx
echo "Reloading nginx..."
sudo nginx -s reload

echo "Deployment completed successfully!"
```

Make executable:
```bash
chmod +x ~/deploy.sh
```

Test deployment:
```bash
./deploy.sh
```

---

### Step 14: Setup GitHub Actions (Auto-Deploy)

On your local machine, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_IP }}
        username: axovion
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd ~/axovion
          git pull origin main
          cd backend && source venv/bin/activate && pip install -r requirements.txt
          cd ../frontend && npm install && npm run build
          pm2 restart axovion-api
          sudo nginx -s reload
```

Add GitHub secrets:
1. Go to GitHub → Your Repo → Settings → Secrets and variables → Actions
2. Add `SERVER_IP`: Your server IP
3. Add `SSH_PRIVATE_KEY`: Your private key content (`cat ~/.ssh/id_rsa`)

---

### Step 15: Monitoring & Maintenance

Install monitoring tools:
```bash
# Install netdata (system monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

Access netdata: `http://your-server-ip:19999`

Setup log rotation:
```bash
sudo nano /etc/logrotate.d/axovion
```

```
/home/axovion/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 axovion axovion
}
```

---

## Option 3: Render.com (Alternative)

**Best for:** Simple deployment, good free tier
**Cost:** FREE
**Time:** 20 minutes
**Difficulty:** Easy

### Step 1: Deploy Backend

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - Name: `axovion-api`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (all from `.env`)
7. Click "Create Web Service"

### Step 2: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect same repo
3. Configure:
   - Name: `axovion-web`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `build`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your Render backend URL + `/api`
5. Click "Create Static Site"

---

## Security Checklist

### Essential (Do These First)

- [ ] Change default admin password
- [ ] Generate new JWT_SECRET (32+ random characters)
- [ ] Enable MongoDB authentication
- [ ] Configure CORS (don't use `*`)
- [ ] Setup HTTPS/SSL
- [ ] Disable root SSH login
- [ ] Enable firewall (UFW)
- [ ] Don't commit `.env` files

### Recommended

- [ ] Setup fail2ban (VPS only)
- [ ] Enable MongoDB backups
- [ ] Setup log monitoring
- [ ] Configure rate limiting
- [ ] Regular security updates
- [ ] Two-factor authentication (2FA) on all accounts

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| MONGO_URL | Yes | MongoDB connection string |
| DB_NAME | Yes | Database name |
| JWT_SECRET | Yes | Secret key for JWT tokens |
| ADMIN_EMAIL | Yes | Admin login email |
| ADMIN_PASSWORD | Yes | Admin login password |
| GROQ_API_KEY | Yes | Groq API key |
| KIMI_API_KEY | No | Kimi API key (fallback) |
| RESEND_API_KEY | Yes | Resend email API key |
| RETELL_API_KEY | No | Retell calling API key |
| VAPI_API_KEY | No | Vapi calling API key |
| CORS_ORIGINS | Yes | Allowed frontend URLs |

### Frontend (.env.production)

| Variable | Required | Description |
|----------|----------|-------------|
| REACT_APP_API_URL | Yes | Backend API URL |
| REACT_APP_SITE_URL | Yes | Your domain |

---

## Performance Optimization

### Quick Wins

1. **Enable Gzip** (Nginx/Cloudflare)
2. **Use CDN** for static assets
3. **Compress images** before uploading
4. **Enable browser caching**
5. **Minimize API calls**

### Database Optimization

```javascript
// Add these indexes in MongoDB
use axovion
db.audits.createIndex({ "id": 1 }, { unique: true })
db.chats.createIndex({ "sessionId": 1 })
db.bookings.createIndex({ "createdAt": -1 })
```

---

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
pm2 logs axovion-api

# Check port
sudo lsof -i :8000

# Restart
pm2 restart axovion-api
```

**Frontend shows blank page:**
```bash
# Rebuild
npm run build

# Check for errors
npm run build 2>&1 | grep error
```

**MongoDB connection failed:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongosh "mongodb://localhost:27017/axovion"
```

**CORS errors:**
- Verify CORS_ORIGINS includes exact URL
- Check http vs https
- Include www if using www

---

## Cost Comparison

| Platform | Monthly Cost | Best For |
|----------|--------------|----------|
| **Vercel + Railway** | Free | Beginners, testing |
| **Hetzner VPS** | $6 | Production, long-term |
| **DigitalOcean** | $6 | Production, support |
| **Render** | Free | Simple deployment |
| **AWS** | $15-50 | Enterprise scale |

---

## Next Steps After Deployment

1. [ ] Test all features (chat, audit, admin)
2. [ ] Setup monitoring (UptimeRobot)
3. [ ] Configure backups (MongoDB Atlas)
4. [ ] Add Google Analytics
5. [ ] Test on mobile devices
6. [ ] Share your site!

---

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.mongodb.com/atlas
- **Nginx Docs:** https://nginx.org/en/docs
- **Certbot:** https://certbot.eff.org
- **PM2 Docs:** https://pm2.keymetrics.io

---

**Need help?** Check the troubleshooting section or platform-specific documentation.
