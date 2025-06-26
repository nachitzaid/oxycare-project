from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from modeles.intervention import Intervention
from schemas.intervention import InterventionSchema
from extensions.base_donnees import db
from datetime import datetime
import json

bp = Blueprint('interventions', __name__)
schema = InterventionSchema()

@bp.route('/interventions', methods=['POST'])
def creer_intervention():
    """Crée une nouvelle intervention"""
    try:
        data = request.get_json()
        
        # Validation des données
        try:
            intervention = schema.load(data)
        except ValidationError as err:
            return jsonify({'erreur': err.messages}), 400
        
        # Enregistrement en base
        intervention.enregistrer()
        
        return jsonify(schema.dump(intervention)), 201
        
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/interventions/<int:id>', methods=['GET'])
def obtenir_intervention(id):
    """Récupère une intervention par son ID"""
    try:
        intervention = Intervention.query.get_or_404(id)
        return jsonify(schema.dump(intervention))
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/interventions', methods=['GET'])
def lister_interventions():
    """Liste toutes les interventions avec filtres"""
    try:
        # Récupération des paramètres de filtrage
        statut = request.args.get('statut')
        technicien_id = request.args.get('technicien_id', type=int)
        date_debut = request.args.get('date_debut')
        date_fin = request.args.get('date_fin')
        
        # Construction de la requête
        query = Intervention.query
        
        if statut:
            query = query.filter(Intervention.statut == statut)
        if technicien_id:
            query = query.filter(Intervention.technicien_id == technicien_id)
        if date_debut:
            query = query.filter(Intervention.date_planifiee >= datetime.fromisoformat(date_debut))
        if date_fin:
            query = query.filter(Intervention.date_planifiee <= datetime.fromisoformat(date_fin))
            
        # Exécution de la requête
        interventions = query.order_by(Intervention.date_planifiee.desc()).all()
        
        return jsonify(schema.dump(interventions, many=True))
        
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/interventions/<int:id>', methods=['PUT'])
def modifier_intervention(id):
    """Modifie une intervention existante"""
    try:
        intervention = Intervention.query.get_or_404(id)
        data = request.get_json()
        
        # Validation des données
        try:
            intervention_modifiee = schema.load(data, instance=intervention, partial=True)
        except ValidationError as err:
            return jsonify({'erreur': err.messages}), 400
        
        # Mise à jour des champs
        for key, value in data.items():
            setattr(intervention, key, value)
        
        # Enregistrement des modifications
        intervention.enregistrer()
        
        return jsonify(schema.dump(intervention))
        
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/interventions/<int:id>/statut', methods=['PUT'])
def modifier_statut(id):
    """Modifie le statut d'une intervention"""
    try:
        intervention = Intervention.query.get_or_404(id)
        data = request.get_json()
        
        nouveau_statut = data.get('statut')
        if not nouveau_statut:
            return jsonify({'erreur': 'Le statut est requis'}), 400
            
        # Validation du statut
        if nouveau_statut not in ['planifiee', 'en_cours', 'terminee', 'patient_absent', 'annulee', 'reportee', 'partielle']:
            return jsonify({'erreur': 'Statut invalide'}), 400
            
        # Mise à jour du statut
        intervention.statut = nouveau_statut
        
        # Gestion des cas spéciaux
        if nouveau_statut == 'terminee':
            intervention.date_reelle = datetime.utcnow()
        elif nouveau_statut == 'annulee':
            intervention.motif_annulation = data.get('motif_annulation')
        elif nouveau_statut == 'reportee':
            date_reprogrammation = data.get('date_reprogrammation')
            if not date_reprogrammation:
                return jsonify({'erreur': 'La date de reprogrammation est requise'}), 400
            intervention.date_reprogrammation = datetime.fromisoformat(date_reprogrammation)
            intervention.date_planifiee = intervention.date_reprogrammation
        
        # Enregistrement des modifications
        intervention.enregistrer()
        
        return jsonify(schema.dump(intervention))
        
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/interventions/<int:id>/photos', methods=['POST'])
def ajouter_photos(id):
    """Ajoute des photos à une intervention"""
    try:
        intervention = Intervention.query.get_or_404(id)
        
        if 'photos' not in request.files:
            return jsonify({'erreur': 'Aucune photo fournie'}), 400
            
        photos = request.files.getlist('photos')
        urls_photos = []
        
        # TODO: Implémenter le stockage des photos et la génération des URLs
        # Pour l'instant, on simule juste les URLs
        for photo in photos:
            # Simulation d'URL
            url = f"/photos/intervention_{id}/{photo.filename}"
            urls_photos.append(url)
        
        # Mise à jour des photos
        if intervention.photos:
            intervention.photos.extend(urls_photos)
        else:
            intervention.photos = urls_photos
            
        intervention.enregistrer()
        
        return jsonify(schema.dump(intervention))
        
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/interventions/<int:id>/signature', methods=['POST'])
def ajouter_signature(id):
    """Ajoute la signature du technicien à une intervention"""
    try:
        intervention = Intervention.query.get_or_404(id)
        data = request.get_json()
        
        signature = data.get('signature')
        if not signature:
            return jsonify({'erreur': 'La signature est requise'}), 400
            
        # Mise à jour de la signature
        intervention.signature_technicien = signature
        intervention.enregistrer()
        
        return jsonify(schema.dump(intervention))
        
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/interventions/<int:id>/rapport', methods=['POST'])
def generer_rapport(id):
    """Génère le rapport PDF d'une intervention"""
    try:
        intervention = Intervention.query.get_or_404(id)
        
        # Vérification que l'intervention est terminée
        if intervention.statut != 'terminee':
            return jsonify({'erreur': 'Le rapport ne peut être généré que pour une intervention terminée'}), 400
            
        # TODO: Implémenter la génération du rapport PDF
        # Pour l'instant, on simule juste l'URL du rapport
        rapport_url = f"/rapports/intervention_{id}.pdf"
        
        # Mise à jour de l'URL du rapport
        intervention.rapport_pdf_url = rapport_url
        intervention.enregistrer()
        
        return jsonify(schema.dump(intervention))
        
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500 