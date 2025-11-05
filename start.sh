#!/bin/bash

echo "========================================"
echo "  FarmConnect - Starting Both Servers"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.9+ and try again"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ and try again"
    exit 1
fi

echo "[1/4] Setting up backend..."
cd backend

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/upgrade backend dependencies
echo "Installing backend dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

echo
echo "[2/4] Setting up frontend..."
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "Frontend dependencies already installed"
fi

echo
echo "[3/4] Starting backend server on port 8002..."
cd ../backend
source venv/bin/activate
python app/main.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

echo
echo "[4/4] Starting frontend server on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "  Servers are starting!"
echo "========================================"
echo "  Backend:  http://localhost:8002"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8002/docs"
echo "========================================"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt signal
trap "echo; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for background processes
wait

