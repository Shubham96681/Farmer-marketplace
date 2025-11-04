#!/usr/bin/env python3
"""
Initialize database and create a demo user
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, Product, Order, Review, FarmerProfile, BusinessProfile
from app.utils.auth_utils import hash_password
from datetime import datetime
import sqlalchemy

# Ensure we're using the same engine
# Create all tables first
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")

# Verify tables were created
inspector = sqlalchemy.inspect(engine)
tables = inspector.get_table_names()
print(f"Tables in database: {tables}")

# Create demo user
db = SessionLocal()

try:
    # Check if demo user already exists
    existing = db.query(User).filter(User.email == "demo@farmconnect.com").first()
    if existing:
        print(f"\nDemo user already exists!")
        print(f"Email: {existing.email}")
        print(f"Username: {existing.username}")
        print(f"Role: {existing.role}")
        print(f"Password: Demo1234")
    else:
        # Create demo user
        demo_user = User(
            email="demo@farmconnect.com",
            phone="+2348012345678",
            username="demouser",
            password_hash=hash_password("Demo1234"),
            first_name="Demo",
            last_name="User",
            address="123 Demo Street",
            city="Lagos",
            state="Lagos",
            country="Nigeria",
            role="buyer",
            user_type="individual",
            is_verified=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        print("\nDemo user created successfully!")
        print(f"Email: {demo_user.email}")
        print(f"Username: {demo_user.username}")
        print(f"Password: Demo1234")
        print(f"Role: {demo_user.role}")
        print(f"User Type: {demo_user.user_type}")
        print(f"\nYou can now login with:")
        print(f"  Email: demo@farmconnect.com")
        print(f"  Password: Demo1234")
        
except Exception as e:
    print(f"Error creating demo user: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
