from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from extensions.base_donnees import db
from modeles.intervention import Intervention
from modeles.patient import Patient
from modeles.dispositif_medical import DispositifMedical
from modeles.utilisateur import Utilisateur
from sqlalchemy import or_
import logging
import traceback
from datetime import datetime, timedelta
import json

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
            db.joinedload(Intervention.technicien),
            db.joinedload(Intervention.reglage)
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

                # Handle reglage data
                if intervention.reglage:
                    try:
                        data['reglage'] = {
                            'id': intervention.reglage.id,
                            'pmax': intervention.reglage.pmax,
                            'pmin': intervention.reglage.pmin,
                            'pramp': intervention.reglage.pramp,
                            'hu': intervention.reglage.hu,
                            're': intervention.reglage.re,
                            'commentaire': intervention.reglage.commentaire
                        }
                        logger.debug(f"Reglage data added for intervention {intervention.id}")
                    except Exception as reglage_error:
                        logger.error(f"Error processing reglage data for intervention {intervention.id}: {str(reglage_error)}\n{traceback.format_exc()}")
                        data['reglage'] = None

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
                'message': 'Aucune donnée fournie'
            }), 400

        # Vérifier les champs obligatoires
        required_fields = ['patient_id', 'dispositif_id', 'type_intervention']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Champ obligatoire manquant: {field}'
                }), 400

        # Créer l'intervention
        intervention = Intervention(
            patient_id=data['patient_id'],
            dispositif_id=data['dispositif_id'],
            technicien_id=user_id if user_role == 'technicien' else data.get('technicien_id'),
            type_intervention=data['type_intervention'],
            statut=data.get('statut', 'EN_COURS'),
            remarques=data.get('remarques'),
            traitement=data.get('traitement'),
            parametres=data.get('parametres', {})
        )

        # Créer les réglages si fournis
        if 'reglage' in data:
            from modeles.reglage import Reglage
            reglage_data = data['reglage']
            nouveau_reglage = Reglage(
                dispositif_id=data['dispositif_id'],
                pmax=reglage_data.get('pmax'),
                pmin=reglage_data.get('pmin'),
                pramp=reglage_data.get('pramp'),
                hu=reglage_data.get('hu'),
                re=reglage_data.get('re'),
                commentaire=reglage_data.get('commentaire')
            )
            db.session.add(nouveau_reglage)
            intervention.reglage = nouveau_reglage

        # Sauvegarder l'intervention
        db.session.add(intervention)
        db.session.commit()

        logger.info(f"Intervention créée avec succès par l'utilisateur {user_id}")
        return jsonify({
            'success': True,
            'message': 'Intervention créée avec succès',
            'data': intervention.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating intervention: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la création de l\'intervention',
            'error': str(e)
        }), 500

@interventions_bp.route('/<int:intervention_id>', methods=['PUT'])
@jwt_required()
def modifier_intervention(intervention_id):
    try:
        # Récupérer l'utilisateur connecté
        user_id = get_jwt_identity()
        claims = get_jwt()
        user_role = claims.get('role')

        if not user_id or not user_role:
            logger.error("Token invalide ou expiré")
            return jsonify({
                'success': False,
                'message': 'Token invalide ou expiré'
            }), 401

        # Vérifier si l'intervention existe
        intervention = Intervention.query.get_or_404(intervention_id)

        # Vérifier les permissions
        if user_role == 'technicien':
            # Un technicien ne peut modifier que ses propres interventions
            if int(intervention.technicien_id) != int(user_id):
                logger.warning(
                    f"Tentative de modification non autorisée - Intervention ID: {intervention_id}, "
                    f"Technicien connecté: {user_id}, Technicien assigné: {intervention.technicien_id}"
                )
                return jsonify({
                    'success': False,
                    'message': 'Vous n\'êtes pas autorisé à modifier cette intervention car elle est assignée à un autre technicien'
                }), 403
        elif user_role != 'admin':
            return jsonify({
                'success': False,
                'message': 'Vous n\'avez pas les permissions nécessaires pour modifier une intervention'
            }), 403

        # Récupérer les données de la requête
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Aucune donnée fournie'
            }), 400

        # Mettre à jour les champs de l'intervention
        for key, value in data.items():
            if hasattr(intervention, key):
                # Gérer les champs de type date
                if key in ['date_prochaine_maintenance', 'date_planifiee', 'date_reelle']:
                    if value == '' or value is None:
                        setattr(intervention, key, None)
                    else:
                        try:
                            setattr(intervention, key, datetime.fromisoformat(value.replace('Z', '+00:00')))
                        except ValueError:
                            logger.error(f"Format de date invalide pour {key}: {value}")
                            return jsonify({
                                'success': False,
                                'message': f'Format de date invalide pour {key}'
                            }), 400
                # Gérer les champs de type JSON/dict
                elif key in ['parametres', 'verification_securite', 'tests_effectues', 'consommables_utilises', 'photos']:
                    if isinstance(value, (dict, list)):
                        setattr(intervention, key, value)
                    else:
                        try:
                            setattr(intervention, key, json.loads(value))
                        except json.JSONDecodeError:
                            logger.error(f"Format JSON invalide pour {key}: {value}")
                            return jsonify({
                                'success': False,
                                'message': f'Format JSON invalide pour {key}'
                            }), 400
                # Gérer les champs de type reglage
                elif key == 'reglage':
                    if value is None:
                        if intervention.reglage:
                            db.session.delete(intervention.reglage)
                            intervention.reglage = None
                    else:
                        from modeles.reglage import Reglage
                        if not intervention.reglage:
                            # Créer un nouveau réglage
                            nouveau_reglage = Reglage(
                                dispositif_id=intervention.dispositif_id,
                                pmax=value.get('pmax'),
                                pmin=value.get('pmin'),
                                pramp=value.get('pramp'),
                                hu=value.get('hu'),
                                re=value.get('re'),
                                commentaire=value.get('commentaire')
                            )
                            db.session.add(nouveau_reglage)
                            intervention.reglage = nouveau_reglage
                        else:
                            # Mettre à jour le réglage existant
                            reglage = intervention.reglage
                            reglage.pmax = value.get('pmax', reglage.pmax)
                            reglage.pmin = value.get('pmin', reglage.pmin)
                            reglage.pramp = value.get('pramp', reglage.pramp)
                            reglage.hu = value.get('hu', reglage.hu)
                            reglage.re = value.get('re', reglage.re)
                            reglage.commentaire = value.get('commentaire', reglage.commentaire)
                # Gérer les autres champs
                else:
                    # Ignorer les objets imbriqués qui ne sont pas des champs directs
                    if not isinstance(value, (dict, list)) or key in ['patient', 'dispositif', 'technicien']:
                        # Ne pas mettre à jour les relations directes
                        if key not in ['patient', 'dispositif', 'technicien']:
                            setattr(intervention, key, value)

        # Sauvegarder les modifications
        try:
            db.session.commit()
            logger.info(f"Intervention {intervention_id} mise à jour avec succès")
            return jsonify({
                'success': True,
                'message': 'Intervention mise à jour avec succès',
                'data': intervention.to_dict()
            })
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erreur lors de la sauvegarde des modifications: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Erreur lors de la sauvegarde des modifications: {str(e)}'
            }), 500

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la modification de l'intervention: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Erreur lors de la modification de l\'intervention: {str(e)}'
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

@interventions_bp.route('/<int:intervention_id>/reglages', methods=['PUT'])
@jwt_required()
def mettre_a_jour_reglages(intervention_id):
    """Met à jour les réglages d'une intervention"""
    try:
        # Récupérer l'intervention
        intervention = Intervention.query.get_or_404(intervention_id)
        
        # Vérifier les permissions
        user_id = get_jwt_identity()
        claims = get_jwt()
        user_role = claims.get('role')
        
        if user_role == 'technicien' and intervention.technicien_id != user_id:
            return jsonify({
                'success': False,
                'message': 'Non autorisé à modifier cette intervention'
            }), 403
            
        # Récupérer les données des réglages
        data = request.get_json()
        reglage_data = data.get('reglage', {})
        
        # Créer ou mettre à jour les réglages
        if not intervention.reglage:
            from modeles.reglage import Reglage
            intervention.reglage = Reglage(
                dispositif_id=intervention.dispositif_id,
                pmax=reglage_data.get('pmax'),
                pmin=reglage_data.get('pmin'),
                pramp=reglage_data.get('pramp'),
                hu=reglage_data.get('hu'),
                re=reglage_data.get('re'),
                commentaire=reglage_data.get('commentaire')
            )
        else:
            intervention.reglage.pmax = reglage_data.get('pmax', intervention.reglage.pmax)
            intervention.reglage.pmin = reglage_data.get('pmin', intervention.reglage.pmin)
            intervention.reglage.pramp = reglage_data.get('pramp', intervention.reglage.pramp)
            intervention.reglage.hu = reglage_data.get('hu', intervention.reglage.hu)
            intervention.reglage.re = reglage_data.get('re', intervention.reglage.re)
            intervention.reglage.commentaire = reglage_data.get('commentaire', intervention.reglage.commentaire)
        
        # Sauvegarder les modifications
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Réglages mis à jour avec succès',
            'data': intervention.reglage.to_dict() if intervention.reglage else None
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la mise à jour des réglages: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la mise à jour des réglages',
            'error': str(e)
        }), 500

@interventions_bp.route('/statistiques/technicien', methods=['GET'])
@jwt_required()
def statistiques_technicien():
    """Récupérer les statistiques des interventions pour un technicien"""
    try:
        # Récupérer l'ID du technicien depuis le token
        technicien_id = get_jwt_identity()
        if not technicien_id:
            return jsonify({
                'success': False,
                'message': 'Token invalide ou expiré'
            }), 401

        # Récupérer toutes les interventions du technicien
        interventions = Intervention.query.filter_by(technicien_id=technicien_id).all()
        
        # Calculer les statistiques
        total = len(interventions)
        en_cours = sum(1 for i in interventions if i.statut == 'en_cours')
        terminees = sum(1 for i in interventions if i.statut == 'terminee')
        en_retard = sum(1 for i in interventions if i.statut == 'en_retard')

        # Calculer la répartition par statut
        par_statut = {}
        for intervention in interventions:
            statut = intervention.statut
            par_statut[statut] = par_statut.get(statut, 0) + 1

        # Calculer l'évolution sur 6 mois
        par_mois = []
        now = datetime.now()
        for i in range(5, -1, -1):
            date = now - timedelta(days=30*i)
            mois = date.strftime('%b %Y')
            count = sum(1 for i in interventions if i.date_creation and i.date_creation.strftime('%b %Y') == mois)
            par_mois.append({'mois': mois, 'nombre': count})

        return jsonify({
            'success': True,
            'data': {
                'interventions': {
                    'total': total,
                    'en_cours': en_cours,
                    'terminees': terminees,
                    'en_retard': en_retard,
                    'par_mois': par_mois,
                    'par_statut': par_statut
                }
            }
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des statistiques',
            'error': str(e)
        }), 500