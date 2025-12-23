# MongoDB Setup Helper for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Task Management System - MongoDB Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if MongoDB is already installed
Write-Host "Checking for MongoDB installation..." -ForegroundColor Yellow
$mongoInstalled = Get-Command mongod -ErrorAction SilentlyContinue

if ($mongoInstalled) {
    Write-Host "✅ MongoDB is already installed!" -ForegroundColor Green
    Write-Host "MongoDB Version: " -NoNewline
    mongod --version | Select-String "db version"
    
    # Check if MongoDB service is running
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoService) {
        if ($mongoService.Status -eq "Running") {
            Write-Host "✅ MongoDB service is running" -ForegroundColor Green
        } else {
            Write-Host "⚠️  MongoDB service is installed but not running" -ForegroundColor Yellow
            Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
            Start-Service MongoDB
            Write-Host "✅ MongoDB service started" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  MongoDB is installed but not running as a service" -ForegroundColor Yellow
        Write-Host "You may need to start it manually with: mongod" -ForegroundColor Yellow
    }
    
    Write-Host "`n✅ MongoDB setup complete! You can now start the application." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. cd backend" -ForegroundColor White
    Write-Host "  2. npm run dev" -ForegroundColor White
    Write-Host "`n  (In another terminal)" -ForegroundColor Gray
    Write-Host "  3. cd frontend" -ForegroundColor White
    Write-Host "  4. npm run dev" -ForegroundColor White
    
} else {
    Write-Host "❌ MongoDB is not installed" -ForegroundColor Red
    Write-Host "`nPlease choose an installation option:`n" -ForegroundColor Yellow
    
    Write-Host "Option 1: Install MongoDB Community Edition (Recommended)" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "  2. Run the MSI installer" -ForegroundColor White
    Write-Host "  3. Choose 'Complete' installation" -ForegroundColor White
    Write-Host "  4. Install MongoDB as a Windows Service" -ForegroundColor White
    Write-Host "  5. Run this script again after installation`n" -ForegroundColor White
    
    Write-Host "Option 2: Use MongoDB Atlas (Cloud - Free)" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://www.mongodb.com/cloud/atlas/register" -ForegroundColor White
    Write-Host "  2. Create a free M0 cluster" -ForegroundColor White
    Write-Host "  3. Get your connection string" -ForegroundColor White
    Write-Host "  4. Update backend\.env with:" -ForegroundColor White
    Write-Host "     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/task_management" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Option 3: Install via Chocolatey (Package Manager)" -ForegroundColor Cyan
    Write-Host "  If you have Chocolatey installed:" -ForegroundColor White
    Write-Host "  choco install mongodb" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Option 4: Use Docker" -ForegroundColor Cyan
    Write-Host "  1. Install Docker Desktop" -ForegroundColor White
    Write-Host "  2. cd backend" -ForegroundColor White
    Write-Host "  3. docker-compose up -d" -ForegroundColor White
    Write-Host ""
    
    # Ask if user wants to open download page
    $response = Read-Host "Would you like to open the MongoDB download page now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Start-Process "https://www.mongodb.com/try/download/community"
        Write-Host "`n✅ Opening MongoDB download page in your browser..." -ForegroundColor Green
        Write-Host "After installation, run this script again!" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "For more details, see SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
