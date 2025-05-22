from typing import Dict, Any, Tuple
from flask import request, jsonify
from services.service_auth import ServiceAuth
from schemas.schema_utilisateur import SchemaUtilisateur

class ControleurAuth:
    """Contrôleur pour les endpoints relatifs à l'authentification"""
    
    def __init__(self):
        self.service_auth = ServiceAuth()
        self.schema_utilisateur = SchemaUtilisateur()
    
    def enregistrer(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour enregistrer un nouvel utilisateur"""
        donnees = request.get_json()
        
        # Validation des données
        erreurs = self.schema_utilisateur.validate(donnees)
        if erreurs:
            return {'message': 'Données invalides', 'erreurs': erreurs}, 400
        
        try:
            utilisateur, access_token, refresh_token = self.service_auth.enregistrer(donnees)
            
            return {
                'message': 'Utilisateur créé avec succès',
                'utilisateur': self.schema_utilisateur.dump(utilisateur),
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 201
        
        except ValueError as e:
            return {'message': str(e)}, 400
        
        except Exception as e:
            return {'message': f'Erreur lors de la création de l\'utilisateur: {str(e)}'}, 500
    
    def connexion(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour connecter un utilisateur existant"""
        donnees = request.get_json()
        
        # Vérifier les données requises
        if not donnees.get('nom_utilisateur') or not donnees.get('mot_de_passe'):
            return {'message': 'Nom d\'utilisateur et mot de passe requis'}, 400
        
        # Connecter l'utilisateur
        utilisateur, access_token, refresh_token = self.service_auth.connexion(
            donnees.get('nom_utilisateur'),
            donnees.get('mot_de_passe')
        )
        
        if not utilisateur:
            return {'message': 'Nom d\'utilisateur ou mot de passe incorrect'}, 401
        
        if not access_token:
            return {'message': 'Ce compte est désactivé'}, 401
        
        return {
            'message': 'Connexion réussie',
            'utilisateur': self.schema_utilisateur.dump(utilisateur),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 200
    
    def rafraichir_token(self, utilisateur_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour rafraîchir le token d'accès"""
        access_token = self.service_auth.rafraichir_token(utilisateur_id)
        
        if not access_token:
            return {'message': 'Utilisateur non trouvé ou désactivé'}, 401
        
        return {
            'access_token': access_token
        }, 200
    
    def obtenir_profil(self, utilisateur_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour récupérer le profil de l'utilisateur connecté"""
        utilisateur = self.service_auth.depot_utilisateur.obtenir_par_id(utilisateur_id)
        
        if not utilisateur:
            return {'message': 'Utilisateur non trouvé'}, 404
        
        return self.schema_utilisateur.dump(utilisateur), 200