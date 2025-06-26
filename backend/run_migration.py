from app import creer_app
from extensions.base_donnees import db
from flask_migrate import Migrate
from alembic.config import Config
from alembic import command
import os

app = creer_app()
migrate = Migrate(app, db)

def run_migrations():
    with app.app_context():
        alembic_cfg = Config(os.path.join(os.path.dirname(__file__), 'migrations', 'alembic.ini'))
        command.upgrade(alembic_cfg, 'heads')

if __name__ == '__main__':
    run_migrations() 