from flask_jwt_extended import JWTManager

jwt = JWTManager()

def init_app(app):
    """Initialiser l'extension JWT"""
    jwt.init_app(app)