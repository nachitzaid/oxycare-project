"""add statut to interventions

Revision ID: add_statut_to_interventions
Revises: add_lieu_to_interventions
Create Date: 2024-06-02 17:35:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_statut_to_interventions'
down_revision = 'add_lieu_to_interventions'
branch_labels = None
depends_on = None

def upgrade():
    # Add statut column to interventions table
    op.add_column('interventions', sa.Column('statut', sa.String(20), nullable=True))
    
    # Update existing rows to have a default value
    op.execute("UPDATE interventions SET statut = 'planifiee' WHERE statut IS NULL")
    
    # Make the column non-nullable after setting default values
    op.alter_column('interventions', 'statut',
                    existing_type=sa.String(20),
                    nullable=False)

def downgrade():
    # Remove statut column from interventions table
    op.drop_column('interventions', 'statut') 