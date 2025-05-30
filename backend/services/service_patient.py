from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from depots.depot_patient import DepotPatient
from modeles.patient import Patient
import logging
import traceback
from extensions.base_donnees import db

# Configuration du logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ServicePatient:
    """Service pour la gestion des patients"""
    
    def __init__(self):
        self.depot_patient = DepotPatient()
    
    def obtenir_tous_patients(self, page: int = 1, par_page: int = 10, recherche: str = '') -> Dict[str, Any]:
        """Récupérer tous les patients avec pagination et recherche"""
        logger.info(f"Service: Récupération des patients (page={page}, par_page={par_page}, recherche='{recherche}')")
        try:
            resultat = self.depot_patient.obtenir_pagine_avec_recherche(page, par_page, recherche)
            logger.info(f"Service: {len(resultat.get('elements', []))} patients trouvés")
            return resultat
        except Exception as e:
            logger.error(f"Erreur dans obtenir_tous_patients: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            raise
    
    def obtenir_patient_par_id(self, patient_id: int) -> Optional[Patient]:
        """Récupérer un patient par son ID"""
        logger.info(f"Service: Récupération du patient {patient_id}")
        try:
            patient = self.depot_patient.obtenir_par_id(patient_id)
            if patient:
                logger.info(f"Service: Patient {patient_id} trouvé")
            else:
                logger.warning(f"Service: Patient {patient_id} non trouvé")
            return patient
        except Exception as e:
            logger.error(f"Erreur dans obtenir_patient_par_id: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            raise
    
    def obtenir_patient_par_code(self, code_patient: str) -> Optional[Patient]:
        """Récupérer un patient par son code"""
        logger.info(f"Service: Récupération du patient avec le code {code_patient}")
        try:
            patient = self.depot_patient.obtenir_par_code(code_patient)
            if patient:
                logger.info(f"Service: Patient avec le code {code_patient} trouvé")
            else:
                logger.warning(f"Service: Patient avec le code {code_patient} non trouvé")
            return patient
        except Exception as e:
            logger.error(f"Erreur dans obtenir_patient_par_code: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            raise
    
    def obtenir_patient_par_cin(self, cin: str) -> Optional[Patient]:
        """Récupérer un patient par sa CIN"""
        logger.info(f"Service: Récupération du patient avec la CIN {cin}")
        try:
            patient = self.depot_patient.obtenir_par_cin(cin)
            if patient:
                logger.info(f"Service: Patient avec la CIN {cin} trouvé")
            else:
                logger.warning(f"Service: Patient avec la CIN {cin} non trouvé")
            return patient
        except Exception as e:
            logger.error(f"Erreur dans obtenir_patient_par_cin: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            raise
    
    def creer_patient(self, donnees_patient: Dict[str, Any]) -> Patient:
        """Créer un nouveau patient"""
        logger.info(f"Service: Création d'un nouveau patient avec les données: {donnees_patient}")
        try:
            patient = Patient(**donnees_patient)
            patient.generer_code_patient()
            self.depot_patient.creer(patient.__dict__)
            logger.info(f"Service: Patient créé avec succès (ID: {patient.id})")
            return patient
        except Exception as e:
            logger.error(f"Erreur dans creer_patient: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            raise
    
    def mettre_a_jour_patient(self, patient_id: int, donnees_patient: Dict[str, Any]) -> Tuple[Optional[Patient], str]:
        """Mettre à jour un patient existant"""
        logger.info(f"Service: Mise à jour du patient {patient_id} avec les données: {donnees_patient}")
        try:
            patient = self.depot_patient.obtenir_par_id(patient_id)
            if not patient:
                logger.warning(f"Service: Patient {patient_id} non trouvé pour la mise à jour")
                return None, "Patient non trouvé"
            
            patient_maj = self.depot_patient.mettre_a_jour(patient, donnees_patient)
            logger.info(f"Service: Patient {patient_id} mis à jour avec succès")
            return patient_maj, ""
        except Exception as e:
            logger.error(f"Erreur dans mettre_a_jour_patient: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            return None, str(e)
    
    def supprimer_patient(self, patient_id: int) -> Tuple[bool, str]:
        """Supprimer un patient existant"""
        logger.info(f"Service: Suppression du patient {patient_id}")
        try:
            patient = self.depot_patient.obtenir_par_id(patient_id)
            if not patient:
                logger.warning(f"Service: Patient {patient_id} non trouvé pour la suppression")
                return False, "Patient non trouvé"
            
            if patient.dispositifs.count() > 0:
                logger.warning(f"Service: Impossible de supprimer le patient {patient_id} car il possède des dispositifs associés")
                return False, "Impossible de supprimer ce patient car il possède des dispositifs associés"
            
            self.depot_patient.supprimer(patient)
            logger.info(f"Service: Patient {patient_id} supprimé avec succès")
            return True, ""
        except Exception as e:
            logger.error(f"Erreur dans supprimer_patient: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            return False, str(e)