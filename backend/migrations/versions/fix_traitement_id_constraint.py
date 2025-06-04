"""fix traitement_id constraint

Revision ID: fix_traitement_id_constraint
Revises: add_technical_cols
Create Date: 2024-06-03 19:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fix_traitement_id_constraint'
down_revision = 'add_technical_cols'
branch_labels = None
depends_on = None

def upgrade():
    # Vérifier si la colonne traitement_id existe
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('interventions')]
    
    if 'traitement_id' in columns:
        # Supprimer la contrainte NOT NULL si elle existe
        op.alter_column('interventions', 'traitement_id',
                       existing_type=sa.Integer(),
                       nullable=True)

def downgrade():
    # Rétablir la contrainte NOT NULL
    op.alter_column('interventions', 'traitement_id',
                   existing_type=sa.Integer(),
                   nullable=False) 