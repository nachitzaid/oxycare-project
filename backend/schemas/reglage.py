from marshmallow import Schema, fields, validates, ValidationError, post_load

class ReglageSchema(Schema):
    id = fields.Int(dump_only=True)
    dispositif_id = fields.Int(required=True)
    
    # Paramètres de pression
    pmax = fields.Float(allow_none=True)
    pmin = fields.Float(allow_none=True)
    pramp = fields.Float(allow_none=True)
    
    # Nouveaux paramètres
    hu = fields.Float(allow_none=True)  # Humidité
    re = fields.Float(allow_none=True)  # Réserve d'expiration
    
    # Commentaires
    commentaire = fields.Str(allow_none=True)
    
    # Dates système
    date_creation = fields.DateTime(dump_only=True)
    date_modification = fields.DateTime(dump_only=True)
    
    @validates('pmax')
    def validate_pmax(self, value):
        """Valide la pression maximale"""
        if value is not None and value < 0:
            raise ValidationError("La pression maximale ne peut pas être négative")
    
    @validates('pmin')
    def validate_pmin(self, value):
        """Valide la pression minimale"""
        if value is not None and value < 0:
            raise ValidationError("La pression minimale ne peut pas être négative")
    
    @validates('pramp')
    def validate_pramp(self, value):
        """Valide la pression de rampe"""
        if value is not None and value < 0:
            raise ValidationError("La pression de rampe ne peut pas être négative")
    
    @validates('hu')
    def validate_hu(self, value):
        """Valide l'humidité"""
        if value is not None and (value < 0 or value > 5):
            raise ValidationError("L'humidité doit être comprise entre 0 et 5")
    
    @validates('re')
    def validate_re(self, value):
        """Valide la réserve d'expiration"""
        if value is not None and (value < 0 or value > 3):
            raise ValidationError("La réserve d'expiration doit être comprise entre 0 et 3")
    
    @post_load
    def make_reglage(self, data, **kwargs):
        """Crée une instance de réglage après validation"""
        from modeles.reglage import Reglage
        return Reglage(**data) 