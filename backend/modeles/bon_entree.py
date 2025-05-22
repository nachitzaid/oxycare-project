from extensions.base_donnees import db
from .base import ModeleBase

class BonEntree(ModeleBase):
    """Modèle pour la table des bons d'entrée atelier"""
    __tablename__ = 'bons_entree'
    
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    dispositif_id = db.Column(db.Integer, db.ForeignKey('dispositifs_medicaux.id'), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    
    date_entree = db.Column(db.DateTime)
    motif_entree = db.Column(db.Text, nullable=True)
    etat_reception = db.Column(db.Text, nullable=True)
    
    # Relations
    bons_sortie = db.relationship('BonSortie', backref='bon_entree', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'dispositif_id': self.dispositif_id,
            'admin_id': self.admin_id,
            'date_entree': self.date_entree.isoformat() if self.date_entree else None,
            'motif_entree': self.motif_entree,
            'etat_reception': self.etat_reception,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }