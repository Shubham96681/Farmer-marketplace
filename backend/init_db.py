#!/usr/bin/env python3
"""
Initialize the database by creating all tables
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import User, Product, Order, Review, FarmerProfile, BusinessProfile

# Create all tables
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")

