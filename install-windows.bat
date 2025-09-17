@echo off
echo ================================================================
echo              ECOVISION - Windows Installation Script
echo ================================================================
echo.
echo This script will install all necessary requirements for EcoVision
echo Please ensure you have administrative privileges.
echo.
pause

echo [1/8] Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
) else (
    echo ✓ Node.js is installed
    node --version
)

echo.
echo [2/8] Checking npm version...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not working properly
    pause
    exit /b 1
) else (
    echo ✓ npm is working
)

echo.
echo [3/8] Updating npm to latest version...
npm install -g npm@latest
if %errorlevel% neq 0 (
    echo WARNING: Could not update npm (may need admin rights)
    echo Continuing with current version...
)

echo.
echo [4/8] Clearing npm cache...
npm cache clean --force
if %errorlevel% neq 0 (
    echo WARNING: Could not clear cache, continuing...
)

echo.
echo [5/8] Installing global dependencies...
npm install -g tsx nodemon drizzle-kit esbuild
if %errorlevel% neq 0 (
    echo WARNING: Some global packages may not have installed
    echo You may need to run as administrator
)

echo.
echo [6/8] Removing old node_modules (if exists)...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ Removed old node_modules
)
if exist package-lock.json (
    del package-lock.json
    echo ✓ Removed old package-lock.json
)

echo.
echo [7/8] Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Trying with different flags...
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ERROR: Installation failed. Please check the error messages above.
        pause
        exit /b 1
    )
)

echo.
echo [8/8] Setting up database...
npm run db:push
if %errorlevel% neq 0 (
    echo WARNING: Database setup failed, you may need to run 'npm run db:push' manually later
)

echo.
echo ================================================================
echo                    INSTALLATION COMPLETE!
echo ================================================================
echo.
echo To start the application, run one of these commands:
echo   npm run dev    (for development)
echo   npm start      (for production)
echo.
echo If you encounter port issues, try:
echo   set PORT=3001 ^&^& npm run dev
echo.
echo For any issues, check the troubleshooting section in README.md
echo.
pause

echo Would you like to start the development server now? (Y/N)
set /p choice=Enter your choice: 
if /i "%choice%"=="Y" (
    echo Starting development server...
    npm run dev
) else (
    echo You can start the server later with: npm run dev
    pause
)