from datetime import datetime
from extensions.base_donnees import db
from .base import ModeleBase

class DispositifMedical(ModeleBase):
    """Modèle pour la table des dispositifs médicaux"""
    __tablename__ = 'dispositifs_medicaux'
    
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    designation = db.Column(db.String(100))
    reference = db.Column(db.String(50))
    numero_serie = db.Column(db.String(50), unique=True, index=True)
    
    # Type d'acquisition: 'location', 'achat_garantie', 'achat_externe', 'achat_oxylife'
    type_acquisition = db.Column(db.String(20), nullable=False)
    
    date_acquisition = db.Column(db.Date)
    date_fin_garantie = db.Column(db.Date, nullable=True)
    duree_location = db.Column(db.Integer, nullable=True)  # en mois
    date_fin_location = db.Column(db.Date, nullable=True)
    statut = db.Column(db.String(20), default='actif')  # 'actif', 'en_maintenance', 'retiré'
    
    # Relations
    accessoires = db.relationship('Accessoire', backref='dispositif', lazy='dynamic')
    consommables = db.relationship('Consommable', backref='dispositif', lazy='dynamic')
    reglages = db.relationship('Reglage', backref='dispositif', lazy='dynamic')
    fiches_controle = db.relationship('FicheControle', backref='dispositif', lazy='dynamic')
    interventions = db.relationship('Intervention', backref='dispositif', lazy='dynamic')
    
    def est_sous_garantie(self):
        """Vérifie si le dispositif est sous garantie"""
        if self.type_acquisition == 'achat_garantie' and self.date_fin_garantie:
            return self.date_fin_garantie >= datetime.utcnow().date()
        return False
    
    def est_location_active(self):
        """Vérifie si la location est active"""
        if self.type_acquisition == 'location' and self.date_fin_location:
            return self.date_fin_location >= datetime.utcnow().date()
        return False
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'designation': self.designation,
            'reference': self.reference,
            'numero_serie': self.numero_serie,
            'type_acquisition': self.type_acquisition,
            'date_acquisition': self.date_acquisition.isoformat() if self.date_acquisition else None,
            'date_fin_garantie': self.date_fin_garantie.isoformat() if self.date_fin_garantie else None,
            'duree_location': self.duree_location,
            'date_fin_location': self.date_fin_location.isoformat() if self.date_fin_location else None,
            'statut': self.statut,
            'est_sous_garantie': self.est_sous_garantie(),
            'est_location_active': self.est_location_active()
        }