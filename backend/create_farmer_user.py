#!/usr/bin/env python3
"""
Create a demo farmer user for testing
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, FarmerProfile
from app.utils.auth_utils import hash_password
from datetime import datetime
import sqlalchemy

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Create farmer user
db = SessionLocal()

try:
    # Check if farmer user already exists
    existing = db.query(User).filter(User.email == "farmer@farmconnect.com").first()
    if existing:
        print(f"\nFarmer user already exists!")
        print(f"Email: {existing.email}")
        print(f"Username: {existing.username}")
        print(f"Role: {existing.role}")
        print(f"Password: Farmer1234")
        print(f"Farm Name: {existing.farm_name}")
    else:
        # Create farmer user
        farmer_user = User(
            email="farmer@farmconnect.com",
            phone="+2348098765432",
            username="demofarmer",
            password_hash=hash_password("Farmer1234"),
            first_name="John",
            last_name="Farmer",
            address="456 Farm Road",
            city="Abuja",
            state="FCT",
            country="Nigeria",
            role="farmer",
            user_type="individual",
            farm_name="Green Valley Farm",
            farm_size="50 acres",
            farm_type="Crop Production",
            years_farming=10,
            is_verified=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(farmer_user)
        db.commit()
        db.refresh(farmer_user)
        
        # Create farmer profile
        farmer_profile = FarmerProfile(
            user_id=farmer_user.id,
            farm_name="Green Valley Farm",
            farm_size="50 acres",
            farm_type="Crop Production",
            years_farming=10,
            farm_description="A sustainable farm specializing in organic vegetables and grains",
            certification={"organic": True, "certified": True}
        )
        
        db.add(farmer_profile)
        db.commit()
        
        print("\nFarmer user created successfully!")
        print(f"Email: {farmer_user.email}")
        print(f"Username: {farmer_user.username}")
        print(f"Password: Farmer1234")
        print(f"Role: {farmer_user.role}")
        print(f"User Type: {farmer_user.user_type}")
        print(f"Farm Name: {farmer_user.farm_name}")
        print(f"Farm Size: {farmer_user.farm_size}")
        print(f"Farm Type: {farmer_user.farm_type}")
        print(f"Years Farming: {farmer_user.years_farming}")
        print(f"\nYou can now login with:")
        print(f"  Email: farmer@farmconnect.com")
        print(f"  Password: Farmer1234")
        
except Exception as e:
    print(f"Error creating farmer user: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

