from typing import Dict, Any, Optional, Tuple
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, get_jwt
from depots.depot_utilisateur import DepotUtilisateur
from modeles.utilisateur import Utilisateur
import logging

logger = logging.getLogger(__name__)

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
        
        # Générer des tokens avec des claims additionnels
        additional_claims = {
            'role': utilisateur.role,
            'email': utilisateur.email,
            'nom': utilisateur.nom,
            'prenom': utilisateur.prenom
        }
        
        access_token = create_access_token(
            identity=str(utilisateur.id),
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(
            identity=str(utilisateur.id),
            additional_claims=additional_claims
        )
        
        logger.info(f"Utilisateur {utilisateur.id} enregistré avec succès")
        return utilisateur, access_token, refresh_token
    
    def connexion(self, nom_utilisateur: str, mot_de_passe: str) -> Tuple[Optional[Utilisateur], Optional[str], Optional[str]]:
        """Connecte un utilisateur existant et génère des tokens"""
        try:
            # Trouver l'utilisateur
            utilisateur = self.depot_utilisateur.obtenir_par_nom_utilisateur(nom_utilisateur)
            
            # Vérifier le mot de passe
            if not utilisateur or not utilisateur.verifier_mot_de_passe(mot_de_passe):
                logger.warning(f"Tentative de connexion échouée pour {nom_utilisateur}")
                return None, None, None
            
            # Vérifier si le compte est actif
            if not utilisateur.est_actif:
                logger.warning(f"Tentative de connexion pour un compte inactif: {nom_utilisateur}")
                return utilisateur, None, None
            
            # Générer des tokens avec des claims additionnels
            additional_claims = {
                'role': utilisateur.role,
                'email': utilisateur.email,
                'nom': utilisateur.nom,
                'prenom': utilisateur.prenom
            }
            
            access_token = create_access_token(
                identity=str(utilisateur.id),
                additional_claims=additional_claims
            )
            refresh_token = create_refresh_token(
                identity=str(utilisateur.id),
                additional_claims=additional_claims
            )
            
            logger.info(f"Utilisateur {utilisateur.id} connecté avec succès")
            return utilisateur, access_token, refresh_token
            
        except Exception as e:
            logger.error(f"Erreur lors de la connexion: {str(e)}")
            return None, None, None
    
    def rafraichir_token(self, utilisateur_id: int) -> Optional[str]:
        """Rafraîchit le token d'accès d'un utilisateur"""
        try:
            # Trouver l'utilisateur
            utilisateur = self.depot_utilisateur.obtenir_par_id(utilisateur_id)
            
            # Vérifier si le compte est actif
            if not utilisateur or not utilisateur.est_actif:
                logger.warning(f"Tentative de rafraîchissement de token pour un compte inactif: {utilisateur_id}")
                return None
            
            # Récupérer les claims du refresh token
            claims = get_jwt()
            
            # Générer un nouveau token d'accès avec les mêmes claims
            access_token = create_access_token(
                identity=str(utilisateur.id),
                additional_claims={
                    'role': utilisateur.role,
                    'email': utilisateur.email,
                    'nom': utilisateur.nom,
                    'prenom': utilisateur.prenom
                }
            )
            
            logger.info(f"Token rafraîchi pour l'utilisateur {utilisateur_id}")
            return access_token
            
        except Exception as e:
            logger.error(f"Erreur lors du rafraîchissement du token: {str(e)}")
            return None