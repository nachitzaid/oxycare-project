from datetime import datetime
from extensions.base_donnees import db
from .base import ModeleBase

class Patient(ModeleBase):
    """Modèle pour la table des patients"""
    __tablename__ = 'patients'
    
    code_patient = db.Column(db.String(20), unique=True, index=True)
    nom = db.Column(db.String(64))
    prenom = db.Column(db.String(64))
    cin = db.Column(db.String(20))
    date_naissance = db.Column(db.Date)
    telephone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    adresse = db.Column(db.String(200))
    ville = db.Column(db.String(64))
    mutuelle = db.Column(db.String(50))
    
    # Clés étrangères
    prescripteur_id = db.Column(db.Integer, db.ForeignKey('prescripteurs.id'), nullable=True)
    technicien_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=True)
    
    # Relations
    dispositifs = db.relationship('DispositifMedical', backref='patient', lazy='dynamic')
    traitements = db.relationship('Traitement', backref='patient', lazy='dynamic')
    fiches_controle = db.relationship('FicheControle', backref='patient', lazy='dynamic')
    interventions = db.relationship('Intervention', backref='patient', lazy='dynamic')
    
    def generer_code_patient(self):
        """Génère un code patient unique basé sur les initiales et un timestamp"""
        if not self.code_patient and self.nom and self.prenom:
            initiales = self.nom[0].upper() + self.prenom[0].upper()
            timestamp = datetime.utcnow().strftime('%Y%m%d%H%M')
            self.code_patient = f"P{initiales}{timestamp}"
        return self.code_patient
    
    def to_dict(self):
        # Gestion sécurisée de la relation prescripteur
        prescripteur_nom = None
        try:
            if self.prescripteur_id and hasattr(self, 'prescripteur') and self.prescripteur:
                prescripteur_nom = f"{self.prescripteur.nom} {self.prescripteur.prenom}"
        except Exception:
            # En cas d'erreur lors du chargement de la relation
            prescripteur_nom = None
        
        return {
            'id': self.id,
            'code_patient': self.code_patient,
            'nom': self.nom,
            'prenom': self.prenom,
            'cin': self.cin,
            'date_naissance': self.date_naissance.isoformat() if self.date_naissance else None,
            'telephone': self.telephone,
            'email': self.email,
            'adresse': self.adresse,
            'ville': self.ville,
            'mutuelle': self.mutuelle,
            'prescripteur_id': self.prescripteur_id,
            'prescripteur_nom': prescripteur_nom,
            'technicien_id': self.technicien_id,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }
