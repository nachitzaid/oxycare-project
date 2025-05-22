from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from controleurs.controleur_auth import ControleurAuth

auth_bp = Blueprint('auth', __name__)
controleur_auth = ControleurAuth()

@auth_bp.route('/enregistrer', methods=['POST'])
def enregistrer():
    """Enregistre un nouvel utilisateur"""
    return controleur_auth.enregistrer()

@auth_bp.route('/connexion', methods=['POST'])
def connexion():
    """Connecte un utilisateur existant"""
    return controleur_auth.connexion()

@auth_bp.route('/rafraichir', methods=['POST'])
@jwt_required(refresh=True)
def rafraichir():
    """Rafraîchit un token d'accès"""
    utilisateur_id = get_jwt_identity()
    return controleur_auth.rafraichir_token(utilisateur_id)

@auth_bp.route('/profil', methods=['GET'])
@jwt_required()
def obtenir_profil():
    """Récupère les informations de l'utilisateur connecté"""
    utilisateur_id = get_jwt_identity()
    return controleur_auth.obtenir_profil(utilisateur_id)