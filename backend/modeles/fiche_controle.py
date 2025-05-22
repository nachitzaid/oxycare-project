from extensions.base_donnees import db
from .base import ModeleBase

class FicheControle(ModeleBase):
    """Modèle pour la table des fiches de contrôle"""
    __tablename__ = 'fiches_controle'
    
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    dispositif_id = db.Column(db.Integer, db.ForeignKey('dispositifs_medicaux.id'), nullable=False)
    technicien_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    
    date_controle = db.Column(db.DateTime)
    observations = db.Column(db.Text, nullable=True)
    conforme = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'dispositif_id': self.dispositif_id,
            'technicien_id': self.technicien_id,
            'date_controle': self.date_controle.isoformat() if self.date_controle else None,
            'observations': self.observations,
            'conforme': self.conforme,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }