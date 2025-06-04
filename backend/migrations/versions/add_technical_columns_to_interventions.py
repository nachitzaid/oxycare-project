"""add technical columns to interventions

Revision ID: add_technical_cols
Revises: add_missing_cols
Create Date: 2024-06-02 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_technical_cols'
down_revision = 'add_missing_cols'
branch_labels = None
depends_on = None

def upgrade():
    # Add technical columns to interventions table
    try:
        # Add verification_securite column
        try:
            op.add_column('interventions', sa.Column('verification_securite', sa.JSON, nullable=True))
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

        # Add tests_effectues column
        try:
            op.add_column('interventions', sa.Column('tests_effectues', sa.JSON, nullable=True))
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

        # Add consommables_utilises column
        try:
            op.add_column('interventions', sa.Column('consommables_utilises', sa.JSON, nullable=True))
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

        # Add maintenance columns
        try:
            op.add_column('interventions', sa.Column('maintenance_preventive', sa.Boolean, nullable=True))
            op.execute("UPDATE interventions SET maintenance_preventive = false WHERE maintenance_preventive IS NULL")
            op.alter_column('interventions', 'maintenance_preventive',
                          existing_type=sa.Boolean,
                          nullable=False)
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

        try:
            op.add_column('interventions', sa.Column('date_prochaine_maintenance', sa.DateTime, nullable=True))
        except Exception as e:
            if "Duplicate column name" not in str(e):
                raise e

    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise e

def downgrade():
    # Remove all added columns
    columns = [
        'verification_securite',
        'tests_effectues',
        'consommables_utilises',
        'maintenance_preventive',
        'date_prochaine_maintenance'
    ]
    
    for column in columns:
        try:
            op.drop_column('interventions', column)
        except Exception as e:
            if "Unknown column" not in str(e):
                raise e 