from werkzeug.security import generate_password_hash, check_password_hash
from extensions.base_donnees import db
from .base import ModeleBase

class Utilisateur(ModeleBase):
    """Modèle pour la table des utilisateurs"""
    __tablename__ = 'utilisateurs'
    
    nom_utilisateur = db.Column(db.String(64), unique=True, index=True)
    email = db.Column(db.String(120), unique=True, index=True)
    mot_de_passe_hash = db.Column(db.String(512))
    nom = db.Column(db.String(64))
    prenom = db.Column(db.String(64))
    role = db.Column(db.String(20), default='technicien')  # 'admin' ou 'technicien'
    est_actif = db.Column(db.Boolean, default=True)
    
    # Relations
    fiches_controle = db.relationship('FicheControle', backref='technicien', lazy='dynamic')
    bons_entree = db.relationship('BonEntree', backref='admin', lazy='dynamic')
    bons_sortie = db.relationship('BonSortie', backref='technicien', lazy='dynamic')
    interventions = db.relationship('Intervention', backref='technicien', lazy='dynamic')
    
    @property
    def mot_de_passe(self):
        raise AttributeError('Le mot de passe n\'est pas un attribut lisible')
    
    @mot_de_passe.setter
    def mot_de_passe(self, mot_de_passe):
        self.mot_de_passe_hash = generate_password_hash(mot_de_passe)
    
    def verifier_mot_de_passe(self, mot_de_passe):
        return check_password_hash(self.mot_de_passe_hash, mot_de_passe)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom_utilisateur': self.nom_utilisateur,
            'email': self.email,
            'nom': self.nom,
            'prenom': self.prenom,
            'role': self.role,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None,
            'est_actif': self.est_actif
        }