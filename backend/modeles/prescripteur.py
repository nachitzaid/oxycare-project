from extensions.base_donnees import db
from .base import ModeleBase

class Prescripteur(ModeleBase):
    """Modèle pour la table des prescripteurs (médecins)"""
    __tablename__ = 'prescripteurs'
    
    nom = db.Column(db.String(64))
    prenom = db.Column(db.String(64))
    specialite = db.Column(db.String(64))
    telephone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    
    # Relations
    patients = db.relationship('Patient', backref='prescripteur', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prenom': self.prenom,
            'specialite': self.specialite,
            'telephone': self.telephone,
            'email': self.email,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }
