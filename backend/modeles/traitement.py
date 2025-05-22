from extensions.base_donnees import db
from .base import ModeleBase

class Traitement(ModeleBase):
    """Modèle pour la table des traitements"""
    __tablename__ = 'traitements'
    
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    # Type de schéma: 'oxygenotherapie', 'ventilation', 'ppc', 'polygraphie', 'polysomnographie'
    type_schema = db.Column(db.String(20), nullable=False)
    date_debut = db.Column(db.Date)
    date_fin = db.Column(db.Date, nullable=True)
    commentaire = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'type_schema': self.type_schema,
            'date_debut': self.date_debut.isoformat() if self.date_debut else None,
            'date_fin': self.date_fin.isoformat() if self.date_fin else None,
            'commentaire': self.commentaire,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }