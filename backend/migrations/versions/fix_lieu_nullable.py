"""fix lieu nullable

Revision ID: fix_lieu_nullable
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fix_lieu_nullable'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Modifier la colonne lieu pour la rendre nullable
    op.alter_column('interventions', 'lieu',
                    existing_type=sa.String(200),
                    nullable=True)

def downgrade():
    # Revenir à l'état précédent (non nullable)
    op.alter_column('interventions', 'lieu',
                    existing_type=sa.String(200),
                    nullable=False) 