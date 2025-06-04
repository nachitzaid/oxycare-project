"""Migration pour ajouter la colonne reglage_id à la table interventions"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # Ajouter la colonne reglage_id
    op.add_column('interventions', sa.Column('reglage_id', sa.Integer(), nullable=True))
    
    # Ajouter la contrainte de clé étrangère
    op.create_foreign_key(
        'fk_intervention_reglage',
        'interventions',
        'reglages',
        ['reglage_id'],
        ['id'],
        ondelete='SET NULL'
    )

def downgrade():
    # Supprimer la contrainte de clé étrangère
    op.drop_constraint('fk_intervention_reglage', 'interventions', type_='foreignkey')
    
    # Supprimer la colonne reglage_id
    op.drop_column('interventions', 'reglage_id') 