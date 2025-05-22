"""
Script pour ajouter des patients de test
"""
from flask import Flask
from extensions.base_donnees import db
from modeles.patient import Patient
from datetime import date

def ajouter_patients_test():
    """Ajoute des patients de test dans la base de données"""
    print("Ajout de patients de test...")
    
    patients_test = [
        {
            'nom': 'Dupont',
            'prenom': 'Jean',
            'cin': 'AB123456',
            'date_naissance': date(1980, 5, 15),
            'telephone': '0612345678',
            'email': 'jean.dupont@email.com',
            'ville': 'Paris'
        },
        {
            'nom': 'Martin',
            'prenom': 'Marie',
            'cin': 'CD789012',
            'date_naissance': date(1975, 8, 22),
            'telephone': '0698765432',
            'email': 'marie.martin@email.com',
            'ville': 'Lyon'
        },
        {
            'nom': 'Bernard',
            'prenom': 'Pierre',
            'cin': 'EF345678',
            'date_naissance': date(1990, 12, 3),
            'telephone': '0654321098',
            'email': 'pierre.bernard@email.com',
            'ville': 'Marseille'
        }
    ]
    
    for patient_data in patients_test:
        # Vérifier si le patient existe déjà
        patient_existant = Patient.query.filter_by(cin=patient_data['cin']).first()
        if not patient_existant:
            patient = Patient(**patient_data)
            patient.generer_code_patient()
            db.session.add(patient)
            print(f"Patient ajouté: {patient.nom} {patient.prenom}")
    
    try:
        db.session.commit()
        print("Patients de test ajoutés avec succès!")
    except Exception as e:
        db.session.rollback()
        print(f"Erreur lors de l'ajout des patients: {e}")

if __name__ == "__main__":
    from app import creer_app
    
    app = creer_app()
    with app.app_context():
        # Créer toutes les tables
        db.create_all()
        
        # Ajouter les patients de test
        ajouter_patients_test()