"""add lieu to interventions

Revision ID: add_lieu_to_interventions
Revises: add_traitement_to_interventions
Create Date: 2024-06-02 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_lieu_to_interventions'
down_revision = 'add_traitement_to_interventions'
branch_labels = None
depends_on = None

def upgrade():
    # Add lieu column to interventions table
    op.add_column('interventions', sa.Column('lieu', sa.String(200), nullable=True))
    
    # Update existing rows to have a default value
    op.execute("UPDATE interventions SET lieu = 'Domicile' WHERE lieu IS NULL")
    
    # Make the column non-nullable after setting default values
    op.alter_column('interventions', 'lieu',
                    existing_type=sa.String(200),
                    nullable=False)

def downgrade():
    # Remove lieu column from interventions table
    op.drop_column('interventions', 'lieu') 