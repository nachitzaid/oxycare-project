from flask import Blueprint, request, jsonify
from extensions.base_donnees import db
from modeles.intervention import Intervention
from modeles.patient import Patient
from modeles.dispositif_medical import DispositifMedical
from modeles.utilisateur import Utilisateur
from datetime import datetime, date
from sqlalchemy import or_, func

interventions_bp = Blueprint('interventions', __name__)

@interventions_bp.route('', methods=['GET'])
def lister_interventions():
    """Récupérer toutes les interventions avec pagination et recherche"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        recherche = request.args.get('recherche', '', type=str)
        technicien_id = request.args.get('technicien_id', type=int)
        statut = request.args.get('statut', type=str)
        type_intervention = request.args.get('type', type=str)

        # Construction de la requête
        query = Intervention.query

        # Filtrage par technicien
        if technicien_id:
            query = query.filter(Intervention.technicien_id == technicien_id)

        # Filtrage par statut
        if statut:
            query = query.filter(Intervention.statut == statut)

        # Filtrage par type d'intervention
        if type_intervention:
            query = query.filter(Intervention.type_intervention == type_intervention)

        # Recherche textuelle
        if recherche:
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

        # Pagination
        interventions_pagines = query.paginate(page=page, per_page=per_page, error_out=False)

        # Sérialisation des données
        interventions_data = []
        for intervention in interventions_pagines.items:
            data = intervention.to_dict()
            # Ajouter les informations du patient
            if intervention.patient_id:
                patient = Patient.query.get(intervention.patient_id)
                if patient:
                    data['patient'] = {
                        'id': patient.id,
                        'code_patient': patient.code_patient,
                        'nom': patient.nom,
                        'prenom': patient.prenom,
                        'telephone': patient.telephone,
                        'email': patient.email,
                    }
            # Ajouter les informations du dispositif
            if intervention.dispositif_id:
                dispositif = DispositifMedical.query.get(intervention.dispositif_id)
                if dispositif:
                    data['dispositif'] = {
                        'id': dispositif.id,
                        'designation': dispositif.designation,
                        'reference': dispositif.reference,
                        'numero_serie': dispositif.numero_serie,
                    }
            # Ajouter les informations du technicien
            if intervention.technicien_id:
                technicien = Utilisateur.query.get(intervention.technicien_id)
                if technicien:
                    data['technicien'] = {
                        'id': technicien.id,
                        'nom': technicien.nom,
                        'prenom': technicien.prenom,
                        'email': technicien.email,
                    }
            interventions_data.append(data)

        return jsonify({
            'success': True,
            'data': {
                'items': interventions_data,
                'page_courante': interventions_pagines.page,
                'pages_totales': interventions_pagines.pages,
                'total': interventions_pagines.total,
                'elements_par_page': interventions_pagines.per_page,
            },
            'message': f'{len(interventions_data)} interventions trouvées',
        }), 200

    except Exception as e:
        print(f"Erreur lister_interventions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des interventions',
        }), 500

@interventions_bp.route('', methods=['POST'])
def creer_intervention():
    """Créer une nouvelle intervention"""
    try:
        data = request.get_json()

        # Validation des champs requis
        champs_requis = ['patient_id', 'dispositif_id', 'technicien_id', 'type_intervention']
        for champ in champs_requis:
            if not data.get(champ):
                return jsonify({
                    'success': False,
                    'message': f'Le champ {champ} est requis',
                }), 400

        # Vérifier que le patient existe
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return jsonify({
                'success': False,
                'message': 'Patient non trouvé',
            }), 404

        # Vérifier que le dispositif existe
        dispositif = DispositifMedical.query.get(data['dispositif_id'])
        if not dispositif:
            return jsonify({
                'success': False,
                'message': 'Dispositif non trouvé',
            }), 404

        # Vérifier que le technicien existe
        technicien = Utilisateur.query.get(data['technicien_id'])
        if not technicien:
            return jsonify({
                'success': False,
                'message': 'Technicien non trouvé',
            }), 404

        # Traitement des dates
        date_planifiee = None
        if data.get('date_planifiee'):
            try:
                date_planifiee = datetime.strptime(data['date_planifiee'], '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Format de date planifiée invalide (YYYY-MM-DDTHH:MM:SS attendu)',
                }), 400

        date_reelle = None
        if data.get('date_reelle'):
            try:
                date_reelle = datetime.strptime(data['date_reelle'], '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Format de date réelle invalide (YYYY-MM-DDTHH:MM:SS attendu)',
                }), 400

        # Créer la nouvelle intervention
        nouvelle_intervention = Intervention(
            patient_id=data['patient_id'],
            dispositif_id=data['dispositif_id'],
            technicien_id=data['technicien_id'],
            type_intervention=data['type_intervention'],
            planifiee=data.get('planifiee', True),
            date_planifiee=date_planifiee,
            date_reelle=date_reelle or datetime.utcnow(),
            temps_prevu=data.get('temps_prevu'),
            temps_reel=data.get('temps_reel'),
            actions_effectuees=data.get('actions_effectuees'),
            satisfaction_technicien=data.get('satisfaction_technicien'),
            signature_patient=data.get('signature_patient', False),
            signature_responsable=data.get('signature_responsable', False),
            commentaire=data.get('commentaire'),
        )

        db.session.add(nouvelle_intervention)
        db.session.commit()

        # Récupérer l'intervention créée avec les relations
        intervention_data = nouvelle_intervention.to_dict()
        intervention_data['patient'] = {
            'id': patient.id,
            'code_patient': patient.code_patient,
            'nom': patient.nom,
            'prenom': patient.prenom,
            'telephone': patient.telephone,
            'email': patient.email,
        }
        intervention_data['dispositif'] = {
            'id': dispositif.id,
            'designation': dispositif.designation,
            'reference': dispositif.reference,
            'numero_serie': dispositif.numero_serie,
        }
        intervention_data['technicien'] = {
            'id': technicien.id,
            'nom': technicien.nom,
            'prenom': technicien.prenom,
            'email': technicien.email,
        }

        return jsonify({
            'success': True,
            'data': intervention_data,
            'message': f'Intervention {nouvelle_intervention.type_intervention} créée avec succès',
        }), 201

    except Exception as e:
        print(f"Erreur creer_intervention: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la création de l\'intervention',
        }), 500

@interventions_bp.route('/<int:intervention_id>', methods=['GET'])
def obtenir_intervention(intervention_id):
    """Récupérer une intervention spécifique"""
    try:
        intervention = Intervention.query.get(intervention_id)
        if not intervention:
            return jsonify({
                'success': False,
                'message': 'Intervention non trouvée',
            }), 404

        intervention_data = intervention.to_dict()

        # Ajouter les informations du patient
        if intervention.patient_id:
            patient = Patient.query.get(intervention.patient_id)
            if patient:
                intervention_data['patient'] = {
                    'id': patient.id,
                    'code_patient': patient.code_patient,
                    'nom': patient.nom,
                    'prenom': patient.prenom,
                    'telephone': patient.telephone,
                    'email': patient.email,
                }

        # Ajouter les informations du dispositif
        if intervention.dispositif_id:
            dispositif = DispositifMedical.query.get(intervention.dispositif_id)
            if dispositif:
                intervention_data['dispositif'] = {
                    'id': dispositif.id,
                    'designation': dispositif.designation,
                    'reference': dispositif.reference,
                    'numero_serie': dispositif.numero_serie,
                }

        # Ajouter les informations du technicien
        if intervention.technicien_id:
            technicien = Utilisateur.query.get(intervention.technicien_id)
            if technicien:
                intervention_data['technicien'] = {
                    'id': technicien.id,
                    'nom': technicien.nom,
                    'prenom': technicien.prenom,
                    'email': technicien.email,
                }

        return jsonify({
            'success': True,
            'data': intervention_data,
            'message': 'Intervention récupérée avec succès',
        }), 200

    except Exception as e:
        print(f"Erreur obtenir_intervention: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération de l\'intervention',
        }), 500

@interventions_bp.route('/<int:intervention_id>', methods=['PUT'])
def modifier_intervention(intervention_id):
    """Modifier une intervention existante"""
    try:
        intervention = Intervention.query.get(intervention_id)
        if not intervention:
            return jsonify({
                'success': False,
                'message': 'Intervention non trouvée',
            }), 404

        data = request.get_json()

        # Mise à jour des champs
        champs_modifiables = [
            'patient_id', 'dispositif_id', 'technicien_id', 'type_intervention',
            'planifiee', 'temps_prevu', 'temps_reel', 'actions_effectuees',
            'satisfaction_technicien', 'signature_patient', 'signature_responsable', 'commentaire',
        ]

        for champ in champs_modifiables:
            if champ in data:
                setattr(intervention, champ, data[champ])

        # Traitement des dates
        if 'date_planifiee' in data:
            if data['date_planifiee']:
                try:
                    intervention.date_planifiee = datetime.strptime(data['date_planifiee'], '%Y-%m-%dT%H:%M:%S')
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Format de date planifiée invalide',
                    }), 400
            else:
                intervention.date_planifiee = None

        if 'date_reelle' in data:
            if data['date_reelle']:
                try:
                    intervention.date_reelle = datetime.strptime(data['date_reelle'], '%Y-%m-%dT%H:%M:%S')
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Format de date réelle invalide',
                    }), 400
            else:
                intervention.date_reelle = None

        db.session.commit()

        # Retourner l'intervention mise à jour
        intervention_data = intervention.to_dict()
        if intervention.patient_id:
            patient = Patient.query.get(intervention.patient_id)
            if patient:
                intervention_data['patient'] = {
                    'id': patient.id,
                    'code_patient': patient.code_patient,
                    'nom': patient.nom,
                    'prenom': patient.prenom,
                    'telephone': patient.telephone,
                    'email': patient.email,
                }
        if intervention.dispositif_id:
            dispositif = DispositifMedical.query.get(intervention.dispositif_id)
            if dispositif:
                intervention_data['dispositif'] = {
                    'id': dispositif.id,
                    'designation': dispositif.designation,
                    'reference': dispositif.reference,
                    'numero_serie': dispositif.numero_serie,
                }
        if intervention.technicien_id:
            technicien = Utilisateur.query.get(intervention.technicien_id)
            if technicien:
                intervention_data['technicien'] = {
                    'id': technicien.id,
                    'nom': technicien.nom,
                    'prenom': technicien.prenom,
                    'email': technicien.email,
                }

        return jsonify({
            'success': True,
            'data': intervention_data,
            'message': 'Intervention mise à jour avec succès',
        }), 200

    except Exception as e:
        print(f"Erreur modifier_intervention: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la modification de l\'intervention',
        }), 500

@interventions_bp.route('/<int:intervention_id>', methods=['DELETE'])
def supprimer_intervention(intervention_id):
    """Supprimer une intervention"""
    try:
        intervention = Intervention.query.get(intervention_id)
        if not intervention:
            return jsonify({
                'success': False,
                'message': 'Intervention non trouvée',
            }), 404

        intervention_info = f"{intervention.type_intervention} ({intervention.id})"
        db.session.delete(intervention)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Intervention {intervention_info} supprimée avec succès',
        }), 200

    except Exception as e:
        print(f"Erreur supprimer_intervention: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la suppression de l\'intervention',
        }), 500