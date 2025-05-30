from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from extensions.base_donnees import db
from modeles.intervention import Intervention
from modeles.patient import Patient
from modeles.dispositif_medical import DispositifMedical
from modeles.utilisateur import Utilisateur
from sqlalchemy import or_
import logging
import traceback
from datetime import datetime

interventions_bp = Blueprint('interventions', __name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@interventions_bp.route('', methods=['GET'])
@jwt_required()
def lister_interventions():
    """Récupérer toutes les interventions avec pagination et recherche"""
    try:
        # Récupérer l'ID de l'utilisateur et les claims du token
        user_id = get_jwt_identity()
        claims = get_jwt()
        
        if not user_id:
            logger.error("No user identity found in JWT token")
            return jsonify({
                'success': False,
                'message': 'Token invalide ou expiré'
            }), 401

        user_role = claims.get('role')
        if not user_role:
            logger.error(f"Invalid user data in JWT token: {claims}")
            return jsonify({
                'success': False,
                'message': 'Données utilisateur invalides'
            }), 401

        logger.info(f"Processing request for user {user_id} with role {user_role}")

        # Validate query parameters
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            if page < 1 or per_page < 1 or per_page > 100:
                raise ValueError("Page or per_page invalid")
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid pagination parameters: {str(e)}, page={request.args.get('page')}, per_page={request.args.get('per_page')}")
            return jsonify({
                'success': False,
                'message': 'Paramètres de pagination invalides',
                'error': str(e)
            }), 422

        recherche = request.args.get('recherche', '', type=str).strip()
        technicien_id = request.args.get('technicien_id', type=int)
        statut = request.args.get('statut', type=str)
        type_intervention = request.args.get('type', type=str)

        logger.debug(f"Query parameters: recherche={recherche}, technicien_id={technicien_id}, statut={statut}, type={type_intervention}")

        # Build query with eager loading
        query = Intervention.query.options(
            db.joinedload(Intervention.patient),
            db.joinedload(Intervention.dispositif),
            db.joinedload(Intervention.technicien)
        )

        # Restrict technicians to their own interventions
        if user_role == 'technicien':
            query = query.filter(Intervention.technicien_id == user_id)
            logger.info(f"Filtering interventions for technician {user_id}")
        elif user_role != 'admin':
            logger.error(f"Unauthorized role: {user_role}")
            return jsonify({
                'success': False,
                'message': 'Rôle non autorisé'
            }), 403

        # Admin can filter by technicien_id
        if technicien_id and user_role == 'admin':
            query = query.filter(Intervention.technicien_id == technicien_id)
            logger.info(f"Admin filtering by technician {technicien_id}")

        # Filter by status
        if statut:
            query = query.filter(Intervention.statut == statut)

        # Filter by intervention type
        if type_intervention:
            query = query.filter(Intervention.type_intervention == type_intervention)

        # Text search
        if recherche:
            try:
                query = query.join(Patient, Intervention.patient_id == Patient.id, isouter=True).join(
                    DispositifMedical, Intervention.dispositif_id == DispositifMedical.id, isouter=True
                ).join(Utilisateur, Intervention.technicien_id == Utilisateur.id, isouter=True).filter(
                    or_(
                        Patient.nom.ilike(f'%{recherche}%'),
                        Patient.prenom.ilike(f'%{recherche}%'),
                        DispositifMedical.designation.ilike(f'%{recherche}%'),
                        DispositifMedical.reference.ilike(f'%{recherche}%'),
                        Utilisateur.nom.ilike(f'%{recherche}%'),
                        Utilisateur.prenom.ilike(f'%{recherche}%'),
                    )
                )
                logger.info(f"Search query applied: {recherche}")
            except Exception as e:
                logger.error(f"Error in search query: {str(e)}\n{traceback.format_exc()}")
                return jsonify({
                    'success': False,
                    'message': 'Erreur dans la recherche',
                    'error': str(e)
                }), 400

        # Pagination
        try:
            interventions_paginated = query.paginate(page=page, per_page=per_page, error_out=False)
            logger.info(f"Found {interventions_paginated.total} interventions")
        except Exception as e:
            logger.error(f"Error in pagination: {str(e)}\n{traceback.format_exc()}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la pagination',
                'error': str(e)
            }), 500

        # Serialize data
        interventions_data = []
        for intervention in interventions_paginated.items:
            try:
                data = intervention.to_dict()
                
                # Handle patient data
                if intervention.patient:
                    try:
                        data['patient'] = {
                            'id': intervention.patient.id,
                            'code_patient': intervention.patient.code_patient,
                            'nom': intervention.patient.nom,
                            'prenom': intervention.patient.prenom,
                            'telephone': intervention.patient.telephone,
                            'email': intervention.patient.email,
                        }
                        logger.debug(f"Patient data added for intervention {intervention.id}")
                    except Exception as patient_error:
                        logger.error(f"Error processing patient data for intervention {intervention.id}: {str(patient_error)}\n{traceback.format_exc()}")
                        data['patient'] = None

                # Handle device data
                if intervention.dispositif:
                    try:
                        data['dispositif'] = {
                            'id': intervention.dispositif.id,
                            'designation': intervention.dispositif.designation,
                            'reference': intervention.dispositif.reference,
                            'numero_serie': intervention.dispositif.numero_serie,
                        }
                        logger.debug(f"Device data added for intervention {intervention.id}")
                    except Exception as device_error:
                        logger.error(f"Error processing device data for intervention {intervention.id}: {str(device_error)}\n{traceback.format_exc()}")
                        data['dispositif'] = None

                # Handle technician data
                if intervention.technicien:
                    try:
                        data['technicien'] = {
                            'id': intervention.technicien.id,
                            'nom': intervention.technicien.nom,
                            'prenom': intervention.technicien.prenom,
                            'email': intervention.technicien.email,
                        }
                        logger.debug(f"Technician data added for intervention {intervention.id}")
                    except Exception as tech_error:
                        logger.error(f"Error processing technician data for intervention {intervention.id}: {str(tech_error)}\n{traceback.format_exc()}")
                        data['technicien'] = None

                interventions_data.append(data)
                logger.debug(f"Successfully processed intervention {intervention.id}")
            except Exception as e:
                logger.error(f"Error serializing intervention {intervention.id}: {str(e)}\n{traceback.format_exc()}")
                continue

        response_data = {
            'success': True,
            'data': {
                'items': interventions_data,
                'page_courante': interventions_paginated.page,
                'pages_totales': interventions_paginated.pages,
                'total': interventions_paginated.total,
                'elements_par_page': interventions_paginated.per_page,
            },
            'message': f'{len(interventions_data)} interventions trouvées',
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Unexpected error in lister_interventions: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Erreur serveur inattendue',
            'error': str(e)
        }), 500

@interventions_bp.route('', methods=['POST'])
@jwt_required()
def creer_intervention():
    """Créer une nouvelle intervention"""
    try:
        # Récupérer l'ID de l'utilisateur et les claims du token
        user_id = get_jwt_identity()
        claims = get_jwt()
        
        if not user_id:
            logger.error("No user identity found in JWT token")
            return jsonify({
                'success': False,
                'message': 'Token invalide ou expiré'
            }), 401

        user_role = claims.get('role')
        if not user_role:
            logger.error(f"Invalid user data in JWT token: {claims}")
            return jsonify({
                'success': False,
                'message': 'Données utilisateur invalides'
            }), 401

        # Récupérer les données de la requête
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Données manquantes'
            }), 400

        # Valider les données requises
        required_fields = ['patient_id', 'dispositif_id', 'date_intervention', 'type_intervention']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Champ requis manquant: {field}'
                }), 400

        # Convertir la date ISO en datetime MySQL
        try:
            # Enlever le 'Z' et convertir en datetime
            date_str = data['date_intervention'].replace('Z', '')
            date_intervention = datetime.fromisoformat(date_str)
        except ValueError as e:
            logger.error(f"Format de date invalide: {data['date_intervention']}")
            return jsonify({
                'success': False,
                'message': 'Format de date invalide'
            }), 400

        # Créer la nouvelle intervention
        try:
            nouvelle_intervention = Intervention(
                patient_id=data['patient_id'],
                dispositif_id=data['dispositif_id'],
                technicien_id=user_id if user_role == 'technicien' else data.get('technicien_id'),
                date_planifiee=date_intervention,
                type_intervention=data['type_intervention'],
                planifiee=True,
                commentaire=data.get('description', '')
            )

            db.session.add(nouvelle_intervention)
            db.session.commit()

            # Charger les relations pour la réponse
            db.session.refresh(nouvelle_intervention)
            intervention_data = nouvelle_intervention.to_dict()

            # Ajouter les données du patient
            if nouvelle_intervention.patient:
                intervention_data['patient'] = {
                    'id': nouvelle_intervention.patient.id,
                    'code_patient': nouvelle_intervention.patient.code_patient,
                    'nom': nouvelle_intervention.patient.nom,
                    'prenom': nouvelle_intervention.patient.prenom,
                    'telephone': nouvelle_intervention.patient.telephone,
                    'email': nouvelle_intervention.patient.email,
                }

            # Ajouter les données du dispositif
            if nouvelle_intervention.dispositif:
                intervention_data['dispositif'] = {
                    'id': nouvelle_intervention.dispositif.id,
                    'designation': nouvelle_intervention.dispositif.designation,
                    'reference': nouvelle_intervention.dispositif.reference,
                    'numero_serie': nouvelle_intervention.dispositif.numero_serie,
                }

            # Ajouter les données du technicien
            if nouvelle_intervention.technicien:
                intervention_data['technicien'] = {
                    'id': nouvelle_intervention.technicien.id,
                    'nom': nouvelle_intervention.technicien.nom,
                    'prenom': nouvelle_intervention.technicien.prenom,
                    'email': nouvelle_intervention.technicien.email,
                }

            logger.info(f"Intervention créée avec succès: {nouvelle_intervention.id}")
            return jsonify({
                'success': True,
                'message': 'Intervention créée avec succès',
                'data': intervention_data
            }), 201

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erreur lors de la création de l'intervention: {str(e)}\n{traceback.format_exc()}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la création de l\'intervention',
                'error': str(e)
            }), 500

    except Exception as e:
        logger.error(f"Erreur non gérée: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la création de l\'intervention',
            'error': str(e)
        }), 500

@interventions_bp.route('/<int:intervention_id>', methods=['PUT'])
@jwt_required()
def modifier_intervention(intervention_id):
    """Modifier une intervention existante"""
    try:
        # Récupérer l'ID de l'utilisateur et les claims du token
        user_id = get_jwt_identity()
        claims = get_jwt()
        
        if not user_id:
            logger.error("No user identity found in JWT token")
            return jsonify({
                'success': False,
                'message': 'Token invalide ou expiré'
            }), 401

        user_role = claims.get('role')
        if not user_role:
            logger.error(f"Invalid user data in JWT token: {claims}")
            return jsonify({
                'success': False,
                'message': 'Données utilisateur invalides'
            }), 401

        # Récupérer l'intervention
        intervention = Intervention.query.get(intervention_id)
        if not intervention:
            return jsonify({
                'success': False,
                'message': 'Intervention non trouvée'
            }), 404

        # Vérifier les permissions
        if user_role == 'technicien' and intervention.technicien_id != user_id:
            return jsonify({
                'success': False,
                'message': 'Vous n\'êtes pas autorisé à modifier cette intervention'
            }), 403

        # Récupérer les données de la requête
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Données manquantes'
            }), 400

        # Mettre à jour les champs modifiables
        if 'date_intervention' in data:
            try:
                # Enlever le 'Z' et convertir en datetime
                date_str = data['date_intervention'].replace('Z', '')
                intervention.date_planifiee = datetime.fromisoformat(date_str)
            except ValueError as e:
                logger.error(f"Format de date invalide: {data['date_intervention']}")
                return jsonify({
                    'success': False,
                    'message': 'Format de date invalide'
                }), 400

        if 'type_intervention' in data:
            intervention.type_intervention = data['type_intervention']

        if 'description' in data:
            intervention.commentaire = data['description']

        if 'temps_prevu' in data:
            intervention.temps_prevu = data['temps_prevu']

        if 'temps_reel' in data:
            intervention.temps_reel = data['temps_reel']

        if 'actions_effectuees' in data:
            intervention.actions_effectuees = data['actions_effectuees']

        if 'satisfaction_technicien' in data:
            intervention.satisfaction_technicien = data['satisfaction_technicien']

        if 'signature_patient' in data:
            intervention.signature_patient = data['signature_patient']

        if 'signature_responsable' in data:
            intervention.signature_responsable = data['signature_responsable']

        # Mettre à jour la base de données
        try:
            db.session.commit()
            
            # Charger les relations pour la réponse
            db.session.refresh(intervention)
            intervention_data = intervention.to_dict()

            # Ajouter les données du patient
            if intervention.patient:
                intervention_data['patient'] = {
                    'id': intervention.patient.id,
                    'code_patient': intervention.patient.code_patient,
                    'nom': intervention.patient.nom,
                    'prenom': intervention.patient.prenom,
                    'telephone': intervention.patient.telephone,
                    'email': intervention.patient.email,
                }

            # Ajouter les données du dispositif
            if intervention.dispositif:
                intervention_data['dispositif'] = {
                    'id': intervention.dispositif.id,
                    'designation': intervention.dispositif.designation,
                    'reference': intervention.dispositif.reference,
                    'numero_serie': intervention.dispositif.numero_serie,
                }

            # Ajouter les données du technicien
            if intervention.technicien:
                intervention_data['technicien'] = {
                    'id': intervention.technicien.id,
                    'nom': intervention.technicien.nom,
                    'prenom': intervention.technicien.prenom,
                    'email': intervention.technicien.email,
                }

            logger.info(f"Intervention {intervention_id} modifiée avec succès")
            return jsonify({
                'success': True,
                'message': 'Intervention modifiée avec succès',
                'data': intervention_data
            }), 200

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erreur lors de la modification de l'intervention: {str(e)}\n{traceback.format_exc()}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la modification de l\'intervention',
                'error': str(e)
            }), 500

    except Exception as e:
        logger.error(f"Erreur non gérée: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la modification de l\'intervention',
            'error': str(e)
        }), 500

@interventions_bp.route('/<int:intervention_id>', methods=['DELETE'])
@jwt_required()
def supprimer_intervention(intervention_id):
    """Supprimer une intervention"""
    try:
        # Récupérer l'ID de l'utilisateur et les claims du token
        user_id = get_jwt_identity()
        claims = get_jwt()
        
        if not user_id:
            logger.error("No user identity found in JWT token")
            return jsonify({
                'success': False,
                'message': 'Token invalide ou expiré'
            }), 401

        user_role = claims.get('role')
        if not user_role:
            logger.error(f"Invalid user data in JWT token: {claims}")
            return jsonify({
                'success': False,
                'message': 'Données utilisateur invalides'
            }), 401

        # Récupérer l'intervention
        intervention = Intervention.query.get(intervention_id)
        if not intervention:
            return jsonify({
                'success': False,
                'message': 'Intervention non trouvée'
            }), 404

        # Vérifier les permissions
        if user_role == 'technicien' and intervention.technicien_id != user_id:
            return jsonify({
                'success': False,
                'message': 'Vous n\'êtes pas autorisé à supprimer cette intervention'
            }), 403

        # Supprimer l'intervention
        try:
            db.session.delete(intervention)
            db.session.commit()
            logger.info(f"Intervention {intervention_id} supprimée avec succès")
            return jsonify({
                'success': True,
                'message': 'Intervention supprimée avec succès'
            }), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erreur lors de la suppression de l'intervention: {str(e)}\n{traceback.format_exc()}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la suppression de l\'intervention',
                'error': str(e)
            }), 500

    except Exception as e:
        logger.error(f"Erreur non gérée: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la suppression de l\'intervention',
            'error': str(e)
        }), 500