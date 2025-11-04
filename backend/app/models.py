# app/models.py
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

# Import Base from database to ensure we use the same Base instance
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), default="Nigeria")
    role = Column(String(20), nullable=False)
    user_type = Column(String(20), nullable=False)

    farm_name = Column(String(255), nullable=True)
    farm_size = Column(String(100), nullable=True)
    farm_type = Column(String(100), nullable=True)
    years_farming = Column(Integer, nullable=True)

    business_name = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=True)
    business_reg_number = Column(String(100), nullable=True)

    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)

    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # ✅ FIXED: Changed products_as_farmer to products
    products = relationship("Product", foreign_keys="Product.farmer_id", back_populates="farmer")
    orders_as_customer = relationship("Order", foreign_keys="Order.customer_id", back_populates="customer")
    reviews_as_user = relationship("Review", foreign_keys="Review.user_id", back_populates="user")
    reviews_as_farmer = relationship("Review", foreign_keys="Review.farmer_id", back_populates="farmer")
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False)

    profile_photo = Column(String(500), nullable=True)
    farm_photo = Column(String(500), nullable=True)


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    farm_name = Column(String(255), nullable=False)
    farm_size = Column(String(100), nullable=False)
    farm_type = Column(String(100), nullable=False)
    years_farming = Column(Integer, nullable=True)
    certification = Column(JSON, nullable=True)
    farm_description = Column(Text, nullable=True)
    farm_photo = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())

    user = relationship("User", back_populates="farmer_profile")


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    business_type = Column(String(100), nullable=False)
    business_reg_number = Column(String(100), nullable=False)
    business_description = Column(Text, nullable=True)
    business_logo = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())

    user = relationship("User", back_populates="business_profile")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    product = relationship("Product", back_populates="images")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    quantity_available = Column(Integer, default=0)
    unit = Column(String(50), nullable=False)
    min_order_quantity = Column(Integer, default=1)
    is_available = Column(Boolean, default=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    farmer = relationship("User", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    # ✅ ADDED: Missing reviews relationship
    reviews = relationship("Review", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending")
    payment_status = Column(String(50), default="pending")
    delivery_type = Column(String(50), nullable=False)
    delivery_address = Column(Text, nullable=True)
    delivery_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    customer = relationship("User", foreign_keys=[customer_id], back_populates="orders_as_customer")
    order_items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="reviews_as_user")
    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="reviews_as_farmer")
    product = relationship("Product", back_populates="reviews")