# BarTrack POS - Quick Start Guide

Get BarTrack POS up and running in under 5 minutes!

---

## Option 1: Web App (Fastest)

### Step 1: Start the Server
```bash
cd /root/BarTrackPOSvs
node server/index.js
```

### Step 2: Open in Browser
```bash
# Option A: Direct file access
xdg-open index.html

# Option B: HTTP server
python3 -m http.server 8080
# Then visit: http://localhost:8080
```

### Step 3: Login
- **Username**: admin
- **Password**: (set on first run or use demo mode)

**✅ That's it! You're ready to use BarTrack POS.**

---

## Option 2: With Docker (Easiest)

```bash
# Coming soon - Docker setup
docker-compose up -d
```

---

## Option 3: Production Deploy

### Prerequisites
- Ubuntu 22.04 LTS server
- Domain name (optional)
- 1GB RAM minimum

### Quick Deploy
```bash
# Clone repository
git clone https://github.com/bartrack32-ctrl/BarTrackPOSvs.git
cd BarTrackPOSvs

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

### Manual Deploy (5 minutes)
```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install dependencies
npm install --production

# 3. Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bartrack
JWT_SECRET=$(openssl rand -base64 32)
EOF

# 4. Start with PM2
npm install -g pm2
pm2 start server/index.js --name bartrack-pos
pm2 save
pm2 startup
```

### Configure nginx (Optional but recommended)
```bash
# Install nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/bartrack

# Add this:
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/bartrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Add SSL (recommended)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## Test Your Installation

### Health Check
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","timestamp":"..."}
```

### API Test
```bash
# Create a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## Features Quick Tour

### 1. Dashboard
- Real-time sales metrics
- Today's revenue and transactions
- Stock alerts
- Recent activity

### 2. Sales Management
- Create new sales
- View transaction history
- Generate receipts
- Process refunds

### 3. Menu Management
- Add/edit menu items
- Set prices and categories
- Track popularity
- Manage stock levels

### 4. Inventory
- Track stock movements
- Low stock alerts
- Variance reports
- Supplier management

### 5. Analytics
- Sales reports
- Profit & loss statements
- Trend analysis
- Export to PDF/Excel

### 6. Bank Reconciliation
- Match transactions
- Auto-reconciliation
- Discrepancy detection
- Monthly reports

---

## Configuration

### Environment Variables (.env)
```bash
# Server
NODE_ENV=development          # or production
PORT=5000                     # Server port

# Database
MONGODB_URI=mongodb://localhost:27017/bartrack

# Authentication
JWT_SECRET=your-secret-key    # Generate with: openssl rand -base64 32

# SMS (Optional)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5001 node server/index.js
```

### MongoDB Connection Error
```bash
# Install MongoDB
sudo apt install mongodb -y

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Check status
sudo systemctl status mongodb
```

### Permission Denied
```bash
# Fix file permissions
chmod +x deploy.sh
sudo chown -R $USER:$USER .
```

### Service Worker Not Registering
- Ensure you're using HTTPS (or localhost)
- Clear browser cache
- Check browser console for errors
- Verify service-worker.js is accessible

### PWA Not Installing
- HTTPS is required (except localhost)
- Manifest.json must be valid
- Icons must exist
- Check browser compatibility

---

## Development Mode

### Run with Auto-Reload
```bash
# Install nodemon
npm install -g nodemon

# Start server with auto-reload
npm run dev

# Or manually
nodemon server/index.js
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* node server/index.js

# Or set in .env
DEBUG=express:*,mongoose:*
```

### Test API with Postman
1. Import API collection (coming soon)
2. Set base URL: http://localhost:5000
3. Test all endpoints

---

## Mobile App Setup

### iOS (macOS required)
```bash
cd mobile
npm install
npx pod-install ios
npx react-native run-ios
```

### Android
```bash
cd mobile
npm install
npx react-native run-android
```

### Configure API URL
Edit `mobile/src/services/api.js`:
```javascript
const API_URL = 'http://your-server-ip:5000/api';
```

---

## Performance Optimization

### Enable Compression
Already enabled with `compression` middleware in server.

### Add Redis Caching (Future)
```bash
# Install Redis
sudo apt install redis-server -y

# Configure in .env
REDIS_URL=redis://localhost:6379
```

### Use PM2 Cluster Mode
```bash
pm2 start server/index.js -i max --name bartrack-pos
```

---

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong passwords
- [ ] Enable HTTPS in production
- [ ] Configure firewall (ufw)
- [ ] Regular backups
- [ ] Update dependencies regularly
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets

---

## Backup & Restore

### Backup Database
```bash
# Backup to file
mongodump --db bartrack --out /backup/$(date +%Y%m%d)

# Compress backup
tar -czf backup.tar.gz /backup/$(date +%Y%m%d)
```

### Restore Database
```bash
# Extract backup
tar -xzf backup.tar.gz

# Restore
mongorestore --db bartrack /backup/20260312/bartrack
```

### Automated Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * mongodump --db bartrack --out /backup/$(date +\%Y\%m\%d)
```

---

## Monitoring

### Check Server Status
```bash
pm2 status
pm2 logs bartrack-pos
pm2 monit
```

### Check System Resources
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Network connections
netstat -tulpn | grep 5000
```

### Set Up Monitoring (Optional)
```bash
# PM2 Plus (free tier)
pm2 link <secret> <public>

# Or use external services
# - UptimeRobot (uptime monitoring)
# - New Relic (APM)
# - DataDog (full stack monitoring)
```

---

## Updating BarTrack POS

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Restart server
pm2 restart bartrack-pos

# Or without PM2
pkill -f "node server/index.js"
node server/index.js
```

---

## Getting Help

### Documentation
- **README.md** - Project overview
- **FEATURES.md** - Feature documentation
- **API_DOCUMENTATION.md** - API reference
- **PWA_FEATURES.md** - PWA capabilities
- **ARCHITECTURE.md** - System architecture
- **DEPLOYMENT_CHECKLIST.md** - Production deployment

### Support
- **Email**: bartrack32@gmail.com
- **GitHub Issues**: Create an issue
- **In-App Support**: 24/7 support widget

### Community
- Star the repository on GitHub
- Share your feedback
- Contribute improvements

---

## Next Steps

1. ✅ **Explore the dashboard** - Get familiar with the interface
2. ✅ **Create menu items** - Add your products
3. ✅ **Make a test sale** - Try the POS system
4. ✅ **Generate reports** - View analytics
5. ✅ **Install as PWA** - Add to home screen
6. ✅ **Configure alerts** - Set up SMS/email
7. ✅ **Invite team members** - Add users with roles
8. ✅ **Go live!** - Start using in production

---

## Congratulations! 🎉

You're now running BarTrack POS - a complete, professional bar management system.

**Enjoy managing your bar with ease!**

---

*Need help? Check CURRENT_STATUS.md for detailed system information.*
