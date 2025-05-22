from .base_donnees import init_app as init_db
from .jwt import init_app as init_jwt
from .cors import init_app as init_cors

def init_app(app):
    """Initialiser toutes les extensions"""
    init_db(app)
    init_jwt(app)
    init_cors(app)