# init_db.py
from app import creer_app
from extensions.base_donnees import db
from datetime import datetime, date, timedelta
import modeles  # Importe tous les modèles dans le bon ordre

def init_db():
    """Initialise la base de données avec des données de départ"""
    app = creer_app()
    
    with app.app_context():
        # Créer toutes les tables
        db.create_all()
        
        # Importer les modèles nécessaires
        from modeles.utilisateur import Utilisateur
        from modeles.prescripteur import Prescripteur
        from modeles.patient import Patient
        from modeles.dispositif_medical import DispositifMedical
        from modeles.intervention import Intervention
        
        # Liste des prescripteurs à créer
        prescripteurs_data = [
            {
                'nom': 'Docteur',
                'prenom': 'Test',
                'specialite': 'Généraliste',
                'telephone': '+212600000001',
                'email': 'docteur@example.com'
            },
            {
                'nom': 'Professeur',
                'prenom': 'Cardio',
                'specialite': 'Cardiologie',
                'telephone': '+212600000002',
                'email': 'cardio@example.com'
            },
            {
                'nom': 'Docteur',
                'prenom': 'Pneumo',
                'specialite': 'Pneumologie',
                'telephone': '+212600000003',
                'email': 'pneumo@example.com'
            }
        ]
        
        # Créer les prescripteurs
        prescripteurs_crees = 0
        for data in prescripteurs_data:
            if not Prescripteur.query.filter_by(email=data['email']).first():
                prescripteur = Prescripteur(**data)
                db.session.add(prescripteur)
                prescripteurs_crees += 1
        
        if prescripteurs_crees > 0:
            db.session.commit()
            print(f"{prescripteurs_crees} prescripteurs créés avec succès")
        
        # Liste des utilisateurs à créer
        utilisateurs_data = [
            {
                'nom_utilisateur': 'admin',
                'email': 'admin@oxycare.com',
                'nom': 'Administrateur',
                'prenom': 'Système',
                'role': 'admin',
                'mot_de_passe': 'Admin@123'  # Mot de passe fort
            },
            {
                'nom_utilisateur': 'technicien1',
                'email': 'tech1@oxycare.com',
                'nom': 'Technicien',
                'prenom': 'Principal',
                'role': 'technicien',
                'mot_de_passe': 'Tech@123'
            },
            {
                'nom_utilisateur': 'technicien2',
                'email': 'tech2@oxycare.com',
                'nom': 'Technicien',
                'prenom': 'Secondaire',
                'role': 'technicien',
                'mot_de_passe': 'Tech@456'
            }
        ]
        
        # Créer les utilisateurs
        utilisateurs_crees = 0
        for data in utilisateurs_data:
            if not Utilisateur.query.filter_by(nom_utilisateur=data['nom_utilisateur']).first():
                utilisateur = Utilisateur(
                    nom_utilisateur=data['nom_utilisateur'],
                    email=data['email'],
                    nom=data['nom'],
                    prenom=data['prenom'],
                    role=data['role'],
                    est_actif=True
                )
                utilisateur.mot_de_passe = data['mot_de_passe']
                db.session.add(utilisateur)
                utilisateurs_crees += 1
        
        if utilisateurs_crees > 0:
            db.session.commit()
            print(f"{utilisateurs_crees} utilisateurs créés avec succès")
        
        # Créer des patients de test si ils n'existent pas
        patients_data = [
            {
                'code_patient': 'P001',
                'nom': 'Bennani',
                'prenom': 'Ahmed',
                'date_naissance': date(1950, 5, 10),
                'telephone': '+212600111001',
                'email': 'ahmed.bennani@email.com',
                'adresse': '123 Rue Mohammed V, Casablanca'
            },
            {
                'code_patient': 'P002',
                'nom': 'Alami',
                'prenom': 'Fatima',
                'date_naissance': date(1965, 8, 20),
                'telephone': '+212600111002',
                'email': 'fatima.alami@email.com',
                'adresse': '456 Avenue Hassan II, Rabat'
            },
            {
                'code_patient': 'P003',
                'nom': 'Tazi',
                'prenom': 'Mohamed',
                'date_naissance': date(1955, 12, 0o3),
                'telephone': '+212600111003',
                'email': 'mohamed.tazi@email.com',
                'adresse': '789 Boulevard Zerktouni, Marrakech'
            },
            {
                'code_patient': 'P004',
                'nom': 'Cherkaoui',
                'prenom': 'Aicha',
                'date_naissance': date(1972, 3, 18),
                'telephone': '+212600111004',
                'email': 'aicha.cherkaoui@email.com',
                'adresse': '321 Rue Allal Ben Abdellah, Fès'
            },
            {
                'code_patient': 'P005',
                'nom': 'Hassani',
                'prenom': 'Omar',
                'date_naissance': date(1948, 11, 30),
                'telephone': '+212600111005',
                'email': 'omar.hassani@email.com',
                'adresse': '654 Avenue Mohammed VI, Agadir'
            }
        ]
        
        # Créer les patients
        patients_crees = 0
        prescripteur_id = Prescripteur.query.first().id if Prescripteur.query.first() else 1
        
        for data in patients_data:
            if not Patient.query.filter_by(code_patient=data['code_patient']).first():
                patient = Patient(
                    code_patient=data['code_patient'],
                    nom=data['nom'],
                    prenom=data['prenom'],
                    date_naissance=data['date_naissance'],
                    telephone=data['telephone'],
                    email=data['email'],
                    adresse=data['adresse'],
                    prescripteur_id=prescripteur_id
                )
                db.session.add(patient)
                patients_crees += 1
        
        if patients_crees > 0:
            db.session.commit()
            print(f"{patients_crees} patients créés avec succès")
        
        # Créer des dispositifs médicaux de test
        dispositifs_data = [
            # Concentrateurs d'oxygène
            {
                'designation': 'Concentrateur d\'oxygène portable',
                'reference': 'CONC-PORT-001',
                'numero_serie': 'OXY2024001',
                'type_acquisition': 'location',
                'date_acquisition': date.today() - timedelta(days=90),
                'duree_location': 12,
                'date_fin_location': date.today() + timedelta(days=275),
                'statut': 'actif'
            },
            {
                'designation': 'Concentrateur d\'oxygène stationnaire 5L',
                'reference': 'CONC-STAT-5L',
                'numero_serie': 'OXY2024002',
                'type_acquisition': 'achat_garantie',
                'date_acquisition': date.today() - timedelta(days=180),
                'date_fin_garantie': date.today() + timedelta(days=545),
                'statut': 'actif'
            },
            {
                'designation': 'Concentrateur d\'oxygène portable léger',
                'reference': 'CONC-PORT-LIGHT',
                'numero_serie': 'OXY2024003',
                'type_acquisition': 'location',
                'date_acquisition': date.today() - timedelta(days=45),
                'duree_location': 6,
                'date_fin_location': date.today() + timedelta(days=135),
                'statut': 'actif'
            },
            
            # Appareils de ventilation
            {
                'designation': 'Ventilateur CPAP',
                'reference': 'VENT-CPAP-001',
                'numero_serie': 'VENT2024001',
                'type_acquisition': 'achat_garantie',
                'date_acquisition': date.today() - timedelta(days=120),
                'date_fin_garantie': date.today() + timedelta(days=610),
                'statut': 'actif'
            },
            {
                'designation': 'Ventilateur BiPAP',
                'reference': 'VENT-BIPAP-001',
                'numero_serie': 'VENT2024002',
                'type_acquisition': 'achat_oxylife',
                'date_acquisition': date.today() - timedelta(days=200),
                'statut': 'actif'
            },
            {
                'designation': 'Masque nasal CPAP',
                'reference': 'MASK-NASAL-001',
                'numero_serie': 'MASK2024001',
                'type_acquisition': 'achat_externe',
                'date_acquisition': date.today() - timedelta(days=30),
                'statut': 'actif'
            },
            
            # Autres dispositifs
            {
                'designation': 'Humidificateur chauffant',
                'reference': 'HUMID-CHAUF-001',
                'numero_serie': 'HUM2024001',
                'type_acquisition': 'location',
                'date_acquisition': date.today() - timedelta(days=60),
                'duree_location': 9,
                'date_fin_location': date.today() + timedelta(days=210),
                'statut': 'actif'
            },
            {
                'designation': 'Oxymètre de pouls',
                'reference': 'OXY-PULSE-001',
                'numero_serie': 'PULSE2024001',
                'type_acquisition': 'achat_garantie',
                'date_acquisition': date.today() - timedelta(days=150),
                'date_fin_garantie': date.today() + timedelta(days=580),
                'statut': 'actif'
            },
            {
                'designation': 'Nébuliseur ultrasonique',
                'reference': 'NEBUL-ULTRA-001',
                'numero_serie': 'NEB2024001',
                'type_acquisition': 'achat_externe',
                'date_acquisition': date.today() - timedelta(days=100),
                'statut': 'en_maintenance'
            },
            {
                'designation': 'Concentrateur d\'oxygène 10L',
                'reference': 'CONC-STAT-10L',
                'numero_serie': 'OXY2024004',
                'type_acquisition': 'achat_oxylife',
                'date_acquisition': date.today() - timedelta(days=300),
                'statut': 'retiré'
            }
        ]
        
        # Récupérer les IDs des patients créés
        patients = Patient.query.all()
        
        dispositifs_crees = 0
        if patients:
            for i, data in enumerate(dispositifs_data):
                # Vérifier si un dispositif avec ce numéro de série existe déjà
                if not DispositifMedical.query.filter_by(numero_serie=data['numero_serie']).first():
                    # Assigner cycliquement les dispositifs aux patients
                    patient_id = patients[i % len(patients)].id
                    
                    dispositif = DispositifMedical(
                        patient_id=patient_id,
                        designation=data['designation'],
                        reference=data['reference'],
                        numero_serie=data['numero_serie'],
                        type_acquisition=data['type_acquisition'],
                        date_acquisition=data['date_acquisition'],
                        date_fin_garantie=data.get('date_fin_garantie'),
                        duree_location=data.get('duree_location'),
                        date_fin_location=data.get('date_fin_location'),
                        statut=data['statut']
                    )
                    db.session.add(dispositif)
                    dispositifs_crees += 1
            
            if dispositifs_crees > 0:
                db.session.commit()
                print(f"{dispositifs_crees} dispositifs médicaux créés avec succès")
        else:
            print("Aucun patient trouvé - impossible de créer les dispositifs médicaux")
        
        # Créer des interventions de test
        interventions_data = [
            # Intervention 1: Installation terminée
            {
                'patient_id': 1,
                'dispositif_id': 1,
                'technicien_id': 2,  # technicien1
                'type_intervention': 'Installation',
                'planifiee': True,
                'date_planifiee': datetime.now() - timedelta(days=10),
                'date_reelle': datetime.now() - timedelta(days=10),
                'temps_prevu': 60,
                'temps_reel': 65,
                'actions_effectuees': 'Installation du concentrateur d\'oxygène portable et formation du patient',
                'satisfaction_technicien': 8,
                'signature_patient': True,
                'signature_responsable': True,
                'commentaire': 'Patient satisfait, installation réussie'
            },
            # Intervention 2: Maintenance terminée
            {
                'patient_id': 2,
                'dispositif_id': 2,
                'technicien_id': 3,  # technicien2
                'type_intervention': 'Maintenance',
                'planifiee': True,
                'date_planifiee': datetime.now() - timedelta(days=5),
                'date_reelle': datetime.now() - timedelta(days=5),
                'temps_prevu': 45,
                'temps_reel': 50,
                'actions_effectuees': 'Vérification et nettoyage du concentrateur stationnaire',
                'satisfaction_technicien': 7,
                'signature_patient': True,
                'signature_responsable': False,
                'commentaire': 'Maintenance effectuée sans problème'
            },
            # Intervention 3: Réglage planifié
            {
                'patient_id': 3,
                'dispositif_id': 4,
                'technicien_id': 2,
                'type_intervention': 'Réglage',
                'planifiee': True,
                'date_planifiee': datetime.now() + timedelta(days=2),
                'date_reelle': None,
                'temps_prevu': 30,
                'temps_reel': None,
                'actions_effectuees': None,
                'satisfaction_technicien': None,
                'signature_patient': False,
                'signature_responsable': False,
                'commentaire': 'Réglage du ventilateur CPAP prévu'
            },
            # Intervention 4: Installation en attente
            {
                'patient_id': 4,
                'dispositif_id': 5,
                'technicien_id': 3,
                'type_intervention': 'Installation',
                'planifiee': False,
                'date_planifiee': None,
                'date_reelle': None,
                'temps_prevu': 90,
                'temps_reel': None,
                'actions_effectuees': None,
                'satisfaction_technicien': None,
                'signature_patient': False,
                'signature_responsable': False,
                'commentaire': 'En attente de confirmation du patient'
            },
            # Intervention 5: Maintenance terminée
            {
                'patient_id': 5,
                'dispositif_id': 7,
                'technicien_id': 2,
                'type_intervention': 'Maintenance',
                'planifiee': True,
                'date_planifiee': datetime.now() - timedelta(days=15),
                'date_reelle': datetime.now() - timedelta(days=15),
                'temps_prevu': 40,
                'temps_reel': 45,
                'actions_effectuees': 'Nettoyage et vérification de l\'humidificateur',
                'satisfaction_technicien': 9,
                'signature_patient': True,
                'signature_responsable': True,
                'commentaire': 'Tout fonctionne correctement'
            },
            # Intervention 6: Contrôle planifié
            {
                'patient_id': 1,
                'dispositif_id': 3,
                'technicien_id': 3,  # technicien2
                'type_intervention': 'Contrôle',
                'planifiee': True,
                'date_planifiee': datetime.now() + timedelta(days=5),
                'date_reelle': None,
                'temps_prevu': 20,
                'temps_reel': None,
                'actions_effectuees': None,
                'satisfaction_technicien': None,
                'signature_patient': False,
                'signature_responsable': False,
                'commentaire': 'Contrôle périodique du concentrateur portable léger prévu'
            },
            # Intervention 7: Maintenance terminée
            {
                'patient_id': 2,
                'dispositif_id': 6,
                'technicien_id': 2,  # technicien1
                'type_intervention': 'Maintenance',
                'planifiee': True,
                'date_planifiee': datetime.now() - timedelta(days=20),
                'date_reelle': datetime.now() - timedelta(days=20),
                'temps_prevu': 50,
                'temps_reel': 55,
                'actions_effectuees': 'Entretien du masque nasal CPAP',
                'satisfaction_technicien': 8,
                'signature_patient': True,
                'signature_responsable': True,
                'commentaire': 'Masque vérifié, patient formé'
            },
            # Intervention 8: Installation planifiée
            {
                'patient_id': 3,
                'dispositif_id': 8,
                'technicien_id': 3,
                'type_intervention': 'Installation',
                'planifiee': True,
                'date_planifiee': datetime.now() + timedelta(days=1),
                'date_reelle': None,
                'temps_prevu': 70,
                'temps_reel': None,
                'actions_effectuees': None,
                'satisfaction_technicien': None,
                'signature_patient': False,
                'signature_responsable': False,
                'commentaire': 'Installation de l\'oxymètre de pouls prévue demain'
            },
            # Intervention 9: Réglage en attente
            {
                'patient_id': 4,
                'dispositif_id': 1,
                'technicien_id': 2,
                'type_intervention': 'Réglage',
                'planifiee': False,
                'date_planifiee': None,
                'date_reelle': None,
                'temps_prevu': 25,
                'temps_reel': None,
                'actions_effectuees': None,
                'satisfaction_technicien': None,
                'signature_patient': False,
                'signature_responsable': False,
                'commentaire': 'Réglage en attente de planification'
            },
            # Intervention 10: Contrôle terminé
            {
                'patient_id': 5,
                'dispositif_id': 4,
                'technicien_id': 3,
                'type_intervention': 'Contrôle',
                'planifiee': True,
                'date_planifiee': datetime.now() - timedelta(days=3),
                'date_reelle': datetime.now() - timedelta(days=3),
                'temps_prevu': 30,
                'temps_reel': 35,
                'actions_effectuees': 'Vérification des paramètres du ventilateur CPAP',
                'satisfaction_technicien': 9,
                'signature_patient': True,
                'signature_responsable': False,
                'commentaire': 'Contrôle satisfaisant, paramètres ajustés'
            }
        ]
        
        # Créer les interventions
        interventions_crees = 0
        patients = Patient.query.all()
        dispositifs = DispositifMedical.query.filter_by(statut='actif').all()  # Seulement dispositifs actifs
        techniciens = Utilisateur.query.filter_by(role='technicien').all()
        
        if patients and dispositifs and techniciens:
            for data in interventions_data:
                # Vérifier que les relations existent
                patient_exists = db.session.get(Patient, data['patient_id'])
                dispositif_exists = db.session.get(DispositifMedical, data['dispositif_id'])
                technicien_exists = db.session.get(Utilisateur, data['technicien_id'])
                
                if patient_exists and dispositif_exists and technicien_exists:
                    # Vérifier si une intervention similaire existe déjà
                    intervention_exists = Intervention.query.filter_by(
                        patient_id=data['patient_id'],
                        dispositif_id=data['dispositif_id'],
                        date_planifiee=data['date_planifiee']
                    ).first()
                    
                    if not intervention_exists:
                        intervention = Intervention(
                            patient_id=data['patient_id'],
                            dispositif_id=data['dispositif_id'],
                            technicien_id=data['technicien_id'],
                            type_intervention=data['type_intervention'],
                            planifiee=data['planifiee'],
                            date_planifiee=data['date_planifiee'],
                            date_reelle=data['date_reelle'],
                            temps_prevu=data['temps_prevu'],
                            temps_reel=data['temps_reel'],
                            actions_effectuees=data['actions_effectuees'],
                            satisfaction_technicien=data['satisfaction_technicien'],
                            signature_patient=data['signature_patient'],
                            signature_responsable=data['signature_responsable'],
                            commentaire=data['commentaire']
                            # Note: If any fields above (e.g., actions_effectuees) don't match your Intervention model,
                            # share modeles/intervention.py to adjust
                        )
                        db.session.add(intervention)
                        interventions_crees += 1
            
            if interventions_crees > 0:
                db.session.commit()
                print(f"{interventions_crees} interventions créées avec succès")
        else:
            print("Patients, dispositifs ou techniciens manquants - impossible de créer les interventions")
        
        # Résumé final
        print("\n=== RÉSUMÉ DE L'INITIALISATION ===")
        print(f"Prescripteurs: {Prescripteur.query.count()}")
        print(f"Utilisateurs: {Utilisateur.query.count()}")
        print(f"Patients: {Patient.query.count()}")
        print(f"Dispositifs médicaux: {DispositifMedical.query.count()}")
        print(f"Interventions: {Intervention.query.count()}")
        
        # Statistiques des dispositifs par type
        print("\n=== RÉPARTITION DES DISPOSITIFS ===")
        types_stats = db.session.query(
            DispositifMedical.type_acquisition,
            db.func.count(DispositifMedical.id)
        ).group_by(DispositifMedical.type_acquisition).all()
        
        for type_acq, count in types_stats:
            print(f"{type_acq}: {count}")
        
        # Statistiques des dispositifs par statut
        print("\n=== RÉPARTITION PAR STATUT ===")
        statuts_stats = db.session.query(
            DispositifMedical.statut,
            db.func.count(DispositifMedical.id)
        ).group_by(DispositifMedical.statut).all()
        
        for statut, count in statuts_stats:
            print(f"{statut}: {count}")
        
        # Statistiques des interventions par type
        print("\n=== RÉPARTITION DES INTERVENTIONS ===")
        interventions_stats = db.session.query(
            Intervention.type_intervention,
            db.func.count(Intervention.id)
        ).group_by(Intervention.type_intervention).all()
        
        for type_intervention, count in interventions_stats:
            print(f"{type_intervention}: {count}")
        
        # Statistiques des interventions par planifiee
        print("\n=== RÉPARTITION DES INTERVENTIONS PAR PLANIFIÉE ===")
        interventions_planifiee_stats = db.session.query(
            Intervention.planifiee,
            db.func.count(Intervention.id)
        ).group_by(Intervention.planifiee).all()
        
        for planifiee, count in interventions_planifiee_stats:
            print(f"{'Planifiée' if planifiee else 'Non planifiée'}: {count}")

if __name__ == '__main__':
    init_db()