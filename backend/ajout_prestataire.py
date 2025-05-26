# Script à exécuter pour ajouter des prescripteurs dans la base de données
# Vous pouvez l'ajouter comme une route temporaire dans votre application

from extensions.base_donnees import db
from modeles.prescripteur import Prescripteur

def ajouter_prescripteurs_exemples():
    """Ajoute quelques prescripteurs d'exemple dans la base de données"""
    
    prescripteurs_exemples = [
        {
            'nom': 'MARTIN',
            'prenom': 'Jean',
            'specialite': 'Cardiologie',
            'telephone': '0123456789',
            'email': 'jean.martin@hopital.fr'
        },
        {
            'nom': 'DUBOIS',
            'prenom': 'Marie',
            'specialite': 'Pneumologie',
            'telephone': '0123456790',
            'email': 'marie.dubois@clinique.fr'
        },
        {
            'nom': 'GARCIA',
            'prenom': 'Pierre',
            'specialite': 'Médecine générale',
            'telephone': '0123456791',
            'email': 'pierre.garcia@cabinet.fr'
        },
        {
            'nom': 'BERNARD',
            'prenom': 'Sophie',
            'specialite': 'Neurologie',
            'telephone': '0123456792',
            'email': 'sophie.bernard@hopital.fr'
        },
        {
            'nom': 'LEROY',
            'prenom': 'Antoine',
            'specialite': 'Orthopédie',
            'telephone': '0123456793',
            'email': 'antoine.leroy@clinique.fr'
        }
    ]
    
    try:
        for prescripteur_data in prescripteurs_exemples:
            # Vérifier si le prescripteur existe déjà
            existing = Prescripteur.query.filter_by(
                nom=prescripteur_data['nom'], 
                prenom=prescripteur_data['prenom']
            ).first()
            
            if not existing:
                nouveau_prescripteur = Prescripteur(**prescripteur_data)
                db.session.add(nouveau_prescripteur)
                print(f"Ajout du prescripteur: {prescripteur_data['prenom']} {prescripteur_data['nom']}")
            else:
                print(f"Prescripteur déjà existant: {prescripteur_data['prenom']} {prescripteur_data['nom']}")
        
        db.session.commit()
        print("Prescripteurs ajoutés avec succès!")
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"Erreur lors de l'ajout des prescripteurs: {str(e)}")
        return False

# Vous pouvez aussi ajouter cette route temporaire dans votre application
"""
@app.route('/api/debug/ajouter-prescripteurs', methods=['POST'])
def ajouter_prescripteurs():
    if ajouter_prescripteurs_exemples():
        return {'success': True, 'message': 'Prescripteurs ajoutés avec succès'}, 200
    else:
        return {'success': False, 'message': 'Erreur lors de l\'ajout des prescripteurs'}, 500
"""