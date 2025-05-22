from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from controleurs.controleur_utilisateur import ControleurUtilisateur
from utils.decorateurs import admin_requis

utilisateurs_bp = Blueprint('utilisateurs', __name__)
controleur_utilisateur = ControleurUtilisateur()

@utilisateurs_bp.route('/', methods=['GET'])
@jwt_required()
def obtenir_utilisateurs():
    """Récupère tous les utilisateurs ou filtre par rôle"""
    return controleur_utilisateur.obtenir_utilisateurs()

@utilisateurs_bp.route('/<int:utilisateur_id>', methods=['GET'])
@jwt_required()
def obtenir_utilisateur(utilisateur_id):
    """Récupère un utilisateur par son ID"""
    return controleur_utilisateur.obtenir_utilisateur(utilisateur_id)