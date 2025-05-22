from typing import List, Dict, Any, Type, Optional, TypeVar, Generic
from extensions.base_donnees import db

T = TypeVar('T')

class DepotBase(Generic[T]):
    """Dépôt générique pour les opérations CRUD"""
    
    def __init__(self, classe_modele: Type[T]):
        self.classe_modele = classe_modele
    
    def obtenir_tous(self) -> List[T]:
        """Récupérer toutes les instances du modèle"""
        return self.classe_modele.query.all()
    
    def obtenir_par_id(self, id: int) -> Optional[T]:
        """Récupérer une instance par son ID"""
        return self.classe_modele.query.get(id)
    
    def creer(self, donnees: Dict[str, Any]) -> T:
        """Créer une nouvelle instance"""
        instance = self.classe_modele(**donnees)
        db.session.add(instance)
        db.session.commit()
        return instance
    
    def mettre_a_jour(self, instance: T, donnees: Dict[str, Any]) -> T:
        """Mettre à jour une instance"""
        for cle, valeur in donnees.items():
            setattr(instance, cle, valeur)
        db.session.commit()
        return instance
    
    def supprimer(self, instance: T) -> None:
        """Supprimer une instance"""
        db.session.delete(instance)
        db.session.commit()
        
    def obtenir_pagine(self, page: int = 1, par_page: int = 10) -> Dict[str, Any]:
        """Récupérer les instances avec pagination"""
        pagination = self.classe_modele.query.order_by(
            self.classe_modele.date_creation.desc()
        ).paginate(page=page, per_page=par_page)
        
        return {
            'elements': pagination.items,
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'par_page': par_page
        }