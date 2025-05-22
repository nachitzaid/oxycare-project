from typing import Dict, Any, Optional, Tuple
from flask_jwt_extended import create_access_token, create_refresh_token
from depots.depot_utilisateur import DepotUtilisateur
from modeles.utilisateur import Utilisateur

class ServiceAuth:
    """Service pour la gestion de l'authentification"""
    
    def __init__(self):
        self.depot_utilisateur = DepotUtilisateur()
    
    def enregistrer(self, donnees: Dict[str, Any]) -> Tuple[Utilisateur, str, str]:
        """Enregistre un nouvel utilisateur et génère des tokens"""
        # Vérifier si l'utilisateur existe déjà
        if self.depot_utilisateur.obtenir_par_nom_utilisateur(donnees.get('nom_utilisateur')):
            raise ValueError("Ce nom d'utilisateur existe déjà")
        
        if self.depot_utilisateur.obtenir_par_email(donnees.get('email')):
            raise ValueError("Cet email existe déjà")
        
        # Créer l'utilisateur
        utilisateur = Utilisateur(
            nom_utilisateur=donnees.get('nom_utilisateur'),
            email=donnees.get('email'),
            nom=donnees.get('nom'),
            prenom=donnees.get('prenom'),
            role=donnees.get('role', 'technicien')
        )
        utilisateur.mot_de_passe = donnees.get('mot_de_passe')
        
        # Sauvegarder l'utilisateur
        self.depot_utilisateur.creer(utilisateur.__dict__)
        
        # Générer des tokens
        access_token = create_access_token(identity=utilisateur.id)
        refresh_token = create_refresh_token(identity=utilisateur.id)
        
        return utilisateur, access_token, refresh_token
    
    def connexion(self, nom_utilisateur: str, mot_de_passe: str) -> Tuple[Optional[Utilisateur], Optional[str], Optional[str]]:
        """Connecte un utilisateur existant et génère des tokens"""
        # Trouver l'utilisateur
        utilisateur = self.depot_utilisateur.obtenir_par_nom_utilisateur(nom_utilisateur)
        
        # Vérifier le mot de passe
        if not utilisateur or not utilisateur.verifier_mot_de_passe(mot_de_passe):
            return None, None, None
        
        # Vérifier si le compte est actif
        if not utilisateur.est_actif:
            return utilisateur, None, None
        
        # Générer des tokens
        access_token = create_access_token(identity=utilisateur.id)
        refresh_token = create_refresh_token(identity=utilisateur.id)
        
        return utilisateur, access_token, refresh_token
    
    def rafraichir_token(self, utilisateur_id: int) -> Optional[str]:
        """Rafraîchit le token d'accès d'un utilisateur"""
        # Trouver l'utilisateur
        utilisateur = self.depot_utilisateur.obtenir_par_id(utilisateur_id)
        
        # Vérifier si le compte est actif
        if not utilisateur or not utilisateur.est_actif:
            return None
        
        # Générer un nouveau token d'accès
        access_token = create_access_token(identity=utilisateur.id)
        
        return access_token