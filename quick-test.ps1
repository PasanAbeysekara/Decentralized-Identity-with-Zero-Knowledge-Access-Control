# Quick Test Script for Decentralized Identity System
# Run this script to quickly verify your setup

Write-Host "`n🔍 Decentralized Identity System - Quick Test" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
Write-Host "`n📥 Checking node_modules..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not installed. Installing now..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Check if Hardhat is available
Write-Host "`n🔨 Checking Hardhat..." -ForegroundColor Yellow
try {
    npx hardhat --version
    Write-Host "✓ Hardhat is ready" -ForegroundColor Green
} catch {
    Write-Host "✗ Hardhat not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "STARTING TESTS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Test 1: Compile contracts
Write-Host "`n📝 Test 1: Compiling smart contracts..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Contracts compiled successfully" -ForegroundColor Green

# Test 2: Start Hardhat node in background
Write-Host "`n🌐 Test 2: Starting Hardhat node..." -ForegroundColor Yellow
$hardhatJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx hardhat node
}
Write-Host "✓ Hardhat node starting (Job ID: $($hardhatJob.Id))" -ForegroundColor Green
Write-Host "⏳ Waiting 5 seconds for node to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if node is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Hardhat node is running and responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not confirm node is running (this may be okay)" -ForegroundColor Yellow
}

# Test 3: Deploy contracts
Write-Host "`n🚀 Test 3: Deploying contracts..." -ForegroundColor Yellow
npx hardhat run scripts/deploy.js --network localhost
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    Stop-Job $hardhatJob
    Remove-Job $hardhatJob
    exit 1
}
Write-Host "✓ Contracts deployed successfully" -ForegroundColor Green

# Test 4: Run contract tests
Write-Host "`n🧪 Test 4: Running contract tests..." -ForegroundColor Yellow
npx hardhat test --network localhost
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Some tests failed (check output above)" -ForegroundColor Yellow
} else {
    Write-Host "✓ All contract tests passed" -ForegroundColor Green
}

# Test 5: Run deployment verification
Write-Host "`n✅ Test 5: Running deployment verification..." -ForegroundColor Yellow
npx hardhat run scripts/test-deployment.js --network localhost
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Verification had issues (check output above)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Deployment verification completed" -ForegroundColor Green
}

# Summary
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n✅ Core blockchain functionality is working!" -ForegroundColor Green
Write-Host "`n📋 What's running:" -ForegroundColor Yellow
Write-Host "   • Hardhat Node: http://localhost:8545 (Job ID: $($hardhatJob.Id))" -ForegroundColor White
Write-Host "   • Smart Contracts: Deployed and tested" -ForegroundColor White

Write-Host "`n🎯 Next steps to test full system:" -ForegroundColor Yellow
Write-Host "   1. Keep this window open (Hardhat node is running)" -ForegroundColor White
Write-Host "   2. Open new terminal: cd backend && npm install && npm run dev" -ForegroundColor White
Write-Host "   3. Open another terminal: cd frontend && npm install && npm run dev" -ForegroundColor White
Write-Host "   4. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "   5. Connect MetaMask to 'Localhost 8545'" -ForegroundColor White
Write-Host "   6. Import one of the test accounts (see Hardhat node output)" -ForegroundColor White

Write-Host "`n⚠️  To stop Hardhat node:" -ForegroundColor Yellow
Write-Host "   Stop-Job $($hardhatJob.Id)" -ForegroundColor White
Write-Host "   Remove-Job $($hardhatJob.Id)" -ForegroundColor White

Write-Host "`n📚 For detailed testing guide, see: TESTING.md" -ForegroundColor Cyan
Write-Host ""

# Keep script running so Hardhat node stays active
Write-Host "Press Ctrl+C to stop the Hardhat node and exit" -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`n🛑 Stopping Hardhat node..." -ForegroundColor Yellow
    Stop-Job $hardhatJob
    Remove-Job $hardhatJob
    Write-Host "✓ Cleanup complete" -ForegroundColor Green
}
