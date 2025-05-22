from datetime import datetime
from extensions.base_donnees import db
from .base import ModeleBase

class Intervention(ModeleBase):
    """Modèle pour la table des interventions"""
    __tablename__ = 'interventions'
    
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    dispositif_id = db.Column(db.Integer, db.ForeignKey('dispositifs_medicaux.id'), nullable=False)
    technicien_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    
    # Type d'intervention: 'installation', 'controle', 'entretien', 'changement_filtre', etc.
    type_intervention = db.Column(db.String(50), nullable=False)
    planifiee = db.Column(db.Boolean, default=True)
    date_planifiee = db.Column(db.DateTime, nullable=True)
    date_reelle = db.Column(db.DateTime, default=datetime.utcnow)
    temps_prevu = db.Column(db.Integer)  # en minutes
    temps_reel = db.Column(db.Integer)  # en minutes
    
    # Actions effectuées: stockées en JSON
    actions_effectuees = db.Column(db.JSON, nullable=True)
    
    # Satisfaction et signatures
    satisfaction_technicien = db.Column(db.Integer, nullable=True)  # 1-5
    signature_patient = db.Column(db.Boolean, default=False)
    signature_responsable = db.Column(db.Boolean, default=False)
    commentaire = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'dispositif_id': self.dispositif_id,
            'technicien_id': self.technicien_id,
            'type_intervention': self.type_intervention,
            'planifiee': self.planifiee,
            'date_planifiee': self.date_planifiee.isoformat() if self.date_planifiee else None,
            'date_reelle': self.date_reelle.isoformat() if self.date_reelle else None,
            'temps_prevu': self.temps_prevu,
            'temps_reel': self.temps_reel,
            'actions_effectuees': self.actions_effectuees,
            'satisfaction_technicien': self.satisfaction_technicien,
            'signature_patient': self.signature_patient,
            'signature_responsable': self.signature_responsable,
            'commentaire': self.commentaire,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }