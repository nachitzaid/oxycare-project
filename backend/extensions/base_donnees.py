from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def init_app(app):
    """Initialiser les extensions de la base de données"""
    db.init_app(app)
    migrate.init_app(app, db)