# FarmConnect - Nigerian Agricultural Marketplace

A full-stack application connecting farmers with buyers in Nigeria. Built with FastAPI (backend) and React with Vite (frontend).

## 🚀 Quick Start

### Prerequisites

- Python 3.13+ (or Python 3.9+)
- Node.js 16+ and npm
- PostgreSQL (optional, SQLite used as fallback)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Start the backend server:

```bash
python app/main.py
```

The backend will run on `http://localhost:8002`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000` or `http://localhost:5173`

## 🐛 Bugs Fixed & Issues Resolved

This document details all the bugs encountered and fixes applied during development.

### 1. SQLAlchemy Python 3.13 Compatibility Issue

**Problem:**

- SQLAlchemy 2.0.23 was incompatible with Python 3.13
- Error: `AssertionError: Class <class 'sqlalchemy.sql.elements.SQLCoreOperations'> directly inherits TypingOnly but has additional attributes`

**Solution:**

- Upgraded SQLAlchemy from 2.0.23 to 2.0.44

```bash
pip install sqlalchemy --upgrade
```

**Files Modified:**

- `backend/requirements.txt` (implicitly through upgrade)

---

### 2. Pydantic v2 Compatibility Issues

**Problem:**

- Using deprecated `from_orm()` method which doesn't exist in Pydantic v2
- Error: `AttributeError: 'ModelMetaclass' object has no attribute 'from_orm'`

**Solution:**

- Replaced `UserResponse.from_orm(user)` with `UserResponse.model_validate(user)`
- Updated `user_data.dict()` to use `model_dump()` with fallback for compatibility

**Files Modified:**

- `backend/app/routers/auth.py` (lines 411, 491, 278, 550, 553)

---

### 3. CORS Policy Errors

**Problem:**

- Frontend requests from `http://localhost:3000` were blocked by CORS policy
- Error: `Access to fetch at 'http://localhost:8002/api/auth/register' from origin 'http://localhost:3000' has been blocked by CORS policy`
- CORS headers were not being sent on error responses

**Solution:**

- Added custom CORS middleware to handle all requests and responses
- Implemented OPTIONS preflight request handling
- Added exception handlers to ensure CORS headers are always present, even on errors
- Updated CORS origins to include multiple localhost ports

**Files Modified:**

- `backend/app/main.py` (added `CORSMiddlewareHandler` class and exception handlers)

**Key Changes:**

```python
# Custom middleware to handle CORS headers on all responses
class CORSMiddlewareHandler(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle OPTIONS preflight
        if request.method == "OPTIONS":
            # Return CORS headers
        # Add CORS headers to all responses
```

---

### 4. Unicode Encoding Errors on Windows

**Problem:**

- Emoji characters in print statements caused encoding errors on Windows console
- Error: `UnicodeEncodeError: 'charmap' codec can't encode character '\u274c' in position 0`

**Solution:**

- Removed all emoji characters from print statements throughout the codebase
- Replaced with plain text messages

**Files Modified:**

- `backend/app/routers/auth.py` (all print statements)
- `backend/app/utils/email_service.py` (all print statements)
- `backend/app/database.py` (print statements)

---

### 5. Database Schema Issues

**Problem:**

- `models.py` was creating its own `Base` instance instead of importing from `database.py`
- Database tables were not being created properly
- Error: `sqlite3.OperationalError: no such column: users.username`

**Solution:**

- Changed `models.py` to import `Base` from `database.py` instead of creating a new one
- Ensured all models use the same Base instance

**Files Modified:**

- `backend/app/models.py` (line 8)

**Before:**

```python
Base = declarative_base()
```

**After:**

```python
from app.database import Base
```

---

### 6. Module Import Path Issues

**Problem:**

- Running `python app/main.py` directly caused `ModuleNotFoundError: No module named 'app'`
- Python couldn't find the `app` module when running from the backend directory

**Solution:**

- Added path manipulation at the start of `main.py` to add the backend directory to Python path

**Files Modified:**

- `backend/app/main.py` (lines 2-8)

**Code Added:**

```python
import sys
from pathlib import Path

# Add the backend directory to Python path to fix imports when running directly
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
```

---

### 7. React Router Future Flag Warnings

**Problem:**

- React Router v6 showing warnings about future flags:
  - `v7_startTransition` future flag warning
  - `v7_relativeSplatPath` future flag warning

**Solution:**

- Added future flags to BrowserRouter configuration

**Files Modified:**

- `frontend/src/App.jsx`

**Code Added:**

```jsx
<Router
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
```

---

### 8. Database Connection Issues

**Problem:**

- PostgreSQL connection failing (password authentication)
- No proper fallback mechanism

**Solution:**

- Improved database connection with proper SQLite fallback
- Added connection error handling with clear messages

**Files Modified:**

- `backend/app/database.py`

**Key Changes:**

- Added try-except block for PostgreSQL connection
- Falls back to SQLite with proper connection args for threading

---

### 9. psycopg2-binary Installation Failure

**Problem:**

- `psycopg2-binary` requires Visual C++ Build Tools on Windows
- Installation failed with compilation errors

**Solution:**

- Application works without psycopg2-binary when using SQLite fallback
- For PostgreSQL support, install Visual C++ Build Tools or use a pre-built wheel

**Note:** The application works perfectly with SQLite for development. PostgreSQL is optional.

---

### 10. Database Table Creation on Startup

**Problem:**

- Database tables were not being created automatically
- Manual database initialization required

**Solution:**

- Tables are now created automatically when the backend starts via `Base.metadata.create_all(bind=engine)`
- Created `init_db.py` script for manual initialization if needed
- Created `create_demo_user.py` script to set up demo user

**Files Created:**

- `backend/init_db.py`
- `backend/create_demo_user.py`

---

## 📝 Demo User

A demo user has been created for testing:

- **Email:** `demo@farmconnect.com`
- **Password:** `Demo1234`
- **Role:** Buyer (Individual)
- **Status:** Verified

To create the demo user manually:

```bash
cd backend
python create_demo_user.py
```

## 🔧 Development Tips

### Backend Development

1. **Running the server:**

   ```bash
   cd backend
   python app/main.py
   ```

   Or using uvicorn directly:

   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
   ```

2. **Database Management:**

   - SQLite database file: `backend/farmconnect.db`
   - To reset database: Delete `farmconnect.db` and restart the server
   - Tables are created automatically on startup

3. **API Documentation:**
   - Swagger UI: `http://localhost:8002/docs`
   - ReDoc: `http://localhost:8002/redoc`

### Frontend Development

1. **Running the dev server:**

   ```bash
   cd frontend
   npm run dev
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
farm-project-main/
├── backend/
│   ├── app/
│   │   ├── routers/       # API route handlers
│   │   ├── models.py      # Database models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── database.py    # Database configuration
│   │   └── main.py        # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── farmconnect.db     # SQLite database (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── contexts/      # React contexts
│   └── package.json       # Node dependencies
└── README.md              # This file
```

## 🔍 Troubleshooting

### Backend won't start

- Check if port 8002 is already in use
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.9+)

### Frontend can't connect to backend

- Verify backend is running on `http://localhost:8002`
- Check CORS configuration in `backend/app/main.py`
- Ensure frontend is running on allowed origin (localhost:3000 or localhost:5173)

### Database errors

- Delete `backend/farmconnect.db` and restart the server
- Run `python backend/init_db.py` to recreate tables manually
- Check database connection in `backend/app/database.py`

### Import errors

- Ensure you're running commands from the correct directory
- Check that `backend` directory is in Python path
- Verify all `__init__.py` files exist in package directories

## 🛠️ Technologies Used

### Backend

- FastAPI 0.104.1
- SQLAlchemy 2.0.44
- Pydantic 2.12.3
- Uvicorn 0.24.0
- SQLite (development) / PostgreSQL (production)

### Frontend

- React 18.2.0
- React Router 6.20.1
- Vite 5.0.0
- Axios 1.6.2
- Tailwind CSS 3.3.5

## 📄 License

[Add your license information here]

## 👥 Contributors

[Add contributor information here]

---

**Last Updated:** Based on development session fixes and improvements
