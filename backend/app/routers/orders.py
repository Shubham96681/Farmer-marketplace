# app/routers/orders.py
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from .. import schemas, models
from ..utils.auth_utils import get_current_user
from ..database import get_db

router = APIRouter()


# Create new order
@router.post("/", response_model=schemas.OrderResponse)
async def create_order(
        order_data: schemas.OrderCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Create a new order"""
    if current_user.role != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create orders"
        )

    try:
        # Generate unique order number
        order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        total_amount = 0
        order_items = []

        # Validate products and calculate total
        for item in order_data.items:
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id,
                models.Product.is_available == True
            ).first()

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} not found or unavailable"
                )

            if product.quantity_available < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough stock for {product.name}. Available: {product.quantity_available}"
                )

            item_total = product.price * item.quantity
            total_amount += item_total

            # Create order item
            order_item = models.OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=product.price,
                total_price=item_total
            )
            order_items.append(order_item)

            # Update product stock
            product.quantity_available -= item.quantity
            if product.quantity_available <= 0:
                product.is_available = False

        # Create order
        order = models.Order(
            order_number=order_number,
            customer_id=current_user.id,
            total_amount=total_amount,
            status="pending",
            payment_status="pending",
            delivery_type="standard",
            delivery_address=order_data.delivery_address
        )

        db.add(order)
        db.commit()
        db.refresh(order)

        # Add order items with order_id
        for order_item in order_items:
            order_item.order_id = order.id
            db.add(order_item)

        db.commit()
        db.refresh(order)

        return order

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating order: {str(e)}"
        )


# Get buyer's orders
@router.get("/my-orders", response_model=List[schemas.OrderResponse])
async def get_my_orders(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Get current user's orders"""
    try:
        print(f"🛒 Getting orders for buyer: {current_user.email} (ID: {current_user.id})")

        orders = db.query(models.Order).filter(
            models.Order.customer_id == current_user.id
        ).order_by(models.Order.created_at.desc()).all()

        print(f"📦 Found {len(orders)} orders for buyer {current_user.id}")
        return orders

    except Exception as e:
        print(f"❌ Error getting orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving orders")


# Get orders for farmer's products - ✅ FIXED WITH BETTER ERROR HANDLING
@router.get("/farmer-orders", response_model=List[schemas.OrderResponse])
async def get_farmer_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all orders for farmer's products"""
    try:
        if current_user.role != "farmer":
            raise HTTPException(status_code=403, detail="Only farmers can access this endpoint")

        # Get orders that contain farmer's products
        orders = db.query(models.Order).join(models.OrderItem).join(models.Product).filter(
            models.Product.farmer_id == current_user.id
        ).distinct().all()

        # Add buyer name to response
        for order in orders:
            order.buyer_name = f"{order.customer.first_name} {order.customer.last_name}"

        return orders

    except Exception as e:
        print(f"❌ Error getting farmer orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving orders")
# Get single order
@router.get("/{order_id}", response_model=schemas.OrderResponse)
async def get_order(
        order_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Get specific order"""
    try:
        order = db.query(models.Order).filter(models.Order.id == order_id).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Check if user is buyer or farmer who owns products in this order
        if current_user.role == "buyer" and order.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this order")

        if current_user.role == "farmer":
            # Check if farmer has products in this order
            farmer_products_in_order = db.query(models.OrderItem).join(models.Product).filter(
                models.OrderItem.order_id == order_id,
                models.Product.farmer_id == current_user.id
            ).first()

            if not farmer_products_in_order:
                raise HTTPException(status_code=403, detail="Not authorized to view this order")

        return order

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting order: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving order")


# Update order status
@router.patch("/{order_id}/status")
async def update_order_status(
        order_id: int,
        status_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Update order status"""
    try:
        order = db.query(models.Order).filter(models.Order.id == order_id).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")

        valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )

        # Authorization checks
        if current_user.role == "buyer":
            # Buyers can only cancel their own pending orders
            if order.customer_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to update this order")

            if new_status != "cancelled" or order.status != "pending":
                raise HTTPException(
                    status_code=403,
                    detail="Buyers can only cancel pending orders"
                )

        elif current_user.role == "farmer":
            # Farmers can update status for orders containing their products
            farmer_products_in_order = db.query(models.OrderItem).join(models.Product).filter(
                models.OrderItem.order_id == order_id,
                models.Product.farmer_id == current_user.id
            ).first()

            if not farmer_products_in_order:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized to update this order"
                )

        order.status = new_status
        db.commit()

        return {
            "message": "Order status updated successfully",
            "order_id": order.id,
            "new_status": new_status
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating order status: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating order status")


# Cancel order
@router.post("/{order_id}/cancel")
async def cancel_order(
        order_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Cancel an order"""
    try:
        order = db.query(models.Order).filter(models.Order.id == order_id).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        if order.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

        if order.status not in ["pending", "confirmed"]:
            raise HTTPException(
                status_code=400,
                detail="Order can only be cancelled when pending or confirmed"
            )

        # Restore product quantities
        for order_item in order.order_items:
            product = db.query(models.Product).filter(
                models.Product.id == order_item.product_id
            ).first()

            if product:
                product.quantity_available += order_item.quantity
                if not product.is_available:
                    product.is_available = True

        order.status = "cancelled"
        db.commit()

        return {"message": "Order cancelled successfully", "order_id": order_id}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error cancelling order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling order: {str(e)}"
        )


# Debug endpoint to check farmer orders
@router.get("/debug/farmer-orders-test")
async def debug_farmer_orders_test(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Debug endpoint to test farmer orders without schema validation"""
    try:
        print(f"🐛 DEBUG: Testing farmer orders for user: {current_user.email}")

        if current_user.role != "farmer":
            return {"error": "User is not a farmer"}

        # Simple test response
        return {
            "farmer_id": current_user.id,
            "farmer_name": current_user.farm_name,
            "message": "Farmer orders endpoint is working",
            "test_orders": [
                {
                    "id": 1,
                    "order_number": "TEST-001",
                    "status": "pending",
                    "total_amount": 5000.0,
                    "buyer_name": "Test Buyer"
                }
            ]
        }

    except Exception as e:
        return {"error": str(e)}