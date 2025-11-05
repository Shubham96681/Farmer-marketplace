# app/routers/products.py
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil
import uuid

from .. import schemas, models
from ..utils.auth_utils import get_current_user
from ..database import get_db

router = APIRouter()

# Image upload directory
UPLOAD_DIR = "media/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Products API is running"}

# Get all products with optional filtering
@router.get("/", response_model=List[schemas.ProductResponse])
async def get_products(
        category: Optional[str] = Query(None, description="Filter by category"),
        min_price: Optional[float] = Query(None, description="Minimum price"),
        max_price: Optional[float] = Query(None, description="Maximum price"),
        farmer_id: Optional[int] = Query(None, description="Filter by farmer ID"),
        db: Session = Depends(get_db)
):
    """Get all products with optional filtering"""
    try:
        # Get all available products (is_available is True or None/not explicitly False)
        from sqlalchemy import or_
        query = db.query(models.Product).filter(
            or_(
                models.Product.is_available == True,
                models.Product.is_available.is_(None)
            )
        )

        if category:
            query = query.filter(models.Product.category.ilike(f"%{category}%"))
        if min_price is not None:
            query = query.filter(models.Product.price >= min_price)
        if max_price is not None:
            query = query.filter(models.Product.price <= max_price)
        if farmer_id:
            query = query.filter(models.Product.farmer_id == farmer_id)

        products = query.order_by(models.Product.created_at.desc()).all()
        return products

    except Exception as e:
        print(f"❌ Error getting products: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving products")


# Get single product by ID
@router.get("/", response_model=List[schemas.ProductResponse])
async def get_products(farmer_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all products (or products by farmer)"""
    try:
        query = db.query(models.Product)
        if farmer_id:
            query = query.filter(models.Product.farmer_id == farmer_id)
        products = query.all()
        return products
    except Exception as e:
        print(f"❌ Error getting products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/", response_model=schemas.ProductResponse)  # ✅ This should be ProductResponse, not ProductCreate
async def create_product(
        product: schemas.ProductCreate,  # ✅ This should be ProductCreate for input
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    try:
        print(f"👨‍🌾 Creating product for farmer: {current_user.email}")
        print(f"📦 Product data received: {product.dict()}")

        # Create product
        db_product = models.Product(
            name=product.name,
            description=product.description,
            price=product.price,
            category=product.category,
            unit=product.unit,
            quantity_available=product.quantity_available,  # ✅ Fixed: Use quantity_available (matches schema and model)
            farmer_id=current_user.id,
            is_available=True,
            min_order_quantity=1
        )

        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        print(f"✅ Product created: {db_product.name}")

        return db_product

    except ValueError as e:
        db.rollback()
        print(f"❌ Validation error creating product: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating product: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")
        #Update product (Farmer only)


@router.put("/{product_id}", response_model=schemas.ProductResponse)
async def update_product(
        product_id: int,
        product_data: schemas.ProductUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Update product (Farmer only)"""
    try:
        if current_user.role != "farmer":
            raise HTTPException(status_code=403, detail="Only farmers can update products")

        product = db.query(models.Product).filter(
            models.Product.id == product_id,
            models.Product.farmer_id == current_user.id
        ).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Update only provided fields
        update_data = product_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(product, field):
                setattr(product, field, value)

        product.updated_at = datetime.utcnow()  # ✅ Update timestamp
        db.commit()
        db.refresh(product)

        return product

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating product")


# Delete product (Farmer only)
@router.delete("/{product_id}")
async def delete_product(
        product_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Delete product (Farmer only)"""
    try:
        if current_user.role != "farmer":
            raise HTTPException(status_code=403, detail="Only farmers can delete products")

        product = db.query(models.Product).filter(
            models.Product.id == product_id,
            models.Product.farmer_id == current_user.id
        ).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Soft delete
        product.is_available = False
        product.updated_at = datetime.utcnow()
        db.commit()

        return {"message": "Product deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting product: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting product")


# Get product categories
@router.get("/categories/list")
async def get_categories(db: Session = Depends(get_db)):
    """Get all product categories"""
    try:
        categories = db.query(models.Product.category).distinct().all()
        return [category[0] for category in categories if category[0]]

    except Exception as e:
        print(f"❌ Error getting categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving categories")


# ✅ UPLOAD MULTIPLE IMAGES - FIXED
@router.post("/{product_id}/upload-images")
async def upload_product_images(
        product_id: int,
        files: List[UploadFile] = File(...),
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Upload multiple product images"""
    try:
        print(f"📸 Uploading {len(files)} images for product {product_id} by user {current_user.email}")

        # Check if product exists and belongs to current user
        product = db.query(models.Product).filter(
            models.Product.id == product_id,
            models.Product.farmer_id == current_user.id
        ).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
        max_file_size = 10 * 1024 * 1024  # 10MB
        image_urls = []

        for file in files:
            # Validate file type
            if file.content_type not in allowed_types:
                print(f"❌ Invalid file type: {file.content_type}")
                continue  # Skip invalid files instead of throwing error

            # Validate file size
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset to beginning

            if file_size > max_file_size:
                print(f"❌ File too large: {file.filename}")
                continue  # Skip files that are too large

            # Generate unique filename
            file_extension = file.filename.split('.')[-1]
            filename = f"{product_id}_{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)

            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # ✅ FIX: Create proper URL for frontend access
            image_url = f"/media/products/{filename}"

            # Create ProductImage record
            product_image = models.ProductImage(
                product_id=product.id,
                image_url=image_url
            )
            db.add(product_image)
            image_urls.append(image_url)

        db.commit()

        print(f"✅ Successfully uploaded {len(image_urls)} images for product {product_id}")
        return {
            "message": f"Successfully uploaded {len(image_urls)} images",
            "image_urls": image_urls
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error uploading images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading images: {str(e)}")


# ✅ DELETE SPECIFIC IMAGE
@router.delete("/{product_id}/images/{image_id}")
async def delete_product_image(
        product_id: int,
        image_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Delete specific product image"""
    try:
        # Check if product exists and belongs to current user
        product = db.query(models.Product).filter(
            models.Product.id == product_id,
            models.Product.farmer_id == current_user.id
        ).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Find the specific image
        product_image = db.query(models.ProductImage).filter(
            models.ProductImage.id == image_id,
            models.ProductImage.product_id == product_id
        ).first()

        if not product_image:
            raise HTTPException(status_code=404, detail="Image not found")

        # Delete file from storage
        if product_image.image_url:
            # Remove the /media/ prefix to get the actual file path
            file_path = product_image.image_url.replace("/media/", "")
            full_path = os.path.join("media", file_path)
            if os.path.exists(full_path):
                os.remove(full_path)

        # Delete image record from database
        db.delete(product_image)
        db.commit()

        return {"message": "Image deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting image")


# ✅ DELETE ALL PRODUCT IMAGES
@router.delete("/{product_id}/images")
async def delete_all_product_images(
        product_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Delete all product images"""
    try:
        product = db.query(models.Product).filter(
            models.Product.id == product_id,
            models.Product.farmer_id == current_user.id
        ).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Get all product images
        product_images = db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product_id
        ).all()

        # Delete files from storage
        for product_image in product_images:
            if product_image.image_url:
                # Remove the /media/ prefix to get the actual file path
                file_path = product_image.image_url.replace("/media/", "")
                full_path = os.path.join("media", file_path)
                if os.path.exists(full_path):
                    os.remove(full_path)

        # Delete all image records from database
        db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product_id
        ).delete()

        db.commit()

        return {"message": "All images deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting images: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting images")