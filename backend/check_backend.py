#!/usr/bin/env python3
"""
Quick diagnostic script to check backend configuration and connectivity
"""
import os
import sys
from pathlib import Path

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False

def check_backend_health():
    """Check if backend is running"""
    if not REQUESTS_AVAILABLE:
        print("⚠️  'requests' package not available - cannot check backend health")
        print("   Install with: pip install requests")
        return False
    
    try:
        response = requests.get("http://localhost:8002/health", timeout=2)
        if response.status_code == 200:
            print("✅ Backend is running on http://localhost:8002")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is NOT running on http://localhost:8002")
        print("   Start the backend with: python app/main.py")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def check_database_config():
    """Check database configuration"""
    if not DOTENV_AVAILABLE:
        print("⚠️  'python-dotenv' package not available - cannot check database config")
        return False
    
    env_path = Path(__file__).parent / ".env"
    load_dotenv(env_path)
    
    db_type = os.getenv("DB_TYPE", "sqlite").lower()
    db_password = os.getenv("DB_PASSWORD", "")
    
    if db_type == "postgresql":
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_user = os.getenv("DB_USER", "postgres")
        db_name = os.getenv("DB_NAME", "farmconnect")
        
        if db_password:
            print(f"✅ PostgreSQL configured")
            print(f"   Host: {db_host}:{db_port}")
            print(f"   Database: {db_name}")
            print(f"   User: {db_user}")
            return True
        else:
            print("⚠️  PostgreSQL selected but DB_PASSWORD not set")
            print("   Will fallback to SQLite")
            return False
    else:
        print("✅ Using SQLite database (default)")
        print("   Database file: farmconnect.db")
        return True

def check_env_file():
    """Check if .env file exists and email configuration"""
    if not DOTENV_AVAILABLE:
        print("⚠️  'python-dotenv' package not available - cannot check .env file")
        return False
    
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("⚠️  .env file not found in backend directory")
        print("   Email service will use mock mode (codes printed to console)")
        print("   Database will use SQLite (default)")
        return False
    
    print("✅ .env file found")
    
    # Try to load it
    try:
        load_dotenv(env_path)
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        
        if smtp_username and smtp_password:
            print(f"✅ Email configured: {smtp_username}")
            print(f"   Password length: {len(smtp_password)} characters")
            if len(smtp_password) != 16:
                print("   ⚠️  Warning: App password should be 16 characters")
            return True
        else:
            print("⚠️  .env file exists but SMTP_USERNAME or SMTP_PASSWORD not set")
            print("   Email service will use mock mode")
            return False
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return False

def check_venv():
    """Check if virtual environment is activated"""
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    
    if in_venv:
        print("✅ Virtual environment is activated")
        return True
    else:
        print("⚠️  Virtual environment not activated")
        print("   Windows: venv\\Scripts\\activate")
        print("   Linux/Mac: source venv/bin/activate")
        return False

def check_dependencies(venv_activated=False):
    """Check if required packages are installed"""
    required = ["fastapi", "uvicorn", "sqlalchemy", "python-dotenv"]
    missing = []
    
    for package in required:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        if not venv_activated:
            print("   ⚠️  Make sure virtual environment is activated first!")
        print("   Install with: pip install -r requirements.txt")
        return False
    else:
        print("✅ All required packages installed")
        return True

def check_port_available():
    """Check if port 8002 is available"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', 8002))
    sock.close()
    
    if result == 0:
        print("✅ Port 8002 is in use (backend might be running)")
        return True
    else:
        print("⚠️  Port 8002 is not in use (backend not running)")
        return False

def main():
    print("=" * 60)
    print("FarmConnect Backend Diagnostic Tool")
    print("=" * 60)
    print()
    
    print("1. Checking virtual environment...")
    venv_ok = check_venv()
    print()
    
    print("2. Checking dependencies...")
    deps_ok = check_dependencies(venv_ok)
    print()
    
    print("3. Checking port 8002...")
    port_ok = check_port_available()
    print()
    
    print("4. Checking backend health...")
    backend_ok = check_backend_health()
    print()
    
    print("5. Checking database configuration...")
    db_ok = check_database_config()
    print()
    
    print("6. Checking email configuration...")
    env_ok = check_env_file()
    print()
    
    print("=" * 60)
    print("Summary:")
    print("=" * 60)
    
    if backend_ok:
        print("✅ Backend is running and accessible")
    else:
        print("❌ Backend is not running - start it with: python app/main.py")
    
    if db_ok:
        print("✅ Database configuration is valid")
    else:
        print("⚠️  Database will use SQLite (default)")
    
    if env_ok:
        print("✅ Email service is configured")
    else:
        print("⚠️  Email service not configured - using mock mode")
    
    print()
    print("For more help, see SETUP.md")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)

