from extensions.base_donnees import db
from .base import ModeleBase

class Prescripteur(ModeleBase):
    """Modèle pour la table des prescripteurs (médecins)"""
    __tablename__ = 'prescripteurs'
    
    nom = db.Column(db.String(64), nullable=False)
    prenom = db.Column(db.String(64), nullable=False)
    specialite = db.Column(db.String(64))
    telephone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    
    # Pas de relation ici pour éviter les conflits - elle est définie dans Patient
    
    def to_dict(self):
        """Convertit l'objet Prescripteur en dictionnaire"""
        return {
            'id': self.id,
            'nom': self.nom,
            'prenom': self.prenom,
            'specialite': self.specialite,
            'telephone': self.telephone,
            'email': self.email,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None,
            'date_modification': self.date_modification.isoformat() if self.date_modification else None
        }
    
    def __repr__(self):
        return f'<Prescripteur {self.prenom} {self.nom}>'