# app/schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import re

# ==============================
# USER SCHEMAS
# ==============================
class UserBase(BaseModel):
    email: str
    phone: str
    username: str
    first_name: str
    last_name: str
    address: str
    city: str
    state: str
    country: str = "Nigeria"
    role: str  # 'farmer' or 'buyer'
    user_type: str  # 'individual' or 'business'


class UserCreate(UserBase):
    password: str
    confirm_password: str
    terms_agreed: bool = Field(..., description="Must agree to terms")
    farm_name: Optional[str] = None
    farm_size: Optional[str] = None
    farm_type: Optional[str] = None
    years_farming: Optional[int] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_reg_number: Optional[str] = None

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('terms_agreed')
    def terms_must_be_true(cls, v):
        if not v:
            raise ValueError('You must agree to the terms and conditions')
        return v

    @validator('phone')
    def phone_valid(cls, v):
        clean_phone = v.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if not re.match(r"^\+?[0-9]{10,15}$", clean_phone):
            raise ValueError('Invalid phone number format')
        return clean_phone

    @validator('username')
    def username_alphanumeric(cls, v):
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError('Username must be alphanumeric with underscores only')
        return v


class UserLogin(BaseModel):
    email: str
    password: str


class UserVerify(BaseModel):
    email: str
    verification_code: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    role: str
    user_type: str
    phone: str
    address: str
    city: str
    state: str
    country: str
    farm_name: Optional[str] = None
    farm_size: Optional[str] = None
    farm_type: Optional[str] = None
    years_farming: Optional[int] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_reg_number: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==============================
# PRODUCT SCHEMAS
# ==============================
class ProductImageBase(BaseModel):
    image_url: str


class ProductImageResponse(ProductImageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    unit: str
    quantity_available: int  # ✅ changed here


class ProductCreate(ProductBase):
    image_urls: List[str] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    quantity_available: Optional[int] = None  # ✅ changed here
    is_available: Optional[bool] = None
    min_order_quantity: Optional[int] = None
    image_urls: Optional[List[str]] = None


class ProductResponse(ProductBase):
    id: int
    farmer_id: int
    is_available: bool
    min_order_quantity: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    images: List[ProductImageResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# ==============================
# ORDER SCHEMAS
# ==============================
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: str
    delivery_type: str = "standard"


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: int
    total_amount: float
    status: str
    payment_status: str
    delivery_address: str
    delivery_type: str
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse] = []
    buyer_name: Optional[str] = None

    class Config:
        from_attributes = True


# ==============================
# REVIEW SCHEMAS
# ==============================
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

    @validator('rating')
    def validate_rating(cls, v):
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class ReviewCreate(ReviewBase):
    product_id: Optional[int] = None
    farmer_id: Optional[int] = None


class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    product_id: Optional[int] = None
    farmer_id: Optional[int] = None
    user_name: str
    created_at: datetime
    is_approved: bool = True

    class Config:
        from_attributes = True


# ==============================
# PROFILE SCHEMAS
# ==============================
class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    farm_name: Optional[str] = None
    farm_size: Optional[str] = None
    farm_type: Optional[str] = None
    years_farming: Optional[int] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_reg_number: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        clean_phone = v.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if not re.match(r"^\+?[0-9]{10,15}$", clean_phone):
            raise ValueError('Invalid phone number format')
        return clean_phone


# ==============================
# AUTH TOKEN SCHEMA
# ==============================
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ==============================
# ANALYTICS SCHEMAS
# ==============================
class MonthlyEarnings(BaseModel):
    month: str
    earned: float


class ProductPerformance(BaseModel):
    product: str
    revenue: float
    sales: int


class AnalyticsResponse(BaseModel):
    total_earnings: float
    total_orders: int
    active_products: int
    total_customers: int
    monthly_earnings: List[MonthlyEarnings]
    product_performance: List[ProductPerformance]
    customer_ratings: float


# ==============================
# NOTIFICATION SCHEMA
# ==============================
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==============================
# MISC RESPONSES
# ==============================
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
