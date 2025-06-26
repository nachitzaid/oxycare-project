"""add hu re to reglages

Revision ID: add_hu_re_to_reglages
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'add_hu_re_to_reglages'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Vérifier si les colonnes existent déjà
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('reglages')]
    
    if 'hu' not in columns:
        op.add_column('reglages', sa.Column('hu', sa.Float(), nullable=True))
    
    if 're' not in columns:
        op.add_column('reglages', sa.Column('re', sa.Float(), nullable=True))

def downgrade():
    op.drop_column('reglages', 're')
    op.drop_column('reglages', 'hu') 