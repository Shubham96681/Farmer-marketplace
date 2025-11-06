# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "farmconnect")
DB_TYPE = os.getenv("DB_TYPE", "sqlite").lower()  # 'postgresql' or 'sqlite'

# Try PostgreSQL if configured, otherwise fallback to SQLite
if DB_TYPE == "postgresql" and DB_PASSWORD:
    try:
        # Construct PostgreSQL connection string
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        
        # Test connection
        with engine.connect() as conn:
            print("✅ Successfully connected to PostgreSQL!")
            print(f"   Database: {DB_NAME} on {DB_HOST}:{DB_PORT}")
        
    except Exception as e:
        print(f"⚠️  PostgreSQL connection failed: {e}")
        print("   Falling back to SQLite for development...")
        # Fallback to SQLite
        DATABASE_URL = "sqlite:///./farmconnect.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        print("✅ Using SQLite database: farmconnect.db")
else:
    # Use SQLite by default
    DATABASE_URL = "sqlite:///./farmconnect.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    if DB_TYPE == "postgresql":
        print("⚠️  PostgreSQL selected but DB_PASSWORD not set. Using SQLite.")
    print("✅ Using SQLite database: farmconnect.db")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()