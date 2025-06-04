from datetime import datetime
from extensions.base_donnees import db
from .base import ModeleBase
from .reglage import Reglage

class Intervention(ModeleBase):
    """Modèle pour la table des interventions"""
    __tablename__ = 'interventions'
    
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    dispositif_id = db.Column(db.Integer, db.ForeignKey('dispositifs_medicaux.id'), nullable=False)
    technicien_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    
    # Relation avec le modèle Reglage
    reglage_id = db.Column(db.Integer, db.ForeignKey('reglages.id'), nullable=True)
    reglage = db.relationship('Reglage', backref='intervention', uselist=False)
    
    # Traitement et type d'intervention
    traitement = db.Column(db.String(50), nullable=True)  # Oxygénothérapie, Ventilation, PPC, Polygraphie, Polysomnographie
    type_intervention = db.Column(db.String(50), nullable=False)  # Installation, Réglage, Entretien, etc.
    
    # Dates et planification
    date_planifiee = db.Column(db.DateTime, nullable=False)
    date_reelle = db.Column(db.DateTime, nullable=True)
    lieu = db.Column(db.String(200), nullable=True)
    
    # État et détails
    etat_materiel = db.Column(db.String(20), nullable=True)  # Fonctionnel, Défaut, À remplacer
    type_concentrateur = db.Column(db.String(20), nullable=True)  # Fixe, Portable (pour Oxygénothérapie)
    mode_ventilation = db.Column(db.String(20), nullable=True)  # Auto, Manuel (pour PPC/Ventilation)
    type_masque = db.Column(db.String(20), nullable=True)  # Nasal, Facial, Narinaire (pour PPC/Ventilation)
    
    # Statut de l'intervention
    statut = db.Column(db.String(20), nullable=False, default='planifiee')  # planifiee, en_cours, terminee, patient_absent, annulee, reportee, partielle
    
    # Détails de l'intervention
    actions_effectuees = db.Column(db.JSON, nullable=True)
    accessoires_utilises = db.Column(db.JSON, nullable=True)
    photos = db.Column(db.JSON, nullable=True)  # Liste des URLs des photos
    signature_technicien = db.Column(db.Text, nullable=True)  # Signature encodée en base64
    rapport_pdf_url = db.Column(db.String(200), nullable=True)
    
    # Paramètres spécifiques par type de traitement
    parametres = db.Column(db.JSON, nullable=True)  # Paramètres de l'intervention
    
    # Commentaires et remarques
    remarques = db.Column(db.Text, nullable=True)
    motif_annulation = db.Column(db.String(100), nullable=True)  # Pour les interventions annulées
    date_reprogrammation = db.Column(db.DateTime, nullable=True)  # Pour les interventions reportées
    
    # Nouveaux champs pour les détails techniques
    verification_securite = db.Column(db.JSON, nullable=True)  # Vérifications de sécurité effectuées
    tests_effectues = db.Column(db.JSON, nullable=True)  # Tests effectués pendant l'intervention
    consommables_utilises = db.Column(db.JSON, nullable=True)  # Liste des consommables utilisés
    maintenance_preventive = db.Column(db.Boolean, default=False)  # Indique si une maintenance préventive a été effectuée
    date_prochaine_maintenance = db.Column(db.DateTime, nullable=True)  # Date de la prochaine maintenance prévue
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'dispositif_id': self.dispositif_id,
            'technicien_id': self.technicien_id,
            'traitement': self.traitement,
            'type_intervention': self.type_intervention,
            'date_planifiee': self.date_planifiee.isoformat() if self.date_planifiee else None,
            'date_reelle': self.date_reelle.isoformat() if self.date_reelle else None,
            'lieu': self.lieu,
            'etat_materiel': self.etat_materiel,
            'type_concentrateur': self.type_concentrateur,
            'mode_ventilation': self.mode_ventilation,
            'type_masque': self.type_masque,
            'statut': self.statut,
            'actions_effectuees': self.actions_effectuees,
            'accessoires_utilises': self.accessoires_utilises,
            'photos': self.photos,
            'signature_technicien': self.signature_technicien,
            'rapport_pdf_url': self.rapport_pdf_url,
            'remarques': self.remarques,
            'motif_annulation': self.motif_annulation,
            'date_reprogrammation': self.date_reprogrammation.isoformat() if self.date_reprogrammation else None,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None,
            'date_modification': self.date_modification.isoformat() if self.date_modification else None,
            'parametres': self.parametres,
            'reglage': self.reglage.to_dict() if self.reglage else None,
            'verification_securite': self.verification_securite,
            'tests_effectues': self.tests_effectues,
            'consommables_utilises': self.consommables_utilises,
            'maintenance_preventive': self.maintenance_preventive,
            'date_prochaine_maintenance': self.date_prochaine_maintenance.isoformat() if self.date_prochaine_maintenance else None
        }