# app/routers/auth.py
from fastapi import  File, UploadFile
from fastapi import Form
import uuid
import os

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import string
from pydantic import BaseModel, validator
from typing import Optional
import re

from app.database import get_db
from app.models import User, FarmerProfile, BusinessProfile
from app.utils.auth_utils import hash_password, verify_password, create_access_token, get_current_user
from app.utils.email_service import email_service

router = APIRouter()

# Store temporary unverified users
temp_users_store = {}


# Pydantic Models
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
    role: str
    user_type: str


class UserCreate(UserBase):
    password: str
    confirm_password: str
    terms_agreed: bool

    # Optional fields
    farm_name: Optional[str] = None
    farm_size: Optional[str] = None
    farm_type: Optional[str] = None
    years_farming: Optional[int] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_reg_number: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if not re.match(r'^\+234[0-9]{10}$', v):
            raise ValueError('Phone must be in format: +234XXXXXXXXXX (10 digits after +234)')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('role')
    def validate_role(cls, v):
        if v not in ['farmer', 'buyer']:
            raise ValueError('Role must be farmer or buyer')
        return v

    @validator('user_type')
    def validate_user_type(cls, v):
        if v not in ['individual', 'business']:
            raise ValueError('User type must be individual or business')
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
    phone: str
    username: str
    first_name: str
    last_name: str
    address: str
    city: str
    state: str
    country: str
    role: str
    user_type: str
    farm_name: Optional[str] = None
    farm_size: Optional[str] = None
    farm_type: Optional[str] = None
    years_farming: Optional[int] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_reg_number: Optional[str] = None
    is_verified: bool
    is_active: bool

    class Config:
        from_attributes = True


# In auth.py - update the ProfileUpdate model to be more flexible
class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
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

    # Make all validations more flexible
    @validator('*', pre=True)
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v

    # Make phone validation optional and more flexible
    @validator('phone', pre=True, always=True)
    def validate_phone(cls, v):
        if v is None or v == "":
            return v
        # Remove any formatting and check if it's a valid Nigerian number
        clean_phone = str(v).replace(' ', '').replace('-', '').replace('(', '').replace(')', '')

        # Accept various Nigerian phone formats
        if clean_phone.startswith('+234'):
            if len(clean_phone) == 14:  # +2348012345678
                return clean_phone
        elif clean_phone.startswith('234'):
            if len(clean_phone) == 13:  # 2348012345678
                return '+' + clean_phone
        elif clean_phone.startswith('0'):
            if len(clean_phone) == 11:  # 08012345678
                return '+234' + clean_phone[1:]
        else:
            # If it doesn't match common formats, just return as is for now
            return v

        return v

    @validator('email', pre=True, always=True)
    def validate_email(cls, v):
        if v is None or v == "":
            return v
        # Basic email validation
        if "@" not in v or "." not in v:
            raise ValueError('Invalid email format')
        return v


def generate_reset_token(length=32):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ADD THIS TO YOUR auth.py FILE



@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
        user_data: UserCreate,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    try:
        print(f"STARTING REGISTRATION PROCESS")
        print(f"Registration attempt for: {user_data.email}")

        # Step 1: Check if user already exists
        print("Step 1: Checking existing users...")
        existing_user = db.query(User).filter(
            (User.email == user_data.email) |
            (User.phone == user_data.phone) |
            (User.username == user_data.username)
        ).first()

        if existing_user:
            if existing_user.email == user_data.email:
                print("Email already exists")
                raise HTTPException(status_code=400, detail="Email already registered")
            if existing_user.phone == user_data.phone:
                print("Phone already exists")
                raise HTTPException(status_code=400, detail="Phone number already registered")
            if existing_user.username == user_data.username:
                print("Username already exists")
                raise HTTPException(status_code=400, detail="Username already taken")
        print("No existing user found")

        # Step 2: Check if verification already sent
        print("Step 2: Checking temp store...")
        if user_data.email in temp_users_store:
            print("Verification already sent")
            raise HTTPException(status_code=400, detail="Verification already sent. Check your email.")
        print("No duplicate verification")

        # Step 3: Validate role-specific requirements
        print("Step 3: Validating role-specific data...")
        if user_data.role == "farmer":
            print(
                f"Farmer data: name={user_data.farm_name}, size={user_data.farm_size}, type={user_data.farm_type}")
            if not all([user_data.farm_name, user_data.farm_size, user_data.farm_type]):
                print("Missing farmer data")
                raise HTTPException(status_code=400, detail="Farm name, size, and type are required for farmers")
            print("Farmer validation passed")

        if user_data.role == "buyer" and user_data.user_type == "business":
            print(
                f"Business data: name={user_data.business_name}, type={user_data.business_type}, reg={user_data.business_reg_number}")
            if not all([user_data.business_name, user_data.business_type, user_data.business_reg_number]):
                print("Missing business data")
                raise HTTPException(status_code=400,
                                    detail="Business name, type, and registration number are required for business accounts")
            print("Business buyer validation passed")

        # Step 4: Hash password
        print("Step 4: Hashing password...")
        try:
            hashed_password = hash_password(user_data.password)
            print("Password hashed successfully")
        except Exception as hash_error:
            print(f"Password hashing failed: {hash_error}")
            raise HTTPException(status_code=500, detail="Password processing error")

        # Step 5: Generate verification code
        print("Step 5: Generating verification code...")
        try:
            verification_code = email_service.generate_verification_code()
            expires_at = datetime.utcnow() + timedelta(minutes=15)
            print(f"Generated verification code: {verification_code}")
        except Exception as code_error:
            print(f"Verification code generation failed: {code_error}")
            raise HTTPException(status_code=500, detail="Verification system error")

        # Step 6: Store user data temporarily
        print("Step 6: Storing temp user data...")
        try:
            # Create clean data without password fields
            user_dict = user_data.model_dump() if hasattr(user_data, 'model_dump') else user_data.dict()
            user_dict.pop('password', None)
            user_dict.pop('confirm_password', None)

            temp_users_store[user_data.email] = {
                **user_dict,
                "password_hash": hashed_password,
                "verification_code": verification_code,
                "expires_at": expires_at
            }
            print(f"Stored temp user: {user_data.email}")
            print(f"Temp store size: {len(temp_users_store)}")
        except Exception as store_error:
            print(f"Temp storage failed: {store_error}")
            raise HTTPException(status_code=500, detail="Temporary storage error")

        # Step 7: Send verification email
        print("Step 7: Sending verification email...")
        try:
            # Use background task to avoid blocking
            background_tasks.add_task(
                email_service.send_verification_email,
                user_data.email,
                verification_code
            )
            print("Verification email queued for sending")
        except Exception as email_error:
            print(f"Email queueing failed but continuing: {email_error}")

        print("REGISTRATION PROCESS COMPLETED SUCCESSFULLY")
        return {
            "message": "Verification code sent to your email. Please verify within 15 minutes.",
            "expires_in": "15 minutes"
        }

    except HTTPException as he:
        print(f"HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        print(f"UNEXPECTED REGISTER ERROR:")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error message: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error during registration")


@router.post("/verify")
async def verify_email(verify_data: UserVerify, db: Session = Depends(get_db)):
    try:
        print(f"Verification attempt for: {verify_data.email}")

        # Check if user exists in temp store
        if verify_data.email not in temp_users_store:
            raise HTTPException(status_code=400, detail="No pending registration found")

        user_data = temp_users_store[verify_data.email]

        # Check if verification code expired
        if datetime.utcnow() > user_data["expires_at"]:
            del temp_users_store[verify_data.email]
            raise HTTPException(status_code=400, detail="Verification code expired")

        # Check verification code
        if verify_data.verification_code != user_data["verification_code"]:
            raise HTTPException(status_code=400, detail="Invalid verification code")

        # Create user in database with all data
        user = User(
            email=user_data["email"],
            phone=user_data["phone"],
            username=user_data["username"],
            password_hash=user_data["password_hash"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            address=user_data["address"],
            city=user_data["city"],
            state=user_data["state"],
            country=user_data["country"],
            role=user_data["role"],
            user_type=user_data["user_type"],
            farm_name=user_data["farm_name"],
            farm_size=user_data["farm_size"],
            farm_type=user_data["farm_type"],
            years_farming=user_data.get("years_farming"),
            business_name=user_data["business_name"],
            business_type=user_data["business_type"],
            business_reg_number=user_data["business_reg_number"],
            is_verified=True,
            is_active=True
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"User created: {user.email} as {user.role} ({user.user_type})")

        # Create separate profiles only if needed for additional data
        if user_data["role"] == "farmer":
            farmer_profile = FarmerProfile(
                user_id=user.id,
                farm_name=user_data["farm_name"],
                farm_size=user_data["farm_size"],
                farm_type=user_data["farm_type"],
                years_farming=user_data.get("years_farming")
            )
            db.add(farmer_profile)
            print(f"Created farmer profile for: {user.email}")

        elif user_data["role"] == "buyer" and user_data["user_type"] == "business":
            business_profile = BusinessProfile(
                user_id=user.id,
                business_name=user_data["business_name"],
                business_type=user_data["business_type"],
                business_reg_number=user_data["business_reg_number"]
            )
            db.add(business_profile)
            print(f"Created business buyer profile for: {user.email}")

        db.commit()

        # Remove from temp store
        del temp_users_store[verify_data.email]

        # Create JWT token
        token = create_access_token({"sub": user.email})

        print(f"User verified and created: {user.email} as {user.role} ({user.user_type})")

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Verify error: {e}")
        import traceback
        print(f"Verify traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during verification")


@router.post("/resend-verification")
async def resend_verification(email_data: dict, db: Session = Depends(get_db)):
    try:
        email = email_data.get("email")
        print(f"Resend verification requested for: {email}")

        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        # Check if user exists in temp store
        if email not in temp_users_store:
            raise HTTPException(status_code=400, detail="No pending registration found for this email")

        user_data = temp_users_store[email]

        # Generate new verification code
        new_verification_code = email_service.generate_verification_code()
        new_expires_at = datetime.utcnow() + timedelta(minutes=15)

        # Update temp store with new code
        temp_users_store[email].update({
            "verification_code": new_verification_code,
            "expires_at": new_expires_at
        })

        # Send new verification email
        email_sent = email_service.send_verification_email(email, new_verification_code)

        if email_sent:
            print(f"New verification code sent to: {email}")
            return {
                "message": "New verification code sent to your email",
                "expires_in": "15 minutes"
            }
        else:
            print(f"Failed to send email to: {email}")
            raise HTTPException(status_code=500, detail="Failed to send verification email")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Resend verification error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during resend verification")


@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            (User.email == login_data.email) |
            (User.username == login_data.email)
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not user.is_verified:
            raise HTTPException(status_code=401, detail="Please verify your email first")

        # Create JWT token
        token = create_access_token({"sub": user.email})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during login")


# PROFILE ENDPOINTS - ✅ ONLY ONE VERSION OF EACH ENDPOINT
@router.get("/profile")
async def get_user_profile(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get current user profile"""
    try:
        print(f"Getting profile for user: {current_user.email}")
        return {
            "id": current_user.id,
            "email": current_user.email,
            "phone": current_user.phone,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "address": current_user.address,
            "city": current_user.city,
            "state": current_user.state,
            "country": current_user.country,
            "role": current_user.role,
            "user_type": current_user.user_type,
            "farm_name": current_user.farm_name,
            "farm_size": current_user.farm_size,
            "farm_type": current_user.farm_type,
            "years_farming": current_user.years_farming,
            "business_name": current_user.business_name,
            "business_type": current_user.business_type,
            "business_reg_number": current_user.business_reg_number,
            "bio": current_user.bio,  # ✅ Added bio field
            "location": current_user.location,  # ✅ Added location field
            "is_verified": current_user.is_verified,
            "is_active": current_user.is_active
        }
    except Exception as e:
        print(f"Error getting profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving profile")


# ✅ ONLY ONE PUT /profile ENDPOINT - REMOVED DUPLICATE
@router.put("/profile")
async def update_user_profile(
        profile_data: ProfileUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Update user profile - SINGLE VERSION"""
    try:
        print(f"Updating profile for user: {current_user.email}")
        profile_dict = profile_data.model_dump() if hasattr(profile_data, 'model_dump') else profile_data.dict()
        print(f"Update data received: {profile_dict}")

        # Convert Pydantic model to dict and remove None values
        update_data = {k: v for k, v in profile_dict.items() if v is not None}

        print(f"Filtered update data: {update_data}")

        if not update_data:
            return {"message": "No data provided for update"}

        updated_fields = []
        for field, value in update_data.items():
            # Check if field exists in User model
            if hasattr(current_user, field):
                old_value = getattr(current_user, field, None)
                if old_value != value:
                    setattr(current_user, field, value)
                    updated_fields.append(field)
                    print(f"Updated {field}: '{old_value}' -> '{value}'")
            else:
                print(f"Field {field} does not exist in User model")

        if updated_fields:
            db.commit()
            db.refresh(current_user)
            print(f"Profile updated successfully. Updated fields: {updated_fields}")

            return {
                "message": "Profile updated successfully",
                "updated_fields": updated_fields,
                "user": {
                    "id": current_user.id,
                    "email": current_user.email,
                    "first_name": current_user.first_name,
                    "last_name": current_user.last_name,
                    "phone": current_user.phone,
                    "farm_name": current_user.farm_name,
                    "farm_size": current_user.farm_size,
                    "farm_type": current_user.farm_type,
                    "city": current_user.city,
                    "state": current_user.state,
                    "address": current_user.address,
                    "bio": current_user.bio,  # ✅ Added bio field
                    "location": current_user.location  # ✅ Added location field
                }
            }
        else:
            print("No fields were updated")
            return {"message": "No changes detected"}

    except Exception as e:
        db.rollback()
        print(f"Error updating profile: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")


# Debug endpoints
@router.get("/debug/temp-users")
async def debug_temp_users():
    """Debug endpoint to check temporary user storage"""
    return {
        "temp_users_count": len(temp_users_store),
        "temp_users": list(temp_users_store.keys())
    }

# Add this to auth.py
@router.get("/debug/check-token")
async def debug_check_token(current_user: User = Depends(get_current_user)):
    """Debug endpoint to check if token is valid"""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "token_valid": True
    }

@router.get("/debug/temp-user/{email}")
async def debug_temp_user(email: str):
    """Debug endpoint to check specific temp user"""
    if email in temp_users_store:
        user_data = temp_users_store[email].copy()
        # Hide sensitive data
        user_data.pop('password_hash', None)
        user_data.pop('verification_code', None)
        return user_data
    else:
        raise HTTPException(status_code=404, detail="User not found in temp storage")


# Add to app/routers/auth.py
@router.post("/upload-photo")
async def upload_profile_photo(
        file: UploadFile = File(...),
        type: str = Form(...),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Upload profile or farm photo"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Validate file size (5MB max)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 5MB")

        # Generate unique filename
        file_extension = file.filename.split('.')[-1]
        filename = f"{type}_{current_user.id}_{uuid.uuid4().hex}.{file_extension}"

        # Create upload directory if it doesn't exist
        upload_dir = "uploads/profiles"
        os.makedirs(upload_dir, exist_ok=True)

        # Save file
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(contents)

        # Update user profile in database
        if type == "profile":
            current_user.profile_photo = f"/{file_path}"
        elif type == "farm":
            current_user.farm_photo = f"/{file_path}"

        db.commit()

        return {
            "message": f"{type} photo uploaded successfully",
            "photo_url": f"/{file_path}",
            "type": type
        }

    except Exception as e:
        print(f"Error uploading photo: {str(e)}")
        raise HTTPException(status_code=500, detail="Error uploading photo")
@router.post("/test-components")
async def test_components(db: Session = Depends(get_db)):
    """Test individual components to find where it fails"""
    results = {}

    try:
        # Test password hashing
        results['password_hashing'] = hash_password("Test1234")
        print("Password hashing works")
    except Exception as e:
        results['password_hashing'] = f"FAILED: {e}"
        print(f"Password hashing failed: {e}")

    try:
        # Test email service
        results['email_service'] = email_service.generate_verification_code()
        print("Email service works")
    except Exception as e:
        results['email_service'] = f"FAILED: {e}"
        print(f"Email service failed: {e}")

    try:
        # Test temp storage
        test_data = {"test": "data"}
        temp_users_store["test@example.com"] = test_data
        results['temp_storage'] = "WORKS"
        del temp_users_store["test@example.com"]
        print("Temp storage works")
    except Exception as e:
        results['temp_storage'] = f"FAILED: {e}"
        print(f"Temp storage failed: {e}")

    return results