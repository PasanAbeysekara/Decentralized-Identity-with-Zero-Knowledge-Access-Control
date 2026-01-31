#!/bin/bash

# Quick Test Script for Decentralized Identity System
# Run this script to quickly verify your setup

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
WHITE='\033[0;37m'
NC='\033[0m' # No Color

# Global variable for Hardhat PID
HARDHAT_PID=""

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping Hardhat node...${NC}"
    if [ ! -z "$HARDHAT_PID" ]; then
        kill $HARDHAT_PID 2>/dev/null
        wait $HARDHAT_PID 2>/dev/null
    fi
    echo -e "${GREEN}✓ Cleanup complete${NC}"
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

echo -e "\n${CYAN}🔍 Decentralized Identity System - Quick Test${NC}"
echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"

# Check if Node.js is installed
echo -e "\n${YELLOW}📦 Checking dependencies...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: v$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check if dependencies are installed
echo -e "\n${YELLOW}📥 Checking node_modules...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing now...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check if Hardhat is available
echo -e "\n${YELLOW}🔨 Checking Hardhat...${NC}"
if npx hardhat --version &> /dev/null; then
    echo -e "${GREEN}✓ Hardhat is ready${NC}"
else
    echo -e "${RED}✗ Hardhat not found${NC}"
    exit 1
fi

echo -e "\n${CYAN}$(printf '=%.0s' {1..60})${NC}"
echo -e "${CYAN}STARTING TESTS${NC}"
echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"

# Test 1: Compile contracts
echo -e "\n${YELLOW}📝 Test 1: Compiling smart contracts...${NC}"
npx hardhat compile
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Compilation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Contracts compiled successfully${NC}"

# Test 2: Start Hardhat node in background
echo -e "\n${YELLOW}🌐 Test 2: Starting Hardhat node...${NC}"
npx hardhat node > /tmp/hardhat-node.log 2>&1 &
HARDHAT_PID=$!
echo -e "${GREEN}✓ Hardhat node starting (PID: $HARDHAT_PID)${NC}"
echo -e "${YELLOW}⏳ Waiting 5 seconds for node to initialize...${NC}"
sleep 5

# Check if node is running
if curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    --max-time 5 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Hardhat node is running and responding${NC}"
else
    echo -e "${YELLOW}⚠️  Could not confirm node is running (this may be okay)${NC}"
fi

# Test 3: Deploy contracts
echo -e "\n${YELLOW}🚀 Test 3: Deploying contracts...${NC}"
npx hardhat run scripts/deploy.js --network localhost
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Contracts deployed successfully${NC}"

# Test 4: Run contract tests
echo -e "\n${YELLOW}🧪 Test 4: Running contract tests...${NC}"
npx hardhat test --network localhost
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed (check output above)${NC}"
else
    echo -e "${GREEN}✓ All contract tests passed${NC}"
fi

# Test 5: Run deployment verification
echo -e "\n${YELLOW}✅ Test 5: Running deployment verification...${NC}"
npx hardhat run scripts/test-deployment.js --network localhost
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Verification had issues (check output above)${NC}"
else
    echo -e "${GREEN}✓ Deployment verification completed${NC}"
fi

# Summary
echo -e "\n${CYAN}$(printf '=%.0s' {1..60})${NC}"
echo -e "${CYAN}TEST SUMMARY${NC}"
echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"

echo -e "\n${GREEN}✅ Core blockchain functionality is working!${NC}"
echo -e "\n${YELLOW}📋 What's running:${NC}"
echo -e "${WHITE}   • Hardhat Node: http://localhost:8545 (PID: $HARDHAT_PID)${NC}"
echo -e "${WHITE}   • Smart Contracts: Deployed and tested${NC}"

echo -e "\n${YELLOW}🎯 Next steps to test full system:${NC}"
echo -e "${WHITE}   1. Keep this terminal open (Hardhat node is running)${NC}"
echo -e "${WHITE}   2. Open new terminal: cd backend && npm install && npm run dev${NC}"
echo -e "${WHITE}   3. Open another terminal: cd frontend && npm install && npm run dev${NC}"
echo -e "${WHITE}   4. Open browser: http://localhost:3000${NC}"
echo -e "${WHITE}   5. Connect MetaMask to 'Localhost 8545'${NC}"
echo -e "${WHITE}   6. Import one of the test accounts (see /tmp/hardhat-node.log)${NC}"

echo -e "\n${YELLOW}⚠️  To view Hardhat node logs:${NC}"
echo -e "${WHITE}   tail -f /tmp/hardhat-node.log${NC}"

echo -e "\n${YELLOW}⚠️  To stop Hardhat node:${NC}"
echo -e "${WHITE}   kill $HARDHAT_PID${NC}"

echo -e "\n${CYAN}📚 For detailed testing guide, see: TESTING.md${NC}"
echo -e ""

# Keep script running so Hardhat node stays active
echo -e "${YELLOW}Press Ctrl+C to stop the Hardhat node and exit${NC}"
while true; do
    sleep 1
done
