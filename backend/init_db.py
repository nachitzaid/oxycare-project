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
                'date_naissance': date(1950, 5, 15),
                'telephone': '+212600111001',
                'email': 'ahmed.bennani@email.com',
                'adresse': '123 Rue Mohammed V, Casablanca'
            },
            {
                'code_patient': 'P002',
                'nom': 'Alami',
                'prenom': 'Fatima',
                'date_naissance': date(1965, 8, 22),
                'telephone': '+212600111002',
                'email': 'fatima.alami@email.com',
                'adresse': '456 Avenue Hassan II, Rabat'
            },
            {
                'code_patient': 'P003',
                'nom': 'Tazi',
                'prenom': 'Mohamed',
                'date_naissance': date(1955, 12, 3),
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
        
        # Résumé final
        print("\n=== RÉSUMÉ DE L'INITIALISATION ===")
        print(f"Prescripteurs: {Prescripteur.query.count()}")
        print(f"Utilisateurs: {Utilisateur.query.count()}")
        print(f"Patients: {Patient.query.count()}")
        print(f"Dispositifs médicaux: {DispositifMedical.query.count()}")
        
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

if __name__ == '__main__':
    init_db()