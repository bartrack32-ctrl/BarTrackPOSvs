# 🚀 BarTrack POS - Complete Setup Guide

This guide will walk you through setting up the complete BarTrack POS system from scratch.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Backend Setup](#backend-setup)
3. [Database Setup](#database-setup)
4. [Web Application Setup](#web-application-setup)
5. [Mobile App Setup](#mobile-app-setup)
6. [Configuration](#configuration)
7. [Running the System](#running-the-system)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Development Machine
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 10GB free space
- **Internet**: Stable internet connection

### Software Prerequisites
- **Node.js**: v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v8.0.0 or higher (comes with Node.js)
- **MongoDB**: v4.4 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git**: Latest version ([Download](https://git-scm.com/))

### For Mobile Development (Optional)
- **React Native CLI**: `npm install -g react-native-cli`
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)
- **Java JDK**: v11 or higher

---

## Backend Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/BarTrackPOSvs.git

# Navigate to project directory
cd BarTrackPOSvs
```

### 2. Install Dependencies

```bash
# Install server dependencies
npm install
```

Expected output:
```
added 247 packages, and audited 248 packages in 45s
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bartrack_pos

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:3000

# Twilio SMS Configuration (Optional - for SMS alerts)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Support Configuration
SUPPORT_EMAIL=support@bartrackpos.com
SUPPORT_PHONE=+1234567890

# Notification Phone Numbers
MANAGER_PHONE=+1234567890
OWNER_PHONE=+1234567890
```

### 4. Generate a Strong JWT Secret

```bash
# Generate a random JWT secret (Linux/macOS)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use this command
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET`.

---

## Database Setup

### 1. Install MongoDB

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Service
5. Click "Install MongoDB Compass" (optional GUI tool)

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community@6.0
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update packages
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/...
```

Type `exit` to quit mongosh.

### 3. Create Database and Initial User (Optional)

```bash
mongosh

# Create database
use bartrack_pos

# Create admin user
db.createUser({
  user: "admin",
  pwd: "secure_password_here",
  roles: [ { role: "readWrite", db: "bartrack_pos" } ]
})

exit
```

---

## Web Application Setup

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Client Environment (Optional)

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Mobile App Setup

### 1. Install React Native CLI

```bash
npm install -g react-native-cli
```

### 2. Android Setup

#### Install Android Studio
1. Download from [developer.android.com](https://developer.android.com/studio)
2. Install Android Studio
3. Open Android Studio → Configure → SDK Manager
4. Install Android SDK Platform 33 (or latest)
5. Install Android SDK Build-Tools
6. Install Android Emulator

#### Configure Environment Variables (Windows)
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools
Path=%Path%;%ANDROID_HOME%\tools
```

#### Configure Environment Variables (macOS/Linux)
Add to `~/.bash_profile` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. iOS Setup (macOS only)

```bash
# Install Xcode from App Store

# Install CocoaPods
sudo gem install cocoapods

# Navigate to iOS directory and install pods
cd mobile/ios
pod install
cd ../..
```

### 4. Install Mobile Dependencies

```bash
cd mobile
npm install
```

---

## Configuration

### 1. SMS Alerts Setup (Twilio)

1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number
4. Add credentials to `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security
   - Under "Signing in to Google," select App passwords
   - Generate a new app password
3. Add to `.env`:

```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

### 3. Payment Gateway Setup (Optional)

For Stripe integration:

```bash
npm install stripe
```

Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
```

---

## Running the System

### 1. Start MongoDB

```bash
# Windows (if not running as service)
mongod

# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 2. Start Backend Server

```bash
# From project root
npm start

# Or for development with auto-reload
npm run dev
```

Expected output:
```
🚀 BarTrack POS Server running on port 5000
✅ MongoDB Connected
```

### 3. Start Web Application

```bash
# Open new terminal
cd client
npm start
```

Browser will automatically open at `http://localhost:3000`

### 4. Start Mobile App

#### Android
```bash
# Open new terminal
cd mobile

# Start Metro bundler
npx react-native start

# In another terminal
npx react-native run-android
```

#### iOS
```bash
cd mobile
npx react-native run-ios
```

---

## Production Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create bartrack-pos-api

# Add MongoDB Atlas
# Sign up at mongodb.com/cloud/atlas
# Create cluster and get connection string

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set CLIENT_URL=https://your-client-domain.com

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify Example)

```bash
# Build the client
cd client
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Mobile App Deployment

#### Android (Google Play)
1. Generate release keystore
2. Build release APK: `cd android && ./gradlew assembleRelease`
3. Upload to Google Play Console

#### iOS (App Store)
1. Open `mobile/ios/BarTrackPOS.xcworkspace` in Xcode
2. Configure signing
3. Archive and upload to App Store Connect

---

## Initial Setup

### 1. Create Admin User

```bash
# Using the API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@bartrackpos.com",
    "password": "Admin@123",
    "role": "admin",
    "permissions": ["sales", "stock", "menu", "analytics", "users", "settings", "bank"]
  }'
```

### 2. Add Sample Menu Items

```bash
# Login first to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bartrackpos.com",
    "password": "Admin@123"
  }'

# Use the token to create menu items
curl -X POST http://localhost:5000/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Corona Beer",
    "category": "Beer",
    "price": 5.00,
    "cost": 2.50,
    "sku": "BEER-001",
    "stockQuantity": 100,
    "reorderLevel": 20
  }'
```

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list  # macOS
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### React Native Build Errors

```bash
# Clear cache
cd mobile
rm -rf node_modules
npm cache clean --force

# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && pod deintegrate && pod install && cd ..

# Reinstall
npm install
```

### MongoDB "Command Not Found"

Add MongoDB to your PATH:

```bash
# macOS/Linux
export PATH="/usr/local/mongodb/bin:$PATH"

# Windows
# Add C:\Program Files\MongoDB\Server\6.0\bin to System PATH
```

---

## Useful Commands

### Development

```bash
# Start all services (requires concurrently)
npm run dev:all

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Database Management

```bash
# Backup database
mongodump --db bartrack_pos --out ./backup

# Restore database
mongorestore --db bartrack_pos ./backup/bartrack_pos

# Clear database
mongosh
use bartrack_pos
db.dropDatabase()
```

### Logs and Debugging

```bash
# View server logs
npm start | tee server.log

# Enable debug mode
DEBUG=* npm start

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

---

## Next Steps

1. ✅ **Test the System**: Create a test sale, add menu items, check reports
2. ✅ **Customize Settings**: Configure tax rates, company info, receipt templates
3. ✅ **Train Staff**: Create user accounts for your team
4. ✅ **Import Data**: Import existing inventory and menu
5. ✅ **Go Live**: Start using the system in production

---

## Support

Need help? Contact us:
- 📧 Email: support@bartrackpos.com
- 📞 Phone: +1-234-567-890
- 💬 Live Chat: Available 24/7 in the app
- 📚 Documentation: https://docs.bartrackpos.com

---

**Congratulations! Your BarTrack POS system is now ready to use! 🎉**
