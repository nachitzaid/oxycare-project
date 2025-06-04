from marshmallow import Schema, fields, validates, ValidationError, post_load
from datetime import datetime

class InterventionSchema(Schema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    dispositif_id = fields.Int(required=True)
    technicien_id = fields.Int(required=True)
    
    # Traitement et type d'intervention
    traitement = fields.Str(required=False, validate=lambda x: x in [
        'Oxygénothérapie',
        'Ventilation',
        'PPC',
        'Polygraphie',
        'Polysomnographie'
    ] if x else True)
    
    type_intervention = fields.Str(required=True)
    
    # Dates et planification
    date_planifiee = fields.DateTime(required=True)
    date_reelle = fields.DateTime(allow_none=True)
    lieu = fields.Str(required=True)
    
    # État et détails
    etat_materiel = fields.Str(allow_none=True, validate=lambda x: x in [
        'Fonctionnel',
        'Défaut',
        'À remplacer'
    ] if x else True)
    
    type_concentrateur = fields.Str(allow_none=True, validate=lambda x: x in [
        'Fixe',
        'Portable'
    ] if x else True)
    
    mode_ventilation = fields.Str(allow_none=True, validate=lambda x: x in [
        'Auto',
        'Manuel'
    ] if x else True)
    
    type_masque = fields.Str(allow_none=True, validate=lambda x: x in [
        'Nasal',
        'Facial',
        'Narinaire'
    ] if x else True)
    
    # Statut de l'intervention
    statut = fields.Str(required=True, validate=lambda x: x in [
        'planifiee',
        'en_cours',
        'terminee',
        'patient_absent',
        'annulee',
        'reportee',
        'partielle'
    ])
    
    # Détails de l'intervention
    actions_effectuees = fields.Dict(allow_none=True)
    accessoires_utilises = fields.Dict(allow_none=True)
    photos = fields.List(fields.Str(), allow_none=True)
    signature_technicien = fields.Str(allow_none=True)
    rapport_pdf_url = fields.Str(allow_none=True)
    
    # Commentaires et remarques
    remarques = fields.Str(allow_none=True)
    motif_annulation = fields.Str(allow_none=True)
    date_reprogrammation = fields.DateTime(allow_none=True)
    
    # Dates système
    date_creation = fields.DateTime(dump_only=True)
    date_modification = fields.DateTime(dump_only=True)
    
    @validates('type_intervention')
    def validate_type_intervention(self, value):
        """Valide le type d'intervention en fonction du traitement"""
        traitement = self.context.get('traitement')
        if not traitement:
            return
            
        types_valides = {
            'Oxygénothérapie': [
                'Installation', 'Réglage', 'Entretien', 'Remplacement',
                'Contrôle', 'Changement de paramètres', 'Ajustement masque',
                'Tirage de rapport'
            ],
            'Ventilation': [
                'Installation', 'Réglage', 'Entretien', 'Contrôle',
                'Changement de paramètres', 'Ajustement masque',
                'Tirage de rapport'
            ],
            'PPC': [
                'Installation', 'Réglage', 'Remplacement', 'Entretien',
                'Contrôle', 'Changement de paramètres', 'Ajustement masque',
                'Tirage de rapport'
            ],
            'Polygraphie': ['Installation', 'Désinstallation'],
            'Polysomnographie': ['Installation', 'Désinstallation']
        }
        
        if value not in types_valides.get(traitement, []):
            raise ValidationError(f"Type d'intervention invalide pour le traitement {traitement}")
    
    @validates('type_concentrateur')
    def validate_type_concentrateur(self, value):
        """Valide le type de concentrateur pour l'oxygénothérapie"""
        if value and self.context.get('traitement') != 'Oxygénothérapie':
            raise ValidationError("Le type de concentrateur n'est valide que pour l'oxygénothérapie")
    
    @validates('mode_ventilation')
    def validate_mode_ventilation(self, value):
        """Valide le mode de ventilation pour PPC/Ventilation"""
        if value and self.context.get('traitement') not in ['PPC', 'Ventilation']:
            raise ValidationError("Le mode de ventilation n'est valide que pour PPC ou Ventilation")
    
    @validates('type_masque')
    def validate_type_masque(self, value):
        """Valide le type de masque pour PPC/Ventilation"""
        if value and self.context.get('traitement') not in ['PPC', 'Ventilation']:
            raise ValidationError("Le type de masque n'est valide que pour PPC ou Ventilation")
    
    @validates('motif_annulation')
    def validate_motif_annulation(self, value):
        """Valide le motif d'annulation"""
        if value and self.context.get('statut') != 'annulee':
            raise ValidationError("Le motif d'annulation n'est valide que pour une intervention annulée")
    
    @validates('date_reprogrammation')
    def validate_date_reprogrammation(self, value):
        """Valide la date de reprogrammation"""
        if value and self.context.get('statut') != 'reportee':
            raise ValidationError("La date de reprogrammation n'est valide que pour une intervention reportée")
        if value and value < datetime.utcnow():
            raise ValidationError("La date de reprogrammation doit être dans le futur")
    
    @post_load
    def make_intervention(self, data, **kwargs):
        """Crée une instance d'intervention après validation"""
        from modeles.intervention import Intervention
        return Intervention(**data) 