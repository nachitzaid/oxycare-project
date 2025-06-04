"""add accessoires_utilises to interventions

Revision ID: add_accessoires
Revises: add_statut_to_interventions
Create Date: 2024-06-02 17:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_accessoires'
down_revision = 'add_statut_to_interventions'
branch_labels = None
depends_on = None

def upgrade():
    # Add accessoires_utilises column to interventions table if it doesn't exist
    try:
        op.add_column('interventions', sa.Column('accessoires_utilises', sa.Text(), nullable=True))
    except Exception as e:
        if "Duplicate column name" not in str(e):
            raise e

def downgrade():
    # Remove accessoires_utilises column from interventions table
    op.drop_column('interventions', 'accessoires_utilises') 