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

4. **Configure Database and Email (Optional but Recommended):**
   
   The app works with default settings (SQLite database, mock email), but you can configure PostgreSQL and Gmail for production use.
   
   **Step 1: Create .env File**
   
   Create a `.env` file in the `backend` directory. You can use the template:
   
   ```bash
   cd backend
   # Copy the template (if it exists)
   copy env.template .env
   # Or create .env manually
   ```
   
   **Step 2: Configure Database (Optional)**
   
   By default, the app uses SQLite. To use PostgreSQL:
   
   ```env
   # Set database type to PostgreSQL
   DB_TYPE=postgresql
   
   # PostgreSQL connection settings
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your-postgres-password
   DB_NAME=farmconnect
   ```
   
   **Note:** If PostgreSQL is not configured or connection fails, the app automatically falls back to SQLite.
   
   **Step 3: Configure Email Service (Optional)**
   
   To enable email verification and password reset, configure Gmail SMTP:
   
   **A. Generate Gmail App Password:**
   
   1. Go to your Google Account: https://myaccount.google.com/
   2. Click on **Security** in the left sidebar
   3. Under "How you sign in to Google", find **2-Step Verification**
      - If not enabled, enable it first (required for app passwords)
   4. After enabling 2-Step Verification, go back to Security
   5. Under "How you sign in to Google", click **App passwords**
   6. You may need to sign in again
   7. Select **Mail** as the app and **Other (Custom name)** as the device
   8. Enter a name like "FarmConnect" and click **Generate**
   9. **Copy the 16-character password** (you'll only see it once!)
      - It will look like: `abcd efgh ijkl mnop`
   
   **B. Add Email Settings to .env:**
   
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   ```
   
   **Complete .env Example:**
   
   ```env
   # Database Configuration
   DB_TYPE=sqlite
   # Or for PostgreSQL:
   # DB_TYPE=postgresql
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_USER=postgres
   # DB_PASSWORD=your-postgres-password
   # DB_NAME=farmconnect
   
   # Email Configuration
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=myfarmconnect@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   ```
   
   **Important Notes:**
   - Replace values with your actual credentials
   - Remove spaces around the `=` sign
   - Don't use quotes around values
   - Never commit the `.env` file to version control (it's already in .gitignore)
   - The `.env` file must be in the `backend` directory, not the root
   
   **Without Configuration:**
   - **Database:** App uses SQLite automatically (works out of the box)
   - **Email:** App uses mock mode - verification codes printed to console
   - Both are optional - the app works perfectly with defaults!

5. **Verify Configuration (Optional):**
   
   Before starting the server, you can verify your configuration:
   
   ```bash
   python check_backend.py
   ```
   
   This will check:
   - Virtual environment activation
   - Required packages
   - Database configuration
   - Email configuration
   - Backend server status

6. **Start the backend server:**
   ```bash
   python app/main.py
   ```
   
   The backend will be available at: `http://localhost:8002`
   - API Documentation: `http://localhost:8002/docs`
   - Health Check: `http://localhost:8002/health`
   
   **On startup, you'll see:**
   - Database connection status (PostgreSQL or SQLite)
   - Email service status (configured or mock mode)
   - Server running message

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

**Issue:** PostgreSQL connection errors or database not working

**Solution:**

1. **Check .env file configuration:**
   - Verify `DB_TYPE=postgresql` is set (if using PostgreSQL)
   - Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are correct
   - Make sure there are no spaces around `=` signs
   - Don't use quotes around values

2. **PostgreSQL Connection Issues:**
   - Verify PostgreSQL is running: `pg_isready` (Linux/Mac) or check Services (Windows)
   - Test connection manually: `psql -h localhost -U postgres -d farmconnect`
   - Check if database exists: `CREATE DATABASE farmconnect;` (if it doesn't exist)
   - Verify username and password are correct

3. **Automatic Fallback:**
   - The application automatically falls back to SQLite if PostgreSQL fails
   - SQLite database file: `backend/farmconnect.db`
   - This is perfect for development - no configuration needed!

4. **Using SQLite (Default):**
   - No configuration needed - works out of the box
   - Database file is created automatically: `backend/farmconnect.db`
   - Perfect for development and testing

### Module Import Errors

**Issue:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
- Make sure you're running from the backend directory
- Activate the virtual environment first
- Try: `python -m app.main` instead of `python app/main.py`

### Frontend Can't Connect to Backend / Network Error

**Issue:** "Network error when attempting to fetch resources" or "Failed to fetch" or "Connection refused"

**Solution:**

1. **Verify Backend is Running:**
   - Check if the backend server is actually running
   - Look for a terminal window showing "Uvicorn running on http://0.0.0.0:8002"
   - If not running, start it:
     ```bash
     cd backend
     venv\Scripts\activate  # Windows
     # or: source venv/bin/activate  # Linux/Mac
     python app/main.py
     ```

2. **Test Backend Health Endpoint:**
   - Open your browser and go to: `http://localhost:8002/health`
   - You should see: `{"status": "healthy", "port": 8002}`
   - If you get "This site can't be reached", the backend is not running

3. **Check Backend Console for Errors:**
   - Look at the backend terminal window for error messages
   - Common startup errors:
     - **Import errors** → Make sure virtual environment is activated and dependencies installed
     - **Port already in use** → Another process is using port 8002
     - **Database errors** → Check database connection
     - **Email configuration errors** → Check .env file format (see Email troubleshooting below)

4. **Verify Port 8002 is Available:**
   
   **Windows:**
   ```bash
   netstat -ano | findstr :8002
   ```
   If you see output, a process is using the port. Kill it:
   ```bash
   taskkill /PID <PID_NUMBER> /F
   ```
   
   **Linux/Mac:**
   ```bash
   lsof -ti:8002
   ```
   If you see a PID, kill it:
   ```bash
   kill -9 <PID>
   ```

5. **Check Frontend API URL:**
   - Verify frontend is trying to connect to `http://localhost:8002`
   - Check browser console (F12) for the exact error message
   - Look for the actual URL being called in Network tab

6. **Check CORS Configuration:**
   - Backend should allow `http://localhost:3000` (or your frontend port)
   - If frontend runs on a different port, add it to CORS origins in `backend/app/main.py`

7. **Firewall/Antivirus Issues:**
   - Temporarily disable firewall/antivirus to test
   - Windows Firewall might be blocking localhost connections
   - Add exception for Python and Node.js

8. **Email Configuration Causing Backend Crash:**
   - If backend crashes on startup after adding .env file, check:
     - .env file is in `backend` directory (not root)
     - No syntax errors in .env (no quotes, no spaces around =)
     - App password is correct (16 characters, no spaces)
   - Temporarily rename .env to .env.backup to test if email config is the issue
   - Backend should still work without email config (uses mock emails)

9. **Browser Cache Issues:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Try incognito/private browsing mode
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

10. **Check Both Servers are Running:**
    - Backend: Should be on `http://localhost:8002`
    - Frontend: Should be on `http://localhost:3000` (or 5173 for Vite)
    - Both need to be running simultaneously

**Quick Diagnostic Steps:**

1. **Run the diagnostic script:**
   ```bash
   cd backend
   python check_backend.py
   ```
   This will check:
   - Virtual environment activation
   - Required packages installation
   - Backend server status
   - Email configuration
   - Port availability

2. Open browser and go to `http://localhost:8002/health` - should return JSON
3. Open browser and go to `http://localhost:8002/docs` - should show API docs
4. Check browser console (F12) for specific error messages
5. Check Network tab in browser DevTools to see failed requests
6. Check backend console for error logs

### Windows Execution Policy Error

**Issue:** `cannot be loaded because running scripts is disabled on this system`

**Solution:**
- Run PowerShell as Administrator
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Or use Command Prompt instead of PowerShell

### Email Not Sending / Gmail Authentication Errors

**Issue:** Emails not being sent, or getting authentication errors like "Username and Password not accepted"

**Solution:**

1. **Verify .env file exists and is in the correct location:**
   - The `.env` file must be in the `backend` directory (not the root)
   - Check that the file is named exactly `.env` (no extension)

2. **Verify Gmail App Password:**
   - Make sure you're using an **App Password**, not your regular Gmail password
   - App passwords are 16 characters (remove spaces when adding to .env)
   - App passwords can only be generated if 2-Step Verification is enabled
   - Go to https://myaccount.google.com/apppasswords to generate a new one

3. **Check .env file format:**
   - Make sure there are no quotes around values
   - No spaces around the `=` sign
   - Example: `SMTP_USERNAME=your-email@gmail.com` (not `SMTP_USERNAME = "your-email@gmail.com"`)

4. **Verify 2-Step Verification is enabled:**
   - Go to https://myaccount.google.com/security
   - 2-Step Verification must be ON to use app passwords

5. **Check for "Less secure app access" (if using regular password):**
   - Note: Regular passwords won't work - you MUST use an app password
   - If you see errors about "less secure apps", switch to app passwords

6. **Restart the backend server:**
   - After creating or modifying the `.env` file, restart the backend server
   - Environment variables are loaded when the server starts

7. **Check backend console for errors:**
   - Look for specific error messages in the backend console window
   - Common errors:
     - "Authentication failed" → Wrong app password or username
     - "Connection refused" → Check internet connection or firewall
     - "Module not found" → Make sure `python-dotenv` is installed: `pip install python-dotenv`

8. **Test email configuration:**
   - Try registering a new user
   - Check the backend console - if email is configured, you'll see "Verification email sent to..."
   - If not configured, you'll see "Mock email sent to... with code: XXXXXX"
   - Check your email inbox (and spam folder) for the verification code

**Quick Test:**
Create a test file `backend/test_email_config.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()
print(f"SMTP_SERVER: {os.getenv('SMTP_SERVER')}")
print(f"SMTP_PORT: {os.getenv('SMTP_PORT')}")
print(f"SMTP_USERNAME: {os.getenv('SMTP_USERNAME')}")
print(f"SMTP_PASSWORD: {'*' * len(os.getenv('SMTP_PASSWORD', ''))}")
```

Run it: `python test_email_config.py` to verify your .env is being loaded correctly.

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

