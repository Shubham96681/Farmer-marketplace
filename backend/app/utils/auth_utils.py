# app/utils/auth_utils.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

# ============================================================
# SECURITY CONFIG
# ============================================================
SECRET_KEY = "your-super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ============================================================
# PASSWORD UTILS
# ============================================================
from passlib.context import CryptContext

# bcrypt has a 72-byte limit; you can also switch to argon2 if needed
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hashes a password using bcrypt with a 72-byte safety limit."""
    if not isinstance(password, str):
        raise TypeError("Password must be a string")

    # bcrypt limit fix
    password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one."""
    if not isinstance(plain_password, str):
        raise TypeError("Password must be a string")

    # bcrypt limit fix
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)



# ============================================================
# JWT TOKEN UTILS
# ============================================================
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Creates a JWT access token with expiration."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """Verifies the JWT token validity and decodes it."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ============================================================
# CURRENT USER DEPENDENCY
# ============================================================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Extracts the current user from the token and fetches them from the database.
    Accepts both username or email as 'sub' claim in the token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get("sub")  # Could be email or username
        if identifier is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Try finding by email first, then by username
    user = (
        db.query(User)
        .filter((User.email == identifier) | (User.username == identifier))
        .first()
    )

    if user is None:
        raise credentials_exception

    return user
