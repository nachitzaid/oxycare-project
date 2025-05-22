# init_db.py
from app import creer_app
from extensions.base_donnees import db
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
        
        # Vérifier si des données de test existent déjà
        if not (Prescripteur.query.first() or Utilisateur.query.first()):
            print("Aucune donnée trouvée dans la base - initialisation complète effectuée")
        else:
            print("La base de données contient déjà des données - vérification des enregistrements effectuée")

if __name__ == '__main__':
    init_db()