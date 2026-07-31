"""add_phone_number_to_users

Revision ID: 002_add_phone_number
Revises: 001_initial_schema
Create Date: 2026-07-31 15:13:00.000000

Frontend Alignment:
    The Angular Register page (register.component.html) collects a Phone Number
    field (type="tel"). This migration adds the corresponding phone_number column
    to the users table so the FastAPI backend can persist it without further
    schema changes.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_add_phone_number'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add phone_number column to users table (nullable — existing rows default to NULL)
    op.add_column(
        'users',
        sa.Column('phone_number', sa.String(length=20), nullable=True)
    )
    # Create index for fast phone number lookups
    op.create_index('ix_users_phone_number', 'users', ['phone_number'])


def downgrade() -> None:
    # Remove index first, then the column
    op.drop_index('ix_users_phone_number', table_name='users')
    op.drop_column('users', 'phone_number')
