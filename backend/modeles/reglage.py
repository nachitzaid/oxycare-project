from extensions.base_donnees import db
from .base import ModeleBase

class Reglage(ModeleBase):
    """Modèle pour la table des réglages"""
    __tablename__ = 'reglages'
    
    dispositif_id = db.Column(db.Integer, db.ForeignKey('dispositifs_medicaux.id'), nullable=False)
    pmax = db.Column(db.Float)
    pmin = db.Column(db.Float)
    pramp = db.Column(db.Float)
    hu = db.Column(db.Float)  # Humidité
    re = db.Column(db.Float)  # Réserve d'expiration
    commentaire = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'dispositif_id': self.dispositif_id,
            'pmax': self.pmax,
            'pmin': self.pmin,
            'pramp': self.pramp,
            'hu': self.hu,
            're': self.re,
            'commentaire': self.commentaire,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }