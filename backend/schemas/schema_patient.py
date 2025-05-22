from marshmallow import Schema, fields, validate

class SchemaPatient(Schema):
    """Schéma pour la validation et la sérialisation des patients"""
    
    id = fields.Int(dump_only=True)
    code_patient = fields.Str(dump_only=True)
    nom = fields.Str(required=True, validate=validate.Length(min=2, max=64))
    prenom = fields.Str(required=True, validate=validate.Length(min=2, max=64))
    cin = fields.Str(validate=validate.Length(max=20))
    date_naissance = fields.Date(required=True)
    telephone = fields.Str(required=True, validate=validate.Length(min=8, max=20))
    email = fields.Email(allow_none=True)
    adresse = fields.Str(validate=validate.Length(max=200))
    ville = fields.Str(validate=validate.Length(max=64))
    mutuelle = fields.Str(validate=validate.Length(max=50))
    prescripteur_nom = fields.Str(validate=validate.Length(max=100))
    technicien_id = fields.Int(allow_none=True)
    date_creation = fields.DateTime(dump_only=True)
    date_modification = fields.DateTime(dump_only=True)