"""add parametres to interventions

Revision ID: add_parametres_to_interventions
Revises: add_reglage_id_to_interventions
Create Date: 2024-03-19 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'add_parametres_to_interventions'
down_revision = 'add_reglage_id_to_interventions'
branch_labels = None
depends_on = None

def upgrade():
    # Vérifier si la colonne existe déjà
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('interventions')]
    
    if 'parametres' not in columns:
        op.add_column('interventions', sa.Column('parametres', sa.JSON, nullable=True))

def downgrade():
    op.drop_column('interventions', 'parametres') 