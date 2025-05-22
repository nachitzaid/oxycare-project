from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from depots.depot_patient import DepotPatient
from modeles.patient import Patient

class ServicePatient:
    """Service pour la gestion des patients"""
    
    def __init__(self):
        self.depot_patient = DepotPatient()
    
    def obtenir_tous_patients(self, page: int = 1, par_page: int = 10, recherche: str = '') -> Dict[str, Any]:
        """Récupérer tous les patients avec pagination et recherche"""
        return self.depot_patient.obtenir_pagine_avec_recherche(page, par_page, recherche)
    
    def obtenir_patient_par_id(self, patient_id: int) -> Optional[Patient]:
        """Récupérer un patient par son ID"""
        return self.depot_patient.obtenir_par_id(patient_id)
    
    def obtenir_patient_par_code(self, code_patient: str) -> Optional[Patient]:
        """Récupérer un patient par son code"""
        return self.depot_patient.obtenir_par_code(code_patient)
    
    def obtenir_patient_par_cin(self, cin: str) -> Optional[Patient]:
        """Récupérer un patient par sa CIN"""
        return self.depot_patient.obtenir_par_cin(cin)
    
    def creer_patient(self, donnees_patient: Dict[str, Any]) -> Patient:
        """Créer un nouveau patient"""
        patient = Patient(**donnees_patient)
        
        # Générer un code patient
        patient.generer_code_patient()
        
        # Sauvegarder le patient
        self.depot_patient.creer(patient.__dict__)
        
        return patient
    
    def mettre_a_jour_patient(self, patient_id: int, donnees_patient: Dict[str, Any]) -> Tuple[Optional[Patient], str]:
        """Mettre à jour un patient existant"""
        patient = self.depot_patient.obtenir_par_id(patient_id)
        if not patient:
            return None, "Patient non trouvé"
        
        try:
            patient_maj = self.depot_patient.mettre_a_jour(patient, donnees_patient)
            return patient_maj, ""
        except Exception as e:
            return None, str(e)
    
    def supprimer_patient(self, patient_id: int) -> Tuple[bool, str]:
        """Supprimer un patient existant"""
        patient = self.depot_patient.obtenir_par_id(patient_id)
        if not patient:
            return False, "Patient non trouvé"
        
        # Vérifier si le patient a des dispositifs associés
        if patient.dispositifs.count() > 0:
            return False, "Impossible de supprimer ce patient car il possède des dispositifs associés"
        
        try:
            self.depot_patient.supprimer(patient)
            return True, ""
        except Exception as e:
            return False, str(e)