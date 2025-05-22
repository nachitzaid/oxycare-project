from marshmallow import Schema, fields, validate, validates, ValidationError

class SchemaUtilisateur(Schema):
    """Schéma pour la validation et la sérialisation des utilisateurs"""
    
    id = fields.Int(dump_only=True)
    nom_utilisateur = fields.Str(required=True, validate=validate.Length(min=3, max=64))
    email = fields.Email(required=True)
    mot_de_passe = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))
    nom = fields.Str(required=True, validate=validate.Length(min=2, max=64))
    prenom = fields.Str(required=True, validate=validate.Length(min=2, max=64))
    role = fields.Str(validate=validate.OneOf(['admin', 'technicien']))
    est_actif = fields.Bool()
    date_creation = fields.DateTime(dump_only=True)
    date_modification = fields.DateTime(dump_only=True)
    
    @validates('nom_utilisateur')
    def validate_nom_utilisateur(self, value):
        # Validation supplémentaire si nécessaire
        if ' ' in value:
            raise ValidationError("Le nom d'utilisateur ne peut pas contenir d'espaces")