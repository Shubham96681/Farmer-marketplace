# FarmConnect - Setup Guide

This guide will help you set up and run the FarmConnect project on your system.

## Prerequisites

Before starting, ensure you have:

1. **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
   - Check installation: `python --version`
   - Make sure to add Python to PATH during installation

2. **Node.js 16+ and npm** - [Download Node.js](https://nodejs.org/)
   - Check installation: `node --version` and `npm --version`

3. **PostgreSQL** (Optional) - [Download PostgreSQL](https://www.postgresql.org/download/)
   - The application will use SQLite if PostgreSQL is not available
   - SQLite is perfect for development

## Quick Start (Automated)

### Windows

1. Open Command Prompt or PowerShell in the project root
2. Run:
   ```bash
   start.bat
   ```

This will:
- Check for Python and Node.js
- Create Python virtual environment
- Install all dependencies
- Create demo users automatically (if they don't exist)
- Start both backend and frontend servers in separate windows
- Display demo account credentials

### Linux/Mac

1. Open Terminal in the project root
2. Make the script executable:
   ```bash
   chmod +x start.sh
   ```
3. Run:
   ```bash
   ./start.sh
   ```

## Manual Setup

If you prefer to set up manually or the automated script doesn't work:

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   
   Windows:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
   
   Linux/Mac:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Start the backend server:**
   ```bash
   python app/main.py
   ```
   
   The backend will be available at: `http://localhost:8002`
   - API Documentation: `http://localhost:8002/docs`
   - Health Check: `http://localhost:8002/health`

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at: `http://localhost:3000`

## Verifying the Setup

### Check Backend

Open your browser and visit:
- `http://localhost:8002/health` - Should return `{"status": "healthy", "port": 8002}`
- `http://localhost:8002/docs` - Should show the API documentation

### Check Frontend

Open your browser and visit:
- `http://localhost:3000` - Should show the FarmConnect homepage

## Common Issues and Solutions

### Python Not Found

**Issue:** `'python' is not recognized as an internal or external command`

**Solution:**
- Make sure Python is installed
- Add Python to your system PATH
- Try using `python3` instead of `python` (Linux/Mac)

### Node.js Not Found

**Issue:** `'node' is not recognized as an internal or external command`

**Solution:**
- Make sure Node.js is installed
- Restart your terminal after installation
- Verify installation: `node --version`

### Port Already in Use

**Issue:** `Address already in use` or `Port 8002 is already in use`

**Solution:**
- Stop any other application using port 8002 (backend) or 3000 (frontend)
- On Windows, find and kill the process:
  ```bash
  netstat -ano | findstr :8002
  taskkill /PID <PID> /F
  ```
- On Linux/Mac:
  ```bash
  lsof -ti:8002 | xargs kill -9
  ```

### Database Connection Error

**Issue:** PostgreSQL connection errors

**Solution:**
- The application automatically falls back to SQLite
- SQLite database file: `backend/farmconnect.db`
- For PostgreSQL, check your connection settings in `backend/app/database.py`

### Module Import Errors

**Issue:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
- Make sure you're running from the backend directory
- Activate the virtual environment first
- Try: `python -m app.main` instead of `python app/main.py`

### Frontend Can't Connect to Backend

**Issue:** CORS errors or connection refused

**Solution:**
- Make sure backend is running on port 8002
- Check that frontend API URL is `http://localhost:8002` in `frontend/src/services/api.jsx`
- Verify CORS settings in `backend/app/main.py`

### Windows Execution Policy Error

**Issue:** `cannot be loaded because running scripts is disabled on this system`

**Solution:**
- Run PowerShell as Administrator
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Or use Command Prompt instead of PowerShell

## Development Tips

1. **Database Reset:** Delete `backend/farmconnect.db` to reset the database
2. **Clear Cache:** Clear browser cache if you see old frontend code
3. **Hot Reload:** Both servers support hot reload - changes will reflect automatically
4. **API Testing:** Use the Swagger UI at `http://localhost:8002/docs` to test API endpoints
5. **User Management:** 
   - Use `python check_users.py` to see all users and their status
   - Use `python create_demo_users.py` to create demo users (safe to run multiple times)
6. **Demo Users:** Demo users are auto-created on startup via `start.bat`, or run `python create_demo_users.py` manually
7. **Login Debugging:** 
   - Check the backend console window (FarmConnect Backend) for detailed login attempt logs
   - Logs show: user lookup, password verification, verification status, and specific error messages

## Project Structure

```
FarmConnect/
├── backend/
│   ├── app/              # FastAPI application
│   │   ├── routers/      # API routes
│   │   ├── models.py     # Database models
│   │   ├── schemas.py    # Pydantic schemas
│   │   └── main.py       # Application entry point
│   ├── requirements.txt  # Python dependencies
│   └── farmconnect.db    # SQLite database (auto-created)
├── frontend/
│   ├── src/              # React application
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── package.json      # Node dependencies
├── start.bat             # Windows startup script
├── start.sh              # Linux/Mac startup script
└── README.md             # Project documentation
```

## Demo Accounts

Demo accounts are automatically created when you run the startup script. Use these credentials to login:

### Buyer Account
- **Email:** `demo@farmconnect.com`
- **Password:** `Demo1234`
- **Username:** `demouser`
- **Role:** Buyer (Individual)
- **Status:** Verified and Active

### Farmer Account
- **Email:** `farmer@farmconnect.com`
- **Password:** `Farmer1234`
- **Username:** `demofarmer`
- **Role:** Farmer (Individual)
- **Farm:** Green Valley Farm
- **Status:** Verified and Active

### Creating Demo Accounts Manually

If you need to create or recreate demo accounts:

```bash
cd backend
python create_demo_users.py     # Creates both (recommended)
# OR
python create_demo_user.py      # Creates buyer only
python create_farmer_user.py    # Creates farmer only
```

### Checking Users in Database

To see all users and their status:

```bash
cd backend
python check_users.py
```

This will display:
- All users in the database
- Their verification and active status
- Demo account credentials

## Common Issues and Solutions

### Marketplace Shows 0 Products

**Issue:** Marketplace shows "Available Products (0)" even when products exist

**Solution:**
- Verify backend is running on port 8002
- Check browser console (F12) for API errors
- Ensure frontend is connecting to `http://localhost:8002`
- Verify products are marked as `is_available: true` in database

### Dashboard Statistics Not Updating

**Issue:** Dashboard shows incorrect numbers or doesn't update

**Solution:**
- Refresh the page to reload data
- Check browser console for errors
- Verify backend API is responding correctly
- Statistics update automatically when products/orders change

### Product Images Not Displaying

**Issue:** Product images don't show in marketplace or dashboard

**Solution:**
- Check that images were uploaded successfully
- Verify backend media directory exists: `backend/media/products/`
- Check browser console for 404 errors on image URLs
- Images should be accessible at `http://localhost:8002/media/products/...`

### Validation Errors When Creating Products

**Issue:** "Backend validation error" when adding products

**Solution:**
- Ensure all required fields are filled (name, price, category, unit, quantity)
- Check that quantity is a number >= 0
- Verify price is a number > 0
- Check browser console for specific validation error messages

### Login Issues

**Issue:** Cannot login or login fails silently

**Solution:**
1. **Check if users exist:**
   ```bash
   cd backend
   python check_users.py
   ```

2. **Create demo users if missing:**
   ```bash
   cd backend
   python create_demo_users.py
   ```

3. **Check backend logs:** The backend console window will show detailed login attempt logs including:
   - User lookup results
   - Password verification status
   - Verification status check
   - Specific error messages

4. **Common login failures:**
   - User not found: Email/username doesn't exist - create demo users
   - Invalid credentials: Wrong password - use Demo1234 or Farmer1234
   - Email not verified: User exists but isn't verified - demo users are pre-verified
   - User inactive: User is deactivated - demo users are active

5. **Verify credentials:**
   - Buyer: `demo@farmconnect.com` / `Demo1234`
   - Farmer: `farmer@farmconnect.com` / `Farmer1234`

## Need Help?

If you encounter any issues not covered here:
1. Check the `README.md` for more details
2. Review the `CHANGELOG.md` for recent fixes
3. Review the error messages carefully
4. Ensure all prerequisites are installed correctly
5. Try the manual setup steps above
6. Check browser console (F12) for detailed error messages

