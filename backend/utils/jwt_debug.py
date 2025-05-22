from flask import request, jsonify, current_app
from functools import wraps
import logging

# Configuration du logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug_jwt_middleware():
    """Middleware pour déboguer les problèmes JWT"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Logs de débogage
            logger.debug(f"=== DEBUG JWT MIDDLEWARE ===")
            logger.debug(f"URL: {request.url}")
            logger.debug(f"Method: {request.method}")
            logger.debug(f"Headers: {dict(request.headers)}")
            
            # Vérifier la présence du token
            auth_header = request.headers.get('Authorization')
            if auth_header:
                logger.debug(f"Authorization header found: {auth_header[:50]}...")
                if auth_header.startswith('Bearer '):
                    token = auth_header[7:]  # Remove 'Bearer ' prefix
                    logger.debug(f"Token extracted: {token[:20]}...{token[-20:]}")
                else:
                    logger.warning("Authorization header doesn't start with 'Bearer '")
            else:
                logger.warning("No Authorization header found")
            
            # Vérifier les paramètres de requête
            if request.args:
                logger.debug(f"Query params: {dict(request.args)}")
            
            # Vérifier le corps de la requête pour POST/PUT
            if request.method in ['POST', 'PUT'] and request.is_json:
                try:
                    logger.debug(f"JSON body: {request.get_json()}")
                except Exception as e:
                    logger.error(f"Error reading JSON body: {e}")
            
            try:
                # Exécuter la fonction originale
                result = f(*args, **kwargs)
                logger.debug(f"Function executed successfully")
                return result
            except Exception as e:
                logger.error(f"Error in function execution: {e}")
                logger.error(f"Error type: {type(e).__name__}")
                
                # Gestion spécifique des erreurs JWT
                if "Subject must be a string" in str(e):
                    return jsonify({
                        'success': False,
                        'message': 'Erreur de token JWT: Subject invalide',
                        'debug': 'Le token JWT contient un subject invalide'
                    }), 422
                elif "token" in str(e).lower():
                    return jsonify({
                        'success': False,
                        'message': 'Erreur de token JWT',
                        'debug': str(e)
                    }), 401
                else:
                    return jsonify({
                        'success': False,
                        'message': 'Erreur serveur',
                        'debug': str(e) if current_app.debug else 'Erreur interne'
                    }), 500
                    
        return decorated_function
    return decorator

def validate_jwt_token():
    """Valide le token JWT et retourne des informations de débogage"""
    try:
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
        
        # Vérifier le token
        verify_jwt_in_request()
        
        # Récupérer l'identité
        identity = get_jwt_identity()
        logger.debug(f"JWT Identity: {identity} (type: {type(identity)})")
        
        # Récupérer les claims du token
        claims = get_jwt()
        logger.debug(f"JWT Claims: {claims}")
        
        # Vérifier que l'identité est valide
        if identity is None:
            raise ValueError("JWT identity is None")
        
        if not isinstance(identity, (str, int)):
            raise ValueError(f"JWT identity must be string or int, got {type(identity)}")
        
        return True, identity
        
    except Exception as e:
        logger.error(f"JWT validation error: {e}")
        return False, str(e)

# Fonction utilitaire pour créer des tokens de test
def create_test_token(user_id, is_admin=False):
    """Crée un token de test pour le débogage"""
    try:
        from flask_jwt_extended import create_access_token
        
        # S'assurer que user_id est une string ou un int
        if isinstance(user_id, str):
            identity = user_id
        elif isinstance(user_id, int):
            identity = str(user_id)  # Convertir en string
        else:
            raise ValueError(f"user_id must be string or int, got {type(user_id)}")
        
        # Claims additionnels
        additional_claims = {
            'is_admin': is_admin,
            'type': 'access'
        }
        
        token = create_access_token(
            identity=identity,
            additional_claims=additional_claims
        )
        
        logger.debug(f"Test token created for user {identity}")
        return token
        
    except Exception as e:
        logger.error(f"Error creating test token: {e}")
        return None