from flask import Blueprint, jsonify, current_app, request
from extensions.base_donnees import db

debug_bp = Blueprint('debug', __name__)

@debug_bp.route('/cors-test', methods=['GET'])
def test_cors():
    """
    Route de test pour vérifier que CORS fonctionne correctement.
    Cette route renvoie simplement les en-têtes CORS configurés.
    """
    # Récupérer les en-têtes CORS depuis la configuration de l'application
    cors_headers = current_app.config.get('CORS_HEADERS', {})
    
    # Créer un dictionnaire pour la réponse
    response_data = {
        'success': True,
        'message': 'Test CORS réussi',
        'cors_headers': cors_headers
    }
    
    return jsonify(response_data), 200

@debug_bp.route('/patients', methods=['GET'])
def debug_patients():
    """Route de debug pour récupérer tous les patients"""
    try:
        from modeles.patient import Patient
        patients = Patient.query.all()
        
        def serialize_patient(patient):
            return {
                'id': patient.id,
                'code_patient': patient.code_patient,
                'nom': patient.nom,
                'prenom': patient.prenom,
                'cin': patient.cin,
                'date_naissance': patient.date_naissance.isoformat() if patient.date_naissance else None,
                'telephone': patient.telephone,
                'email': patient.email,
                'adresse': patient.adresse,
                'ville': patient.ville,
                'mutuelle': patient.mutuelle,
                'prescripteur_nom': patient.prescripteur_nom,
                'prescripteur_id': getattr(patient, 'prescripteur_id', None),
                'technicien_id': patient.technicien_id,
                'date_creation': patient.date_creation.isoformat() if patient.date_creation else None,
                'date_modification': patient.date_modification.isoformat() if patient.date_modification else None
            }
        
        patients_data = []
        for patient in patients:
            try:
                patients_data.append(serialize_patient(patient))
            except Exception as serialize_error:
                print(f"Erreur sérialisation patient {patient.id}: {serialize_error}")
                patients_data.append({
                    'id': patient.id,
                    'code_patient': getattr(patient, 'code_patient', f'P{patient.id}'),
                    'nom': patient.nom or 'N/A',
                    'prenom': patient.prenom or 'N/A',
                    'cin': getattr(patient, 'cin', ''),
                    'date_naissance': None,
                    'telephone': getattr(patient, 'telephone', ''),
                    'email': getattr(patient, 'email', ''),
                    'adresse': getattr(patient, 'adresse', ''),
                    'ville': getattr(patient, 'ville', ''),
                    'mutuelle': getattr(patient, 'mutuelle', ''),
                    'prescripteur_nom': '',
                    'prescripteur_id': None,
                    'technicien_id': None,
                    'date_creation': None,
                    'date_modification': None
                })
        
        return jsonify({
            'success': True,
            'count': len(patients_data),
            'patients': patients_data,
            'message': f'{len(patients_data)} patients récupérés avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur debug_patients: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'count': 0,
            'patients': [],
            'message': 'Erreur lors de la récupération des patients'
        }), 500

@debug_bp.route('/patients/<int:patient_id>', methods=['DELETE'])
def debug_delete_patient(patient_id):
    """Route de debug pour supprimer un patient"""
    try:
        from modeles.patient import Patient
        
        # Trouver le patient
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'message': f'Patient avec ID {patient_id} non trouvé'
            }), 404
        
        # Sauvegarder les infos pour le message
        patient_info = f"{patient.prenom} {patient.nom} ({patient.code_patient})"
        
        # Supprimer le patient
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Patient {patient_info} supprimé avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur suppression patient {patient_id}: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la suppression du patient'
        }), 500

@debug_bp.route('/prescripteurs', methods=['GET'])
def debug_prescripteurs():
    """Route de debug pour récupérer tous les prescripteurs"""
    try:
        from modeles.prescripteur import Prescripteur
        prescripteurs = Prescripteur.query.all()
        
        prescripteurs_data = []
        for prescripteur in prescripteurs:
            try:
                prescripteurs_data.append(prescripteur.to_dict())
            except Exception as e:
                print(f"Erreur sérialisation prescripteur {prescripteur.id}: {e}")
                prescripteurs_data.append({
                    'id': prescripteur.id,
                    'nom': getattr(prescripteur, 'nom', 'N/A'),
                    'prenom': getattr(prescripteur, 'prenom', 'N/A'),
                    'specialite': getattr(prescripteur, 'specialite', ''),
                    'telephone': getattr(prescripteur, 'telephone', ''),
                    'email': getattr(prescripteur, 'email', ''),
                })
        
        return jsonify({
            'success': True,
            'data': prescripteurs_data,
            'count': len(prescripteurs_data),
            'message': f'{len(prescripteurs_data)} prescripteurs trouvés'
        }), 200
        
    except Exception as e:
        print(f"Erreur debug_prescripteurs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': [],
            'message': 'Erreur lors de la récupération des prescripteurs'
        }), 500

@debug_bp.route('/utilisateurs', methods=['GET'])
def debug_utilisateurs():
    """Route de debug pour récupérer tous les utilisateurs"""
    try:
        from modeles.utilisateur import Utilisateur
        
        # Récupérer le paramètre role si fourni
        role_filter = request.args.get('role')
        
        if role_filter:
            utilisateurs = Utilisateur.query.filter_by(role=role_filter).all()
        else:
            utilisateurs = Utilisateur.query.all()
        
        utilisateurs_data = []
        for utilisateur in utilisateurs:
            try:
                utilisateurs_data.append({
                    'id': utilisateur.id,
                    'nom': utilisateur.nom,
                    'prenom': utilisateur.prenom,
                    'email': utilisateur.email,
                    'role': getattr(utilisateur, 'role', 'utilisateur'),
                    'actif': getattr(utilisateur, 'actif', True)
                })
            except Exception as e:
                print(f"Erreur sérialisation utilisateur {utilisateur.id}: {e}")
                utilisateurs_data.append({
                    'id': utilisateur.id,
                    'nom': getattr(utilisateur, 'nom', 'N/A'),
                    'prenom': getattr(utilisateur, 'prenom', 'N/A'),
                    'email': getattr(utilisateur, 'email', ''),
                    'role': 'utilisateur',
                    'actif': True
                })
        
        return jsonify({
            'success': True,
            'data': utilisateurs_data,
            'count': len(utilisateurs_data),
            'message': f'{len(utilisateurs_data)} utilisateurs trouvés' + (f' avec le rôle {role_filter}' if role_filter else '')
        }), 200
        
    except Exception as e:
        print(f"Erreur debug_utilisateurs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': [],
            'message': 'Erreur lors de la récupération des utilisateurs'
        }), 500

@debug_bp.route('/database-info', methods=['GET'])
def debug_database_info():
    """Route de debug pour obtenir des informations sur la base de données"""
    try:
        info = {
            'success': True,
            'database_url': current_app.config.get('SQLALCHEMY_DATABASE_URI', 'Non configurée'),
            'tables': []
        }
        
        # Essayer d'obtenir la liste des tables
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            info['tables'] = inspector.get_table_names()
        except Exception as e:
            info['tables_error'] = str(e)
        
        # Compter les enregistrements dans chaque table
        try:
            from modeles.patient import Patient
            from modeles.prescripteur import Prescripteur
            from modeles.utilisateur import Utilisateur
            
            info['counts'] = {
                'patients': Patient.query.count(),
                'prescripteurs': Prescripteur.query.count(),
                'utilisateurs': Utilisateur.query.count()
            }
        except Exception as e:
            info['counts_error'] = str(e)
        
        return jsonify(info), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des informations de la base de données'
        }), 500

@debug_bp.route('/patients', methods=['POST'])
def debug_create_patient():
    """Route de debug pour créer un nouveau patient"""
    try:
        from modeles.patient import Patient
        from flask import request
        import json
        from datetime import datetime
        
        # Récupérer les données de la requête
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        print(f"Données reçues pour création patient: {data}")
        
        # Validation des champs requis
        champs_requis = ['nom', 'prenom']
        for champ in champs_requis:
            if not data.get(champ):
                return jsonify({
                    'success': False,
                    'message': f'Le champ {champ} est requis'
                }), 400
        
        # Traiter la date de naissance
        date_naissance = None
        if data.get('date_naissance'):
            try:
                if isinstance(data['date_naissance'], str):
                    date_naissance = datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
                else:
                    date_naissance = data['date_naissance']
            except ValueError as e:
                return jsonify({
                    'success': False,
                    'message': f'Format de date invalide: {str(e)}'
                }), 400
        
        # Créer le nouveau patient
        nouveau_patient = Patient(
            nom=data['nom'],
            prenom=data['prenom'],
            cin=data.get('cin', ''),
            date_naissance=date_naissance,
            telephone=data.get('telephone', ''),
            email=data.get('email', ''),
            adresse=data.get('adresse', ''),
            ville=data.get('ville', ''),
            mutuelle=data.get('mutuelle', ''),
            prescripteur_id=data.get('prescripteur_id'),
            technicien_id=data.get('technicien_id')
        )
        
        # Générer le code patient unique
        nouveau_patient.generer_code_patient()
        
        # Sauvegarder en base de données
        db.session.add(nouveau_patient)
        db.session.commit()
        
        # Retourner le patient créé
        patient_data = {
            'id': nouveau_patient.id,
            'code_patient': nouveau_patient.code_patient,
            'nom': nouveau_patient.nom,
            'prenom': nouveau_patient.prenom,
            'cin': nouveau_patient.cin,
            'date_naissance': nouveau_patient.date_naissance.isoformat() if nouveau_patient.date_naissance else None,
            'telephone': nouveau_patient.telephone,
            'email': nouveau_patient.email,
            'adresse': nouveau_patient.adresse,
            'ville': nouveau_patient.ville,
            'mutuelle': nouveau_patient.mutuelle,
            'prescripteur_nom': nouveau_patient.prescripteur_nom,
            'prescripteur_id': nouveau_patient.prescripteur_id,
            'technicien_id': nouveau_patient.technicien_id,
            'date_creation': nouveau_patient.date_creation.isoformat() if nouveau_patient.date_creation else None,
            'date_modification': nouveau_patient.date_modification.isoformat() if nouveau_patient.date_modification else None
        }
        
        return jsonify({
            'success': True,
            'data': patient_data,
            'message': f'Patient {nouveau_patient.prenom} {nouveau_patient.nom} ({nouveau_patient.code_patient}) créé avec succès'
        }), 201
        
    except Exception as e:
        print(f"Erreur création patient: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la création du patient'
        }), 500

@debug_bp.route('/patients/<int:patient_id>', methods=['PUT'])
def debug_update_patient(patient_id):
    """Route de debug pour mettre à jour un patient"""
    try:
        from modeles.patient import Patient
        from flask import request
        from datetime import datetime
        
        # Trouver le patient
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'message': f'Patient avec ID {patient_id} non trouvé'
            }), 404
        
        # Récupérer les données de la requête
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        print(f"Données reçues pour modification patient {patient_id}: {data}")
        
        # Mettre à jour les champs fournis - EXCLURE les champs calculés/en lecture seule
        champs_modifiables = [
            'nom', 'prenom', 'cin', 'telephone', 'email', 
            'adresse', 'ville', 'mutuelle', 'prescripteur_id', 'technicien_id'
        ]
        
        # Champs à ignorer (propriétés calculées, champs système, etc.)
        champs_ignores = [
            'id', 'code_patient', 'prescripteur_nom', 
            'date_creation', 'date_modification'
        ]
        
        for champ in champs_modifiables:
            if champ in data:
                # Convertir les valeurs vides en None pour les clés étrangères
                valeur = data[champ]
                if champ in ['prescripteur_id', 'technicien_id'] and valeur == '':
                    valeur = None
                setattr(patient, champ, valeur)
        
        # Traiter la date de naissance si fournie
        if 'date_naissance' in data:
            if data['date_naissance']:
                try:
                    if isinstance(data['date_naissance'], str):
                        patient.date_naissance = datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
                    else:
                        patient.date_naissance = data['date_naissance']
                except ValueError as e:
                    return jsonify({
                        'success': False,
                        'message': f'Format de date invalide: {str(e)}'
                    }), 400
            else:
                patient.date_naissance = None
        
        # Mettre à jour la date de modification
        patient.date_modification = datetime.now()
        
        # Sauvegarder les modifications
        db.session.commit()
        
        # Retourner le patient mis à jour
        patient_data = {
            'id': patient.id,
            'code_patient': patient.code_patient,
            'nom': patient.nom,
            'prenom': patient.prenom,
            'cin': patient.cin,
            'date_naissance': patient.date_naissance.isoformat() if patient.date_naissance else None,
            'telephone': patient.telephone,
            'email': patient.email,
            'adresse': patient.adresse,
            'ville': patient.ville,
            'mutuelle': patient.mutuelle,
            'prescripteur_nom': patient.prescripteur_nom,  # Propriété calculée
            'prescripteur_id': patient.prescripteur_id,
            'technicien_id': patient.technicien_id,
            'date_creation': patient.date_creation.isoformat() if patient.date_creation else None,
            'date_modification': patient.date_modification.isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': patient_data,
            'message': f'Patient {patient.prenom} {patient.nom} mis à jour avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur modification patient {patient_id}: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la modification du patient'
        }), 500

@debug_bp.route('/patients/<int:patient_id>', methods=['GET'])
def debug_get_patient(patient_id):
    """Route de debug pour récupérer un patient spécifique"""
    try:
        from modeles.patient import Patient
        
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'message': f'Patient avec ID {patient_id} non trouvé'
            }), 404
        
        patient_data = {
            'id': patient.id,
            'code_patient': patient.code_patient,
            'nom': patient.nom,
            'prenom': patient.prenom,
            'cin': patient.cin,
            'date_naissance': patient.date_naissance.isoformat() if patient.date_naissance else None,
            'telephone': patient.telephone,
            'email': patient.email,
            'adresse': patient.adresse,
            'ville': patient.ville,
            'mutuelle': patient.mutuelle,
            'prescripteur_nom': patient.prescripteur_nom,
            'prescripteur_id': patient.prescripteur_id,
            'technicien_id': patient.technicien_id,
            'date_creation': patient.date_creation.isoformat() if patient.date_creation else None,
            'date_modification': patient.date_modification.isoformat() if patient.date_modification else None
        }
        
        return jsonify({
            'success': True,
            'data': patient_data,
            'message': f'Patient {patient.prenom} {patient.nom} récupéré avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur récupération patient {patient_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération du patient'
        }), 500

@debug_bp.route('/patients/statistiques', methods=['GET'])
def statistiques_patients():
    """Route pour obtenir les statistiques détaillées des patients"""
    try:
        # Total des patients
        total_patients = Patient.query.count()
        
        # Patients créés ce mois
        maintenant = datetime.now()
        debut_mois = datetime(maintenant.year, maintenant.month, 1)
        nouveaux_ce_mois = Patient.query.filter(
            Patient.date_creation >= debut_mois
        ).count()
        
        # Patients par mois (6 derniers mois)
        patients_par_mois = db.session.query(
            extract('year', Patient.date_creation).label('annee'),
            extract('month', Patient.date_creation).label('mois'),
            func.count(Patient.id).label('nombre')
        ).filter(
            Patient.date_creation >= datetime(maintenant.year, maintenant.month - 5, 1)
        ).group_by(
            extract('year', Patient.date_creation),
            extract('month', Patient.date_creation)
        ).order_by('annee', 'mois').all()
        
        # Formatage des données par mois
        mois_data = []
        for annee, mois, nombre in patients_par_mois:
            mois_nom = datetime(int(annee), int(mois), 1).strftime('%b %Y')
            mois_data.append({'mois': mois_nom, 'nombre': nombre})
        
        # Patients par ville
        patients_par_ville = db.session.query(
            Patient.ville,
            func.count(Patient.id).label('nombre')
        ).group_by(Patient.ville).order_by(
            func.count(Patient.id).desc()
        ).limit(10).all()
        
        villes_data = []
        for ville, nombre in patients_par_ville:
            ville_nom = ville or 'Non spécifiée'
            villes_data.append({'ville': ville_nom, 'nombre': nombre})
        
        # Patients avec dispositifs
        patients_avec_dispositifs = db.session.query(
            func.count(func.distinct(DispositifMedical.patient_id))
        ).filter(DispositifMedical.patient_id.isnot(None)).scalar()
        
        # Répartition par âge
        patients_ages = db.session.query(
            Patient.date_naissance
        ).filter(Patient.date_naissance.isnot(None)).all()
        
        tranches_age = {'0-18': 0, '19-35': 0, '36-55': 0, '56-70': 0, '70+': 0}
        for (date_naissance,) in patients_ages:
            if date_naissance:
                age = (date.today() - date_naissance).days // 365
                if age <= 18:
                    tranches_age['0-18'] += 1
                elif age <= 35:
                    tranches_age['19-35'] += 1
                elif age <= 55:
                    tranches_age['36-55'] += 1
                elif age <= 70:
                    tranches_age['56-70'] += 1
                else:
                    tranches_age['70+'] += 1
        
        # Patients par prescripteur
        patients_par_prescripteur = db.session.query(
            Patient.prescripteur_nom,
            func.count(Patient.id).label('nombre')
        ).filter(
            Patient.prescripteur_nom.isnot(None),
            Patient.prescripteur_nom != ''
        ).group_by(Patient.prescripteur_nom).order_by(
            func.count(Patient.id).desc()
        ).limit(5).all()
        
        prescripteurs_data = []
        for prescripteur, nombre in patients_par_prescripteur:
            prescripteurs_data.append({'prescripteur': prescripteur, 'nombre': nombre})
        
        return jsonify({
            'success': True,
            'data': {
                'total_patients': total_patients,
                'nouveaux_ce_mois': nouveaux_ce_mois,
                'patients_avec_dispositifs': patients_avec_dispositifs or 0,
                'par_mois': mois_data,
                'par_ville': villes_data,
                'par_tranche_age': [
                    {'tranche': k, 'nombre': v} 
                    for k, v in tranches_age.items() if v > 0
                ],
                'par_prescripteur': prescripteurs_data,
                'taux_equipement': round(
                    (patients_avec_dispositifs / total_patients * 100) if total_patients > 0 else 0, 2
                )
            },
            'message': 'Statistiques des patients récupérées avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur statistiques_patients: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des statistiques'
        }), 500


# Route alternative pour les statistiques générales
@debug_bp.route('/statistiques/general', methods=['GET'])
def statistiques_general():
    """Route pour obtenir toutes les statistiques en une fois"""
    try:
        # Récupérer les stats patients
        from routes.debug import debug_bp
        patients_response = statistiques_patients()  # Appeler la fonction directement
        
        # Récupérer les stats dispositifs
        from routes.dispositifs import statistiques_dispositifs
        dispositifs_response = statistiques_dispositifs()
        
        # Combiner les réponses
        patients_data = patients_response[0].get_json()['data'] if patients_response[1] == 200 else {}
        
        try:
            dispositifs_data = statistiques_dispositifs()[0].get_json()['data']
        except:
            dispositifs_data = {}
        
        return jsonify({
            'success': True,
            'data': {
                'patients': patients_data,
                'dispositifs': dispositifs_data,
                'resume': {
                    'total_patients': patients_data.get('total_patients', 0),
                    'total_dispositifs': dispositifs_data.get('total_dispositifs', 0),
                    'taux_equipement': patients_data.get('taux_equipement', 0),
                    'nouveaux_ce_mois': patients_data.get('nouveaux_ce_mois', 0)
                }
            },
            'message': 'Statistiques générales récupérées avec succès'
        }), 200
        
    except Exception as e:
        print(f"Erreur statistiques_general: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des statistiques générales'
        }), 500
        