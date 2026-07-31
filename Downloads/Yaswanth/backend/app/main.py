from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.policies import router as policies_router
from app.api.schemes import router as schemes_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API for PolicyGPT - Government Policy & Public Scheme Intelligence Platform.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Angular frontend
origins = settings.cors_origins_list
if "http://localhost:4200" not in origins:
    origins.append("http://localhost:4200")
if "http://127.0.0.1:4200" not in origins:
    origins.append("http://127.0.0.1:4200")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(policies_router)
app.include_router(schemes_router)


@app.get("/", tags=["Health Check"])
def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
