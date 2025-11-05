#!/usr/bin/env python3
"""
Create demo users (buyer and farmer) if they don't exist
This script is safe to run multiple times - it checks before creating
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, FarmerProfile
from app.utils.auth_utils import hash_password
from datetime import datetime

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Create demo users
db = SessionLocal()

try:
    users_created = 0
    
    # Check and create demo buyer
    demo_buyer = db.query(User).filter(User.email == "demo@farmconnect.com").first()
    if not demo_buyer:
        print("Creating demo buyer account...")
        demo_buyer = User(
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
        db.add(demo_buyer)
        db.commit()
        db.refresh(demo_buyer)
        print("  Demo buyer created: demo@farmconnect.com / Demo1234")
        users_created += 1
    else:
        print("  Demo buyer already exists: demo@farmconnect.com")
    
    # Check and create demo farmer
    demo_farmer = db.query(User).filter(User.email == "farmer@farmconnect.com").first()
    if not demo_farmer:
        print("Creating demo farmer account...")
        demo_farmer = User(
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
        db.add(demo_farmer)
        db.commit()
        db.refresh(demo_farmer)
        
        # Create farmer profile
        farmer_profile = FarmerProfile(
            user_id=demo_farmer.id,
            farm_name="Green Valley Farm",
            farm_size="50 acres",
            farm_type="Crop Production",
            years_farming=10,
            farm_description="A sustainable farm specializing in organic vegetables and grains",
            certification={"organic": True, "certified": True}
        )
        db.add(farmer_profile)
        db.commit()
        print("  Demo farmer created: farmer@farmconnect.com / Farmer1234")
        users_created += 1
    else:
        print("  Demo farmer already exists: farmer@farmconnect.com")
    
    if users_created > 0:
        print(f"\nSuccessfully created {users_created} demo user(s)")
    else:
        print("\nAll demo users already exist")
    
    print("\nDemo Account Credentials:")
    print("  Buyer:  demo@farmconnect.com / Demo1234")
    print("  Farmer: farmer@farmconnect.com / Farmer1234")
        
except Exception as e:
    print(f"Error creating demo users: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

