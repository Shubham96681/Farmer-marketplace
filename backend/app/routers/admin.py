from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
 # import from above

router = APIRouter(prefix="/admin", tags=["Admin"])

# 👥 List all users
@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin=Depends(get_current_user)):
    query = db.query(models.User)
    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "users": users
    }

# 🚫 Ban / deactivate user
@router.put("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    return {"message": f"User {user.email} has been deactivated"}

# 🛒 Admin create product
@router.post("/products")
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    new_product = models.Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# ✏️ Admin update product
@router.put("/products/{product_id}")
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product.dict(exclude_unset=True).items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product

# ❌ Admin delete product
@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..utils.auth_utils import get_current_user
from ..database import get_db

router = APIRouter()


# Make sure this line is correct - NO parentheses after get_current_user
@router.get("/admin/dashboard")
async def admin_dashboard(
        admin: models.User = Depends(get_current_user),  # ← NO () here!
        db: Session = Depends(get_db)
):
    # Check if user is admin
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Admin dashboard logic here
    return {"message": "Admin dashboard", "user": admin.email}