"""Add role field to User model

Revision ID: d05fa1122697
Revises: 880beff74388
Create Date: 2025-03-23 17:44:12.858000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd05fa1122697'
down_revision = '880beff74388'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('role', sa.String(length=50), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('role')

    # ### end Alembic commands ###
