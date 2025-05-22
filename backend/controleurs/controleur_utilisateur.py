from typing import Dict, Any, Tuple
from flask import request
from modeles.utilisateur import Utilisateur
from schemas.schema_utilisateur import SchemaUtilisateur
from extensions.base_donnees import db

class ControleurUtilisateur:
    """Contrôleur pour les endpoints relatifs aux utilisateurs"""
    
    def __init__(self):
        self.schema_utilisateur = SchemaUtilisateur()
        self.schema_utilisateurs = SchemaUtilisateur(many=True)
    
    def obtenir_utilisateurs(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour récupérer tous les utilisateurs"""
        role = request.args.get('role', None)
        query = Utilisateur.query
        
        if role:
            query = query.filter(Utilisateur.role == role)
            
        utilisateurs = query.all()
        
        return {
            'success': True,
            'data': self.schema_utilisateurs.dump(utilisateurs)
        }, 200
    
    def obtenir_utilisateur(self, utilisateur_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour récupérer un utilisateur par son ID"""
        utilisateur = Utilisateur.query.get(utilisateur_id)
        
        if not utilisateur:
            return {
                'success': False,
                'message': 'Utilisateur non trouvé'
            }, 404
        
        return {
            'success': True,
            'data': self.schema_utilisateur.dump(utilisateur)
        }, 200