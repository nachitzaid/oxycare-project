from extensions.base_donnees import db
from modeles.intervention import Intervention

def upgrade():
    """Ajouter les colonnes reglage et parametres à la table interventions"""
    try:
        # Ajouter les colonnes
        db.engine.execute('ALTER TABLE interventions ADD COLUMN reglage JSON')
        db.engine.execute('ALTER TABLE interventions ADD COLUMN parametres JSON')
        print("Colonnes reglage et parametres ajoutées avec succès")
    except Exception as e:
        print(f"Erreur lors de l'ajout des colonnes: {str(e)}")
        raise e

def downgrade():
    """Supprimer les colonnes reglage et parametres de la table interventions"""
    try:
        # Supprimer les colonnes
        db.engine.execute('ALTER TABLE interventions DROP COLUMN reglage')
        db.engine.execute('ALTER TABLE interventions DROP COLUMN parametres')
        print("Colonnes reglage et parametres supprimées avec succès")
    except Exception as e:
        print(f"Erreur lors de la suppression des colonnes: {str(e)}")
        raise e

if __name__ == '__main__':
    upgrade() 