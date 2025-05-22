from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from controleurs.controleur_patient import ControleurPatient
from utils.decorateurs import admin_requis

patients_bp = Blueprint('patients', __name__)
controleur_patient = ControleurPatient()

# Route principale pour lister les patients (sans trailing slash)
@patients_bp.route('', methods=['GET'])
@jwt_required()
def obtenir_patients():
    """Récupère tous les patients avec pagination et recherche"""
    return controleur_patient.obtenir_patients()

# Route alternative avec trailing slash (pour éviter les redirections)
@patients_bp.route('/', methods=['GET'])
@jwt_required()
def obtenir_patients_alt():
    """Récupère tous les patients avec pagination et recherche (route alternative)"""
    return controleur_patient.obtenir_patients()

@patients_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def obtenir_patient(patient_id):
    """Récupère un patient par son ID"""
    return controleur_patient.obtenir_patient(patient_id)

@patients_bp.route('', methods=['POST'])
@jwt_required()
@admin_requis
def creer_patient():
    """Crée un nouveau patient"""
    return controleur_patient.creer_patient()

@patients_bp.route('/', methods=['POST'])
@jwt_required()
@admin_requis
def creer_patient_alt():
    """Crée un nouveau patient (route alternative)"""
    return controleur_patient.creer_patient()

@patients_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
@admin_requis
def mettre_a_jour_patient(patient_id):
    """Met à jour un patient existant"""
    return controleur_patient.mettre_a_jour_patient(patient_id)

@patients_bp.route('/<int:patient_id>', methods=['DELETE'])
@jwt_required()
@admin_requis
def supprimer_patient(patient_id):
    """Supprime un patient existant"""
    return controleur_patient.supprimer_patient(patient_id)

@patients_bp.route('/recherche', methods=['GET'])
@jwt_required()
def rechercher_patient():
    """Recherche un patient par code ou CIN"""
    return controleur_patient.rechercher_patient()