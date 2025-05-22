from typing import Optional, Dict
from .depot_base import DepotBase
from modeles.patient import Patient

class DepotPatient(DepotBase[Patient]):
    """Dépôt pour les opérations sur les patients"""
    
    def __init__(self):
        super().__init__(Patient)
    
    def obtenir_par_code(self, code_patient: str) -> Optional[Patient]:
        """Récupérer un patient par son code"""
        return Patient.query.filter_by(code_patient=code_patient).first()
    
    def obtenir_par_cin(self, cin: str) -> Optional[Patient]:
        """Récupérer un patient par sa CIN"""
        return Patient.query.filter_by(cin=cin).first()
    
    def obtenir_pagine_avec_recherche(self, page: int = 1, par_page: int = 10, recherche: str = '') -> Dict:
        """Récupérer les patients avec pagination et recherche"""
        query = Patient.query
        
        if recherche:
            query = query.filter(
                (Patient.code_patient.like(f'%{recherche}%')) |
                (Patient.nom.like(f'%{recherche}%')) |
                (Patient.prenom.like(f'%{recherche}%')) |
                (Patient.telephone.like(f'%{recherche}%')) |
                (Patient.cin.like(f'%{recherche}%'))
            )
        
        pagination = query.order_by(Patient.date_creation.desc()).paginate(page=page, per_page=par_page)
        
        return {
            'elements': pagination.items,
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'par_page': par_page
        }