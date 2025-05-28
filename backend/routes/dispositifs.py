from flask import Blueprint, request, jsonify
from extensions.base_donnees import db
from modeles.dispositif_medical import DispositifMedical
from modeles.patient import Patient
from datetime import datetime, date
from sqlalchemy import or_, func

dispositifs_bp = Blueprint('dispositifs', __name__)

@dispositifs_bp.route('', methods=['GET'])
def lister_dispositifs():
    """Récupérer tous les dispositifs médicaux avec pagination et recherche"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        recherche = request.args.get('recherche', '', type=str)
        patient_id = request.args.get('patient_id', type=int)
        statut = request.args.get('statut', type=str)
        
        # Construction de la requête
        query = DispositifMedical.query
        
        # Filtrage par patient
        if patient_id:
            query = query.filter(DispositifMedical.patient_id == patient_id)
        
        # Filtrage par statut
        if statut:
            query = query.filter(DispositifMedical.statut == statut)
        
        # Recherche textuelle
        if recherche:
            query = query.filter(
                or_(
                    DispositifMedical.designation.ilike(f'%{recherche}%'),
                    DispositifMedical.reference.ilike(f'%{recherche}%'),
                    DispositifMedical.numero_serie.ilike(f'%{recherche}%')
                )
            )
        
        # Jointure avec Patient pour inclure les informations patient
        query = query.join(Patient, DispositifMedical.patient_id == Patient.id, isouter=True)
        
        # Pagination
        dispositifs_pagines = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Sérialisation des données
        dispositifs_data = []
        for dispositif in dispositifs_pagines.items:
            data = dispositif.to_dict()
            # Ajouter les informations du patient
            if dispositif.patient_id:
                patient = Patient.query.get(dispositif.patient_id)
                if patient:
                    data['patient'] = {
                        'id': patient.id,
                        'code_patient': patient.code_patient,
                        'nom': patient.nom,
                        'prenom': patient.prenom
                    }
            dispositifs_data.append(data)
        
        return jsonify({
            'success': True,
            'data': {
                'items': dispositifs_data,
                'page_courante': dispositifs_pagines.page,
                'pages_totales': dispositifs_pagines.pages,
                'total_elements': dispositifs_pagines.total,
                'elements_par_page': dispositifs_pagines.per_page
            },
            'message': f'{len(dispositifs_data)} dispositifs trouvés'
        }), 200
        
    except Exception as e:
        print(f"Erreur lister_dispositifs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des dispositifs'
        }), 500

@dispositifs_bp.route('', methods=['POST'])
def creer_dispositif():
    """Créer un nouveau dispositif médical"""
    try:
        data = request.get_json()
        
        # Validation des champs requis (exclure patient_id)
        champs_requis = ['designation', 'type_acquisition']
        for champ in champs_requis:
            if not data.get(champ):
                return jsonify({
                    'success': False,
                    'message': f'Le champ {champ} est requis'
                }), 400
        
        # Vérifier que le patient existe si patient_id est fourni
        patient_id = data.get('patient_id')
        if patient_id is not None:
            patient = Patient.query.get(patient_id)
            if not patient:
                return jsonify({
                    'success': False,
                    'message': 'Patient non trouvé'
                }), 404
        
        # Vérifier l'unicité du numéro de série si fourni
        if data.get('numero_serie'):
            dispositif_existant = DispositifMedical.query.filter_by(
                numero_serie=data['numero_serie']
            ).first()
            if dispositif_existant:
                return jsonify({
                    'success': False,
                    'message': 'Un dispositif avec ce numéro de série existe déjà'
                }), 400
        
        # Traitement des dates
        date_acquisition = None
        if data.get('date_acquisition'):
            try:
                date_acquisition = datetime.strptime(data['date_acquisition'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Format de date d\'acquisition invalide (YYYY-MM-DD attendu)'
                }), 400
        
        date_fin_garantie = None
        if data.get('date_fin_garantie'):
            try:
                date_fin_garantie = datetime.strptime(data['date_fin_garantie'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Format de date de fin de garantie invalide (YYYY-MM-DD attendu)'
                }), 400
        
        date_fin_location = None
        if data.get('date_fin_location'):
            try:
                date_fin_location = datetime.strptime(data['date_fin_location'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Format de date de fin de location invalide (YYYY-MM-DD attendu)'
                }), 400
        
        # Créer le nouveau dispositif
        nouveau_dispositif = DispositifMedical(
            patient_id=patient_id,  # Peut être None
            designation=data['designation'],
            reference=data.get('reference', ''),
            numero_serie=data.get('numero_serie', ''),
            type_acquisition=data['type_acquisition'],
            date_acquisition=date_acquisition,
            date_fin_garantie=date_fin_garantie,
            duree_location=data.get('duree_location'),
            date_fin_location=date_fin_location,
            statut=data.get('statut', 'actif')
        )
        
        db.session.add(nouveau_dispositif)
        db.session.commit()
        
        # Récupérer le dispositif créé avec les relations
        dispositif_data = nouveau_dispositif.to_dict()
        if patient_id:
            patient = Patient.query.get(patient_id)
            if patient:
                dispositif_data['patient'] = {
                    'id': patient.id,
                    'code_patient': patient.code_patient,
                    'nom': patient.nom,
                    'prenom': patient.prenom
                }
        
        return jsonify({
            'success': True,
            'data': dispositif_data,
            'message': f'Dispositif {nouveau_dispositif.designation} créé avec succès'
        }), 201
        
    except Exception as e:
        print(f"Erreur creer_dispositif: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la création du dispositif'
        }), 500
        
@dispositifs_bp.route('/<int:dispositif_id>', methods=['GET'])
def obtenir_dispositif(dispositif_id):
    """Récupérer un dispositif spécifique"""
    try:
        dispositif = DispositifMedical.query.get(dispositif_id)
        if not dispositif:
            return jsonify({
                'success': False,
                'message': 'Dispositif non trouvé'
            }), 404
        
        dispositif_data = dispositif.to_dict()
        
        # Ajouter les informations du patient
        if dispositif.patient_id:
            patient = Patient.query.get(dispositif.patient_id)
            if patient:
                dispositif_data['patient'] = {
                    'id': patient.id,
                    'code_patient': patient.code_patient,
                    'nom': patient.nom,
                    'prenom': patient.prenom,
                    'telephone': patient.telephone,
                    'email': patient.email
                }
        
        return jsonify({
            'success': True,
            'data': dispositif_data,
            'message': 'Dispositif récupéré avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur obtenir_dispositif: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération du dispositif'
        }), 500

@dispositifs_bp.route('/<int:dispositif_id>', methods=['PUT'])
def modifier_dispositif(dispositif_id):
    """Modifier un dispositif existant"""
    try:
        dispositif = DispositifMedical.query.get(dispositif_id)
        if not dispositif:
            return jsonify({
                'success': False,
                'message': 'Dispositif non trouvé'
            }), 404
        
        data = request.get_json()
        
        # Vérifier l'unicité du numéro de série si modifié
        if data.get('numero_serie') and data['numero_serie'] != dispositif.numero_serie:
            dispositif_existant = DispositifMedical.query.filter_by(
                numero_serie=data['numero_serie']
            ).first()
            if dispositif_existant:
                return jsonify({
                    'success': False,
                    'message': 'Un dispositif avec ce numéro de série existe déjà'
                }), 400
        
        # Mise à jour des champs
        champs_modifiables = [
            'patient_id', 'designation', 'reference', 'numero_serie',
            'type_acquisition', 'duree_location', 'statut'
        ]
        
        for champ in champs_modifiables:
            if champ in data:
                setattr(dispositif, champ, data[champ])
        
        # Traitement des dates
        if 'date_acquisition' in data:
            if data['date_acquisition']:
                try:
                    dispositif.date_acquisition = datetime.strptime(data['date_acquisition'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Format de date d\'acquisition invalide'
                    }), 400
            else:
                dispositif.date_acquisition = None
        
        if 'date_fin_garantie' in data:
            if data['date_fin_garantie']:
                try:
                    dispositif.date_fin_garantie = datetime.strptime(data['date_fin_garantie'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Format de date de fin de garantie invalide'
                    }), 400
            else:
                dispositif.date_fin_garantie = None
        
        if 'date_fin_location' in data:
            if data['date_fin_location']:
                try:
                    dispositif.date_fin_location = datetime.strptime(data['date_fin_location'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Format de date de fin de location invalide'
                    }), 400
            else:
                dispositif.date_fin_location = None
        
        db.session.commit()
        
        # Retourner le dispositif mis à jour
        dispositif_data = dispositif.to_dict()
        if dispositif.patient_id:
            patient = Patient.query.get(dispositif.patient_id)
            if patient:
                dispositif_data['patient'] = {
                    'id': patient.id,
                    'code_patient': patient.code_patient,
                    'nom': patient.nom,
                    'prenom': patient.prenom
                }
        
        return jsonify({
            'success': True,
            'data': dispositif_data,
            'message': 'Dispositif mis à jour avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur modifier_dispositif: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la modification du dispositif'
        }), 500

@dispositifs_bp.route('/<int:dispositif_id>', methods=['DELETE'])
def supprimer_dispositif(dispositif_id):
    """Supprimer un dispositif"""
    try:
        dispositif = DispositifMedical.query.get(dispositif_id)
        if not dispositif:
            return jsonify({
                'success': False,
                'message': 'Dispositif non trouvé'
            }), 404
        
        # Sauvegarder les informations pour le message
        dispositif_info = f"{dispositif.designation} ({dispositif.reference})"
        
        db.session.delete(dispositif)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Dispositif {dispositif_info} supprimé avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur supprimer_dispositif: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la suppression du dispositif'
        }), 500

@dispositifs_bp.route('/<int:dispositif_id>/associer-patient', methods=['POST'])
def associer_patient(dispositif_id):
    """Associer un dispositif à un patient"""
    try:
        dispositif = DispositifMedical.query.get(dispositif_id)
        if not dispositif:
            return jsonify({
                'success': False,
                'message': 'Dispositif non trouvé'
            }), 404
        
        data = request.get_json()
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({
                'success': False,
                'message': 'ID du patient requis'
            }), 400
        
        # Vérifier que le patient existe
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'message': 'Patient non trouvé'
            }), 404
        
        dispositif.patient_id = patient_id
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Dispositif associé au patient {patient.prenom} {patient.nom}'
        }), 200
        
    except Exception as e:
        print(f"Erreur associer_patient: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de l\'association'
        }), 500

@dispositifs_bp.route('/<int:dispositif_id>/dissocier-patient', methods=['POST'])
def dissocier_patient(dispositif_id):
    """Dissocier un dispositif de son patient"""
    try:
        dispositif = DispositifMedical.query.get(dispositif_id)
        if not dispositif:
            return jsonify({
                'success': False,
                'message': 'Dispositif non trouvé'
            }), 404
        
        if not dispositif.patient_id:
            return jsonify({
                'success': False,
                'message': 'Ce dispositif n\'est associé à aucun patient'
            }), 400
        
        patient_nom = f"{dispositif.patient.prenom} {dispositif.patient.nom}" if dispositif.patient else "Inconnu"
        dispositif.patient_id = None
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Dispositif dissocié du patient {patient_nom}'
        }), 200
        
    except Exception as e:
        print(f"Erreur dissocier_patient: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la dissociation'
        }), 500

@dispositifs_bp.route('/statistiques', methods=['GET'])
def statistiques_dispositifs():
    """Obtenir les statistiques des dispositifs médicaux"""
    try:
        # Total des dispositifs
        total_dispositifs = DispositifMedical.query.count()
        
        # Répartition par statut
        statuts = db.session.query(
            DispositifMedical.statut,
            func.count(DispositifMedical.id).label('count')
        ).group_by(DispositifMedical.statut).all()
        
        repartition_statuts = {statut: count for statut, count in statuts}
        
        # Répartition par type d'acquisition
        types_acquisition = db.session.query(
            DispositifMedical.type_acquisition,
            func.count(DispositifMedical.id).label('count')
        ).group_by(DispositifMedical.type_acquisition).all()
        
        repartition_types = {type_acq: count for type_acq, count in types_acquisition}
        
        # Dispositifs sous garantie
        dispositifs_sous_garantie = DispositifMedical.query.filter(
            DispositifMedical.date_fin_garantie >= date.today()
        ).count()
        
        # Top 5 des désignations les plus utilisées
        top_designations = db.session.query(
            DispositifMedical.designation,
            func.count(DispositifMedical.id).label('count')
        ).group_by(DispositifMedical.designation).order_by(
            func.count(DispositifMedical.id).desc()
        ).limit(5).all()
        
        # Dispositifs par patient (moyenne)
        nb_patients_avec_dispositifs = db.session.query(
            func.count(func.distinct(DispositifMedical.patient_id))
        ).scalar()
        
        moyenne_dispositifs_par_patient = (
            total_dispositifs / nb_patients_avec_dispositifs
            if nb_patients_avec_dispositifs > 0 else 0
        )
        
        return jsonify({
            'success': True,
            'data': {
                'total_dispositifs': total_dispositifs,
                'repartition_statuts': repartition_statuts,
                'repartition_types_acquisition': repartition_types,
                'dispositifs_sous_garantie': dispositifs_sous_garantie,
                'top_designations': [
                    {'designation': designation, 'count': count}
                    for designation, count in top_designations
                ],
                'moyenne_dispositifs_par_patient': round(moyenne_dispositifs_par_patient, 2),
                'nb_patients_avec_dispositifs': nb_patients_avec_dispositifs
            },
            'message': 'Statistiques récupérées avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur statistiques_dispositifs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des statistiques'
        }), 500