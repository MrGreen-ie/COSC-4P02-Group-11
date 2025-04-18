"""Merge all remaining heads

Revision ID: 0e6536033b2e
Revises: 0c875b71e2d9, add_article_and_favorite_article_models, 77da5bba1e78
Create Date: 2025-04-17 19:05:53.304070

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0e6536033b2e'
down_revision = ('0c875b71e2d9', 'add_article_and_favorite_article_models', '77da5bba1e78')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
