# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Simple connection - test if PostgreSQL is running
try:
    # For PostgreSQL
    DATABASE_URL = "postgresql://postgres:king@localhost:5432/farmconnect"

    engine = create_engine(DATABASE_URL)

    # Test connection
    with engine.connect() as conn:
        print("Successfully connected to PostgreSQL!")

except Exception as e:
    print(f"PostgreSQL connection failed: {e}")
    print("Falling back to SQLite for development...")
    # Fallback to SQLite
    DATABASE_URL = "sqlite:///./farmconnect.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()