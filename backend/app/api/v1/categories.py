import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Category, User, AuditLog
from app.schemas.schemas import CategoryCreate, CategoryOut
from app.api.deps import require_roles

router = APIRouter(prefix="/categories", tags=["Categories Management"])

DEFAULT_CATEGORIES = [
    "Agriculture", "Healthcare", "Education", "Employment", "Housing",
    "Finance", "Women & Child Welfare", "Environment", "Digital Infrastructure",
    "Skill Development", "Farmer Welfare", "Business Support", "Scholarships"
]

def generate_slug(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    return re.sub(r'[\s_-]+', '-', slug)

@router.get("/", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    # Auto-seed initial categories if table is empty
    count = db.query(Category).count()
    if count == 0:
        for cat_name in DEFAULT_CATEGORIES:
            slug = generate_slug(cat_name)
            existing = db.query(Category).filter(Category.slug == slug).first()
            if not existing:
                c = Category(name=cat_name, slug=slug, type="BOTH", is_active=True)
                db.add(c)
        db.commit()

    return db.query(Category).filter(Category.is_active == True).order_by(Category.name.asc()).all()

@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    name = cat_in.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name cannot be empty")

    slug = generate_slug(name)
    existing = db.query(Category).filter((Category.name.ilike(name)) | (Category.slug == slug)).first()
    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            db.refresh(existing)
            return existing
        raise HTTPException(status_code=400, detail=f"Category '{name}' already exists")

    category = Category(
        name=name,
        slug=slug,
        description=cat_in.description,
        type=cat_in.type or "BOTH",
        is_active=True
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    audit = AuditLog(
        user_id=current_user.id,
        action="CATEGORY_CREATE",
        resource="CATEGORY",
        details=f"Created category '{category.name}' (ID: {category.id})"
    )
    db.add(audit)
    db.commit()

    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.is_active = False
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="CATEGORY_DEACTIVATE",
        resource="CATEGORY",
        details=f"Deactivated category '{category.name}' (ID: {category_id})"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Category '{category.name}' deactivated."}
