from marshmallow import Schema, fields, validate

class SchemaPrescripteur(Schema):
    """Schéma pour la validation et la sérialisation des prescripteurs"""
    
    id = fields.Int(dump_only=True)
    nom = fields.Str(required=True, validate=validate.Length(min=2, max=64))
    prenom = fields.Str(required=True, validate=validate.Length(min=2, max=64))
    specialite = fields.Str(required=True, validate=validate.Length(min=2, max=64))
    telephone = fields.Str(required=True, validate=validate.Length(min=8, max=20))
    email = fields.Email(allow_none=True)
    date_creation = fields.DateTime(dump_only=True)
    date_modification = fields.DateTime(dump_only=True)