from typing import Optional, Dict
from .depot_base import DepotBase
from modeles.utilisateur import Utilisateur

class DepotUtilisateur(DepotBase[Utilisateur]):
    """Dépôt pour les opérations sur les utilisateurs"""
    
    def __init__(self):
        super().__init__(Utilisateur)
    
    def obtenir_par_nom_utilisateur(self, nom_utilisateur: str) -> Optional[Utilisateur]:
        """Récupérer un utilisateur par son nom d'utilisateur"""
        return Utilisateur.query.filter_by(nom_utilisateur=nom_utilisateur).first()
    
    def obtenir_par_email(self, email: str) -> Optional[Utilisateur]:
        """Récupérer un utilisateur par son email"""
        return Utilisateur.query.filter_by(email=email).first()
    
    def obtenir_pagine_avec_recherche(self, page: int = 1, par_page: int = 10, recherche: str = '') -> Dict:
        """Récupérer les utilisateurs avec pagination et recherche"""
        query = Utilisateur.query
        
        if recherche:
            query = query.filter(
                (Utilisateur.nom_utilisateur.like(f'%{recherche}%')) |
                (Utilisateur.email.like(f'%{recherche}%')) |
                (Utilisateur.nom.like(f'%{recherche}%')) |
                (Utilisateur.prenom.like(f'%{recherche}%'))
            )
        
        pagination = query.order_by(Utilisateur.date_creation.desc()).paginate(page=page, per_page=par_page)
        
        return {
            'elements': pagination.items,
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'par_page': par_page
        }