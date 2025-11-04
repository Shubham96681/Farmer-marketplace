# app/main.py
import sys
from pathlib import Path

# Add the backend directory to Python path to fix imports when running directly
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from passlib.context import CryptContext
import logging
import uvicorn
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security setup
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from app.database import engine, Base
from app.routers import auth, products, orders

# Create tables
Base.metadata.create_all(bind=engine)

# ✅ CREATE ONLY ONE FastAPI APP
app = FastAPI(
    title="FarmConnect API",
    description="Nigerian Agricultural Marketplace Backend",
    version="1.0.0"
)

# ✅ CORS MIDDLEWARE - ONLY ONCE
from fastapi.middleware.cors import CORSMiddleware

# CORS origins - allow all localhost ports in development
origins = [
    "http://localhost:5173",   # for Vite
    "http://127.0.0.1:5173",
    "http://localhost:3000",   # for React dev server
    "http://127.0.0.1:3000",
    "http://localhost:5174",   # Vite alternate port
    "http://127.0.0.1:5174",
]

# Custom middleware to add CORS headers to all responses
class CORSMiddlewareHandler(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            response = Response()
            if origin in origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                response.headers["Access-Control-Allow-Headers"] = "*"
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Max-Age"] = "3600"
            return response
        
        # Process the request
        try:
            response = await call_next(request)
        except Exception as e:
            # If an exception occurs, create a response with CORS headers
            logger.error(f"Exception in middleware: {e}", exc_info=True)
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "error": str(e)}
            )
            # Add CORS headers to error response
            if origin in origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                response.headers["Access-Control-Allow-Headers"] = "*"
            return response
        
        # Add CORS headers to response
        if origin in origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
        
        return response

# Add custom CORS middleware first
app.add_middleware(CORSMiddlewareHandler)

# Also add FastAPI's CORS middleware as backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global exception handler to ensure CORS headers are always sent
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with CORS headers"""
    origin = request.headers.get("origin")
    if origin in origins:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
            }
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler that ensures CORS headers are always present"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    origin = request.headers.get("origin")
    headers = {}
    if origin in origins:
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error", "error": str(exc)},
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with CORS headers"""
    origin = request.headers.get("origin")
    headers = {}
    if origin in origins:
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
        headers=headers
    )


# ✅ MOUNT STATIC FILES FOR IMAGE UPLOADS
app.mount("/media", StaticFiles(directory="media"), name="media")

# ✅ INCLUDE ROUTERS WITH CORRECT VARIABLES
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

# ✅ HEALTH CHECK ENDPOINTS
@app.get("/")
async def root():
    return {"message": "FarmConnect API is running on port 8002!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "port": 8002}

@app.get("/api/health")
async def api_health_check():
    return {"status": "healthy", "message": "FarmConnect API is running on port 8002"}

# ✅ ADD THIS TO RUN ON PORT 8002
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8002, reload=True)