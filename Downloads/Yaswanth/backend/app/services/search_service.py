from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import Policy, Scheme


def search_items(db: Session, query: str):

    results = []

    policies = db.query(Policy).filter(
        or_(
            Policy.title.ilike(f"%{query}%"),
            Policy.description.ilike(f"%{query}%"),
            Policy.sector.ilike(f"%{query}%")
        )
    ).all()


    for policy in policies:
        results.append({
            "id": policy.id,
            "title": policy.title,
            "type": "policy",
            "description": policy.description
        })


    schemes = db.query(Scheme).filter(
        or_(
            Scheme.title.ilike(f"%{query}%"),
            Scheme.summary.ilike(f"%{query}%"),
            Scheme.code.ilike(f"%{query}%")
        )
    ).all()


    for scheme in schemes:
        results.append({
            "id": scheme.id,
            "title": scheme.title,
            "type": "scheme",
            "description": scheme.summary
        })


    return results