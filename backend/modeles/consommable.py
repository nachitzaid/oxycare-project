from extensions.base_donnees import db
from .base import ModeleBase

class Consommable(ModeleBase):
    """Modèle pour la table des consommables"""
    __tablename__ = 'consommables'
    
    dispositif_id = db.Column(db.Integer, db.ForeignKey('dispositifs_medicaux.id'), nullable=False)
    designation = db.Column(db.String(100))
    reference = db.Column(db.String(50))
    numero_lot = db.Column(db.String(50))
    date_peremption = db.Column(db.Date, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'dispositif_id': self.dispositif_id,
            'designation': self.designation,
            'reference': self.reference,
            'numero_lot': self.numero_lot,
            'date_peremption': self.date_peremption.isoformat() if self.date_peremption else None,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }