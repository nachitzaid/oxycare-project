"""Fusion des têtes de migration multiples"""

from alembic import op
import sqlalchemy as sa

# Révision identifiers, used by Alembic
revision = 'merge_heads'
down_revision = ('add_hu_re_to_reglages', 'add_missing_cols')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass 