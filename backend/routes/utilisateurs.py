from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controleurs.controleur_utilisateur import ControleurUtilisateur
from utils.decorateurs import admin_requis
from modeles.utilisateur import Utilisateur

utilisateurs_bp = Blueprint('utilisateurs', __name__)
controleur_utilisateur = ControleurUtilisateur()

@utilisateurs_bp.route('/techniciens', methods=['GET'])
def obtenir_techniciens():
    """Récupère tous les techniciens (route publique)"""
    techniciens = Utilisateur.query.filter_by(role='technicien').all()
    return jsonify({
        'success': True,
        'data': [t.to_dict() for t in techniciens],
        'count': len(techniciens)
    }), 200

# Vos autres routes existantes...
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