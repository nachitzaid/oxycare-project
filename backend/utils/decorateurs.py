from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from modeles.utilisateur import Utilisateur

def admin_requis(fn):
    """Décorateur pour vérifier si l'utilisateur est un administrateur"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        utilisateur_id = get_jwt_identity()
        utilisateur = Utilisateur.query.get(utilisateur_id)
        
        if not utilisateur or utilisateur.role != 'admin':
            return jsonify({'message': 'Accès non autorisé'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

def technicien_requis(fn):
    """Décorateur pour vérifier si l'utilisateur est un technicien"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        utilisateur_id = get_jwt_identity()
        utilisateur = Utilisateur.query.get(utilisateur_id)
        
        if not utilisateur or utilisateur.role != 'technicien':
            return jsonify({'message': 'Accès non autorisé'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper