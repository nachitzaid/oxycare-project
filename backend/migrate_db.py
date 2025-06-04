from app import creer_app
from extensions.base_donnees import db
from modeles.reglage import Reglage
from sqlalchemy import text

app = creer_app()

def upgrade_database():
    with app.app_context():
        # Ajouter les colonnes HU et RE si elles n'existent pas
        try:
            # Vérifier si les colonnes existent déjà
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('reglages')]
            
            if 'hu' not in columns:
                with db.engine.connect() as conn:
                    conn.execute(text('ALTER TABLE reglages ADD COLUMN hu FLOAT'))
                    conn.commit()
                print("Colonne 'hu' ajoutée avec succès")
            
            if 're' not in columns:
                with db.engine.connect() as conn:
                    conn.execute(text('ALTER TABLE reglages ADD COLUMN re FLOAT'))
                    conn.commit()
                print("Colonne 're' ajoutée avec succès")
                
            print("Migration terminée avec succès")
        except Exception as e:
            print(f"Erreur lors de la migration : {str(e)}")

def migrate():
    app = creer_app()
    with app.app_context():
        # Ajouter la colonne reglage_id
        db.session.execute("""
            ALTER TABLE interventions
            ADD COLUMN reglage_id INTEGER,
            ADD CONSTRAINT fk_intervention_reglage
            FOREIGN KEY (reglage_id)
            REFERENCES reglages(id)
            ON DELETE SET NULL
        """)
        db.session.commit()

if __name__ == '__main__':
    upgrade_database()
    migrate() 