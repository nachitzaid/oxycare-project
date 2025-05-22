from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from controleurs.controleur_prescripteur import ControleurPrescripteur
from utils.decorateurs import admin_requis

prescripteurs_bp = Blueprint('prescripteurs', __name__)
controleur_prescripteur = ControleurPrescripteur()

@prescripteurs_bp.route('/', methods=['GET'])
@jwt_required()
def obtenir_prescripteurs():
    """Récupère tous les prescripteurs"""
    return controleur_prescripteur.obtenir_prescripteurs()

@prescripteurs_bp.route('/<int:prescripteur_id>', methods=['GET'])
@jwt_required()
def obtenir_prescripteur(prescripteur_id):
    """Récupère un prescripteur par son ID"""
    return controleur_prescripteur.obtenir_prescripteur(prescripteur_id)

@prescripteurs_bp.route('/', methods=['POST'])
@jwt_required()
@admin_requis
def creer_prescripteur():
    """Crée un nouveau prescripteur"""
    return controleur_prescripteur.creer_prescripteur()

@prescripteurs_bp.route('/<int:prescripteur_id>', methods=['PUT'])
@jwt_required()
@admin_requis
def mettre_a_jour_prescripteur(prescripteur_id):
    """Met à jour un prescripteur existant"""
    return controleur_prescripteur.mettre_a_jour_prescripteur(prescripteur_id)

@prescripteurs_bp.route('/<int:prescripteur_id>', methods=['DELETE'])
@jwt_required()
@admin_requis
def supprimer_prescripteur(prescripteur_id):
    """Supprime un prescripteur existant"""
    return controleur_prescripteur.supprimer_prescripteur(prescripteur_id)