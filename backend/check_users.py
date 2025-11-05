#!/usr/bin/env python3
"""
Check if users exist in the database
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User
from app.utils.auth_utils import verify_password

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Query users
db = SessionLocal()

try:
    print("=" * 60)
    print("CHECKING USERS IN DATABASE")
    print("=" * 60)
    
    # Get all users
    users = db.query(User).all()
    
    if not users:
        print("\n[ERROR] NO USERS FOUND IN DATABASE!")
        print("\nYou need to create users first.")
        print("\nTo create demo users, run:")
        print("  python create_demo_user.py    # Creates buyer account")
        print("  python create_farmer_user.py  # Creates farmer account")
    else:
        print(f"\n[SUCCESS] Found {len(users)} user(s) in database:\n")
        
        for i, user in enumerate(users, 1):
            print(f"User #{i}:")
            print(f"  ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Username: {user.username}")
            print(f"  Full Name: {user.first_name} {user.last_name}")
            print(f"  Role: {user.role}")
            print(f"  User Type: {user.user_type}")
            print(f"  Verified: {user.is_verified}")
            print(f"  Active: {user.is_active}")
            if user.farm_name:
                print(f"  Farm Name: {user.farm_name}")
            if user.business_name:
                print(f"  Business Name: {user.business_name}")
            print()
        
        print("=" * 60)
        print("LOGIN CREDENTIALS:")
        print("=" * 60)
        
        # Check for demo users
        demo_buyer = db.query(User).filter(User.email == "demo@farmconnect.com").first()
        if demo_buyer:
            print("\n[SUCCESS] Demo Buyer Account:")
            print(f"  Email: demo@farmconnect.com")
            print(f"  Password: Demo1234")
            print(f"  Verified: {demo_buyer.is_verified}")
            print(f"  Active: {demo_buyer.is_active}")
        
        demo_farmer = db.query(User).filter(User.email == "farmer@farmconnect.com").first()
        if demo_farmer:
            print("\n[SUCCESS] Demo Farmer Account:")
            print(f"  Email: farmer@farmconnect.com")
            print(f"  Password: Farmer1234")
            print(f"  Verified: {demo_farmer.is_verified}")
            print(f"  Active: {demo_farmer.is_active}")
        
        print("\n" + "=" * 60)
        
except Exception as e:
    print(f"[ERROR] Error checking users: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

