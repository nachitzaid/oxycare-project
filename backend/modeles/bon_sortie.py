from extensions.base_donnees import db
from .base import ModeleBase

class BonSortie(ModeleBase):
    """Modèle pour la table des bons de sortie atelier"""
    __tablename__ = 'bons_sortie'
    
    bon_entree_id = db.Column(db.Integer, db.ForeignKey('bons_entree.id'), nullable=False)
    technicien_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    
    date_sortie = db.Column(db.DateTime)
    travaux_effectues = db.Column(db.Text, nullable=True)
    etat_sortie = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'bon_entree_id': self.bon_entree_id,
            'technicien_id': self.technicien_id,
            'date_sortie': self.date_sortie.isoformat() if self.date_sortie else None,
            'travaux_effectues': self.travaux_effectues,
            'etat_sortie': self.etat_sortie,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None
        }