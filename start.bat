@echo off
echo ========================================
echo   FarmConnect - Starting Both Servers
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

echo [1/5] Setting up backend...
REM Change to script directory first to ensure correct paths
cd /d "%~dp0backend"

REM Check if virtual environment exists, if not create it
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/upgrade backend dependencies
echo Installing backend dependencies...
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Setting up frontend...
cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)

echo.
echo [3/5] Creating demo users (if needed)...
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python create_demo_users.py 2>nul
if errorlevel 1 (
    echo WARNING: Failed to create demo users, but continuing...
    echo You can create them manually later by running:
    echo   cd backend
    echo   python create_demo_users.py
)

echo.
echo [4/5] Starting backend server on port 8002...
REM Ensure we're in the backend directory
cd /d "%~dp0backend"
start "FarmConnect Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python app/main.py"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

echo.
echo [5/5] Starting frontend server on port 3000...
REM Ensure we're in the frontend directory
cd /d "%~dp0frontend"
start "FarmConnect Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Servers are starting!
echo ========================================
echo   Backend:  http://localhost:8002
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8002/docs
echo ========================================
echo.
echo   Demo Accounts:
echo   - Buyer:  demo@farmconnect.com / Demo1234
echo   - Farmer: farmer@farmconnect.com / Farmer1234
echo ========================================
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul

