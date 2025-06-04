"""add traitement to interventions

Revision ID: add_traitement_to_interventions
Revises: 6caad8d2d45b
Create Date: 2024-03-02 17:05:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_traitement_to_interventions'
down_revision = '6caad8d2d45b'
branch_labels = None
depends_on = None

def upgrade():
    # Ajoute chaque colonne seulement si elle n'existe pas déjà
    conn = op.get_bind()
    table = 'interventions'
    columns = {
        'traitement':   "ALTER TABLE interventions ADD COLUMN traitement VARCHAR(50) NOT NULL DEFAULT 'Oxygénothérapie'",
        'type_intervention':   "ALTER TABLE interventions ADD COLUMN type_intervention VARCHAR(50) NOT NULL DEFAULT 'Installation'",
        'etat_materiel':   "ALTER TABLE interventions ADD COLUMN etat_materiel VARCHAR(20) NULL",
        'type_concentrateur':   "ALTER TABLE interventions ADD COLUMN type_concentrateur VARCHAR(20) NULL",
        'mode_ventilation':   "ALTER TABLE interventions ADD COLUMN mode_ventilation VARCHAR(20) NULL",
        'type_masque':   "ALTER TABLE interventions ADD COLUMN type_masque VARCHAR(20) NULL",
    }
    for col, sql in columns.items():
        res = conn.execute(sa.text(f"SHOW COLUMNS FROM {table} LIKE '{col}'"))
        if res.fetchone() is None:
            conn.execute(sa.text(sql))

def downgrade():
    # Supprime les colonnes ajoutées
    conn = op.get_bind()
    table = 'interventions'
    for col in ['traitement', 'type_intervention', 'etat_materiel', 'type_concentrateur', 'mode_ventilation', 'type_masque']:
        res = conn.execute(sa.text(f"SHOW COLUMNS FROM {table} LIKE '{col}'"))
        if res.fetchone() is not None:
            conn.execute(sa.text(f"ALTER TABLE {table} DROP COLUMN {col}")) 