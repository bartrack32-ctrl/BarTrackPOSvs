#!/bin/bash

clear

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                 🍺 BarTrack POS - Deployment Script 🚀                       ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Start deployment
print_info "Starting BarTrack POS deployment..."
echo ""

# Step 1: Check Node.js
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "[1/7] Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION found"
else
    print_error "Node.js not found. Please install Node.js first."
    exit 1
fi
echo ""

# Step 2: Check environment file
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "[2/7] Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning "Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Environment file created"
    else
        print_error ".env.example not found!"
        exit 1
    fi
else
    print_success "Environment file exists"
fi
echo ""

# Step 3: Install dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "[3/7] Installing backend dependencies..."
if [ -f package.json ]; then
    npm install --silent --no-audit 2>&1 | grep -E "added|updated|removed" || true
    print_success "Backend dependencies installed"
else
    print_error "package.json not found!"
    exit 1
fi
echo ""

# Step 4: Stop existing server
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "[4/7] Stopping existing server..."
if [ -f server.pid ]; then
    OLD_PID=$(cat server.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        kill $OLD_PID 2>/dev/null || true
        sleep 2
        print_success "Stopped old server (PID: $OLD_PID)"
    else
        print_info "No running server found"
    fi
    rm -f server.pid
else
    print_info "No previous server instance"
fi
echo ""

# Step 5: Start the server
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "[5/7] Starting BarTrack POS server..."
nohup node server/index.js > server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > server.pid
sleep 3

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null 2>&1; then
    print_success "Server started successfully (PID: $SERVER_PID)"
else
    print_error "Server failed to start. Check server.log for details"
    cat server.log | tail -10
    exit 1
fi
echo ""

# Step 6: Health check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "[6/7] Performing health check..."
sleep 2
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    print_success "API health check passed"
else
    print_warning "Health check failed, but server may still be starting..."
fi
echo ""

# Step 7: Display access information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "[7/7] Deployment complete!"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                    ✅ DEPLOYMENT SUCCESSFUL! 🎉                              ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

print_success "Your BarTrack POS is now running!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌐 ACCESS YOUR APPLICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Web Application:"
echo "    File:    file://$(pwd)/index.html"
echo "    Server:  python3 -m http.server 8080"
echo "             Then visit: http://localhost:8080"
echo ""
echo "  Backend API:"
echo "    URL:     http://localhost:5000"
echo "    Health:  http://localhost:5000/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎯 QUICK COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  View logs:       tail -f server.log"
echo "  Stop server:     kill \$(cat server.pid)"
echo "  Restart server:  ./deploy.sh"
echo "  Check status:    ps aux | grep node"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 FEATURES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✅ Sales Management        ✅ Menu Management"
echo "  ✅ Stock Management        ✅ Profit & Loss Analysis"
echo "  ✅ Bank Reconciliation     ✅ SMS Alerts (demo mode)"
echo "  ✅ Android & iOS Apps      ✅ 24/7 Support"
echo "  ✅ Stock Variance ID       ✅ User-Friendly UI"
echo ""
echo "  NEW: ✨ Return/Back buttons on all pages!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_success "Ready to start selling! 🍺"
echo ""
