"""add missing columns to interventions

Revision ID: add_missing_cols
Revises: add_accessoires
Create Date: 2024-06-02 17:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_missing_cols'
down_revision = 'add_accessoires'
branch_labels = None
depends_on = None

def upgrade():
    # Add missing columns to interventions table
    try:
        # Add lieu column if it doesn't exist
        try:
            op.add_column('interventions', sa.Column('lieu', sa.String(200), nullable=True))
            op.execute("UPDATE interventions SET lieu = 'Domicile' WHERE lieu IS NULL")
            op.alter_column('interventions', 'lieu', nullable=False)
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

        # Add statut column if it doesn't exist
        try:
            op.add_column('interventions', sa.Column('statut', sa.String(20), nullable=True))
            op.execute("UPDATE interventions SET statut = 'planifiee' WHERE statut IS NULL")
            op.alter_column('interventions', 'statut', nullable=False)
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

        # Add accessoires_utilises column if it doesn't exist
        try:
            op.add_column('interventions', sa.Column('accessoires_utilises', sa.JSON, nullable=True))
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

        # Add other missing columns
        columns = [
            ('etat_materiel', sa.String(20)),
            ('type_concentrateur', sa.String(20)),
            ('mode_ventilation', sa.String(20)),
            ('type_masque', sa.String(20)),
            ('actions_effectuees', sa.JSON),
            ('photos', sa.JSON),
            ('signature_technicien', sa.Text),
            ('rapport_pdf_url', sa.String(200)),
            ('remarques', sa.Text),
            ('motif_annulation', sa.String(100)),
            ('date_reprogrammation', sa.DateTime)
        ]

        for column_name, column_type in columns:
            try:
                op.add_column('interventions', sa.Column(column_name, column_type, nullable=True))
            except Exception as e:
                if "Duplicate column name" not in str(e):
                    raise e

    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise e

def downgrade():
    # Remove all added columns
    columns = [
        'lieu', 'statut', 'accessoires_utilises', 'etat_materiel',
        'type_concentrateur', 'mode_ventilation', 'type_masque',
        'actions_effectuees', 'photos', 'signature_technicien',
        'rapport_pdf_url', 'remarques', 'motif_annulation',
        'date_reprogrammation'
    ]
    
    for column in columns:
        try:
            op.drop_column('interventions', column)
        except Exception as e:
            if "Unknown column" not in str(e):
                raise e 