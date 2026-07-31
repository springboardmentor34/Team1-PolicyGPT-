"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-07-30 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='citizen'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_role', 'users', ['role'])

    # 2. policies table
    op.create_table(
        'policies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('sector', sa.String(length=100), nullable=False),
        sa.Column('ministry_or_department', sa.String(length=200), nullable=False),
        sa.Column('effective_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('uploaded_by_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_policies_id', 'policies', ['id'])
    op.create_index('ix_policies_title', 'policies', ['title'])
    op.create_index('ix_policies_sector', 'policies', ['sector'])
    op.create_index('ix_policies_ministry_or_department', 'policies', ['ministry_or_department'])
    op.create_index('ix_policies_status', 'policies', ['status'])
    op.create_index('ix_policies_uploaded_by_id', 'policies', ['uploaded_by_id'])

    # 3. schemes table
    op.create_table(
        'schemes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('policy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('policies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False, unique=True),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('benefits_summary', sa.Text(), nullable=False),
        sa.Column('budget_allocation', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_schemes_id', 'schemes', ['id'])
    op.create_index('ix_schemes_policy_id', 'schemes', ['policy_id'])
    op.create_index('ix_schemes_title', 'schemes', ['title'])
    op.create_index('ix_schemes_code', 'schemes', ['code'])
    op.create_index('ix_schemes_status', 'schemes', ['status'])

    # 4. eligibility_rules table
    op.create_table(
        'eligibility_rules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('scheme_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rule_name', sa.String(length=150), nullable=False),
        sa.Column('min_age', sa.Integer(), nullable=True),
        sa.Column('max_age', sa.Integer(), nullable=True),
        sa.Column('max_income', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('gender_requirement', sa.String(length=20), nullable=False, server_default='all'),
        sa.Column('caste_category', sa.String(length=50), nullable=False, server_default='all'),
        sa.Column('state_or_region', sa.String(length=100), nullable=False, server_default='all'),
        sa.Column('occupation_type', sa.String(length=100), nullable=False, server_default='all'),
        sa.Column('rule_criteria_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_eligibility_rules_id', 'eligibility_rules', ['id'])
    op.create_index('ix_eligibility_rules_scheme_id', 'eligibility_rules', ['scheme_id'])
    op.create_index('ix_eligibility_rules_state_or_region', 'eligibility_rules', ['state_or_region'])

    # 5. notifications table
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(length=50), nullable=False, server_default='system'),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_notifications_id', 'notifications', ['id'])
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_notification_type', 'notifications', ['notification_type'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])

    # 6. feedback table
    op.create_table(
        'feedback',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scheme_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('schemes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='general'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='chk_feedback_rating_range'),
    )
    op.create_index('ix_feedback_id', 'feedback', ['id'])
    op.create_index('ix_feedback_user_id', 'feedback', ['user_id'])
    op.create_index('ix_feedback_scheme_id', 'feedback', ['scheme_id'])

    # 7. reports table
    op.create_table(
        'reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('report_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('parameters_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('content_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_reports_id', 'reports', ['id'])
    op.create_index('ix_reports_user_id', 'reports', ['user_id'])
    op.create_index('ix_reports_report_type', 'reports', ['report_type'])
    op.create_index('ix_reports_status', 'reports', ['status'])

    # 8. audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.String(length=100), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('details_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_audit_logs_id', 'audit_logs', ['id'])
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'])

    # 9. search_history table
    op.create_table(
        'search_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('search_query', sa.Text(), nullable=False),
        sa.Column('filters_applied', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('results_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_search_history_id', 'search_history', ['id'])
    op.create_index('ix_search_history_user_id', 'search_history', ['user_id'])


def downgrade() -> None:
    op.drop_table('search_history')
    op.drop_table('audit_logs')
    op.drop_table('reports')
    op.drop_table('feedback')
    op.drop_table('notifications')
    op.drop_table('eligibility_rules')
    op.drop_table('schemes')
    op.drop_table('policies')
    op.drop_table('users')
