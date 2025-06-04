"""add reglage_id to interventions

Revision ID: add_reglage_id_to_interventions
Revises: add_hu_re_to_reglages
Create Date: 2024-03-19 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'add_reglage_id_to_interventions'
down_revision = 'add_hu_re_to_reglages'
branch_labels = None
depends_on = None

def upgrade():
    # Vérifier si la colonne existe déjà
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('interventions')]
    
    if 'reglage_id' not in columns:
        op.add_column('interventions', sa.Column('reglage_id', sa.Integer(), nullable=True))
        op.create_foreign_key(
            'fk_intervention_reglage',
            'interventions',
            'reglages',
            ['reglage_id'],
            ['id'],
            ondelete='SET NULL'
        )

def downgrade():
    op.drop_constraint('fk_intervention_reglage', 'interventions', type_='foreignkey')
    op.drop_column('interventions', 'reglage_id') 