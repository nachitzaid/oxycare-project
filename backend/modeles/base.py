from datetime import datetime
from extensions.base_donnees import db

class ModeleBase(db.Model):
    """Modèle de base avec des fonctionnalités communes"""
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def enregistrer(self):
        """Enregistrer l'instance en base de données"""
        db.session.add(self)
        db.session.commit()
        
    def supprimer(self):
        """Supprimer l'instance de la base de données"""
        db.session.delete(self)
        db.session.commit()