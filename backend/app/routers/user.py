# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    country = Column(String, default="Nigeria")
    role = Column(String, nullable=False)  # 'farmer' or 'buyer'
    user_type = Column(String, nullable=False)  # 'individual' or 'business'
    terms_agreed = Column(Boolean, default=False)

    # Farmer-specific fields
    farm_name = Column(String, nullable=True)
    farm_size = Column(String, nullable=True)
    farm_type = Column(String, nullable=True)
    years_farming = Column(Integer, nullable=True)

    # Business buyer-specific fields
    business_name = Column(String, nullable=True)
    business_type = Column(String, nullable=True)
    business_reg_number = Column(String, nullable=True)

    is_active = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())