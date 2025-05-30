from typing import Dict, Any, Tuple
from flask import request
from services.service_patient import ServicePatient
from schemas.schema_patient import SchemaPatient
import logging
import traceback
from extensions.base_donnees import db

# Configuration du logging pour debug
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ControleurPatient:
    """Contrôleur pour les endpoints relatifs aux patients"""
    
    def __init__(self):
        self.service_patient = ServicePatient()
        self.schema_patient = SchemaPatient()
        self.schema_patients = SchemaPatient(many=True)
    
    def obtenir_patients(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour récupérer tous les patients"""
        logger.info("=== Début obtenir_patients ===")
        
        try:
            # Récupération et validation des paramètres
            page = request.args.get('page', 1, type=int)
            par_page = request.args.get('par_page', 10, type=int)
            recherche = request.args.get('recherche', '').strip()
            
            # Validation des paramètres
            if page < 1:
                page = 1
            if par_page < 1 or par_page > 100:
                par_page = 10
                
            logger.info(f"Paramètres validés: page={page}, par_page={par_page}, recherche='{recherche}'")
            
            # Appel du service
            logger.info("Appel du service patient...")
            try:
                resultat = self.service_patient.obtenir_tous_patients(page, par_page, recherche)
                logger.info(f"Résultat du service reçu: {type(resultat)}")
            except Exception as service_error:
                logger.error(f"Erreur dans le service patient: {str(service_error)}\n{traceback.format_exc()}")
                db.session.rollback()
                raise
            
            # Vérification de la structure du résultat
            if not isinstance(resultat, dict):
                logger.error(f"Le service n'a pas retourné un dictionnaire: {type(resultat)}")
                raise Exception("Structure de retour invalide du service")
            
            elements = resultat.get('elements', [])
            total = resultat.get('total', 0)
            pages = resultat.get('pages', 1)
            
            logger.info(f"Données extraites: {len(elements)} éléments, {total} total, {pages} pages")
            
            # Sérialisation des données
            try:
                logger.info("Début de la sérialisation...")
                donnees_serialisees = self.schema_patients.dump(elements)
                logger.info(f"Sérialisation réussie: {len(donnees_serialisees)} éléments")
            except Exception as e:
                logger.error(f"Erreur de sérialisation: {str(e)}\n{traceback.format_exc()}")
                # En cas d'erreur de sérialisation, essayer élément par élément
                donnees_serialisees = []
                for i, element in enumerate(elements):
                    try:
                        donnees_serialisees.append(self.schema_patient.dump(element))
                    except Exception as elem_error:
                        logger.error(f"Erreur sur l'élément {i}: {str(elem_error)}\n{traceback.format_exc()}")
                        continue
            
            response_data = {
                'success': True,
                'data': {
                    'items': donnees_serialisees,
                    'total': total,
                    'pages_totales': pages,
                    'page_courante': page,
                    'par_page': par_page,
                    'total_resultats': total
                },
                'message': f'Patients récupérés avec succès ({len(donnees_serialisees)} éléments)'
            }
            
            logger.info(f"Réponse finale préparée avec {len(donnees_serialisees)} éléments")
            return response_data, 200
            
        except ValueError as ve:
            logger.error(f"Erreur de validation dans obtenir_patients: {str(ve)}\n{traceback.format_exc()}")
            return {
                'success': False,
                'message': f'Paramètres invalides: {str(ve)}',
                'data': {
                    'items': [],
                    'total': 0,
                    'pages_totales': 1,
                    'page_courante': 1,
                    'par_page': 10,
                    'total_resultats': 0
                }
            }, 422
            
        except Exception as e:
            logger.error(f"Erreur générale dans obtenir_patients: {str(e)}\n{traceback.format_exc()}")
            db.session.rollback()
            return {
                'success': False,
                'message': f'Erreur lors de la récupération des patients: {str(e)}',
                'data': {
                    'items': [],
                    'total': 0,
                    'pages_totales': 1,
                    'page_courante': 1,
                    'par_page': 10,
                    'total_resultats': 0
                }
            }, 500
    
    def obtenir_patient(self, patient_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour récupérer un patient par son ID"""
        try:
            logger.info(f"Récupération du patient avec ID: {patient_id}")
            
            if patient_id <= 0:
                return {
                    'success': False,
                    'message': 'ID patient invalide'
                }, 400
                
            patient = self.service_patient.obtenir_patient_par_id(patient_id)
            
            if not patient:
                return {
                    'success': False,
                    'message': 'Patient non trouvé'
                }, 404
            
            return {
                'success': True,
                'data': self.schema_patient.dump(patient),
                'message': 'Patient récupéré avec succès'
            }, 200
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du patient {patient_id}: {str(e)}")
            return {
                'success': False,
                'message': f'Erreur lors de la récupération du patient: {str(e)}'
            }, 500
    
    def creer_patient(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour créer un nouveau patient"""
        try:
            donnees = request.get_json()
            
            if not donnees:
                return {
                    'success': False,
                    'message': 'Données JSON requises'
                }, 400
            
            # Validation des données
            erreurs = self.schema_patient.validate(donnees)
            if erreurs:
                logger.error(f"Erreurs de validation: {erreurs}")
                return {
                    'success': False,
                    'message': 'Données invalides',
                    'errors': erreurs
                }, 422
            
            patient = self.service_patient.creer_patient(donnees)
            return {
                'success': True,
                'data': self.schema_patient.dump(patient),
                'message': 'Patient créé avec succès'
            }, 201
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du patient: {str(e)}")
            return {
                'success': False,
                'message': f'Erreur lors de la création du patient: {str(e)}'
            }, 500
    
    def mettre_a_jour_patient(self, patient_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour mettre à jour un patient existant"""
        try:
            if patient_id <= 0:
                return {
                    'success': False,
                    'message': 'ID patient invalide'
                }, 400
                
            donnees = request.get_json()
            
            if not donnees:
                return {
                    'success': False,
                    'message': 'Données JSON requises'
                }, 400
            
            # Validation des données (partielle pour la mise à jour)
            erreurs = self.schema_patient.validate(donnees, partial=True)
            if erreurs:
                logger.error(f"Erreurs de validation: {erreurs}")
                return {
                    'success': False,
                    'message': 'Données invalides',
                    'errors': erreurs
                }, 422
            
            patient, message_erreur = self.service_patient.mettre_a_jour_patient(patient_id, donnees)
            
            if not patient:
                return {
                    'success': False,
                    'message': message_erreur or 'Erreur lors de la mise à jour'
                }, 404 if message_erreur == "Patient non trouvé" else 400
            
            return {
                'success': True,
                'data': self.schema_patient.dump(patient),
                'message': 'Patient mis à jour avec succès'
            }, 200
            
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du patient: {str(e)}")
            return {
                'success': False,
                'message': f'Erreur lors de la mise à jour du patient: {str(e)}'
            }, 500
    
    def supprimer_patient(self, patient_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour supprimer un patient existant"""
        try:
            if patient_id <= 0:
                return {
                    'success': False,
                    'message': 'ID patient invalide'
                }, 400
                
            succes, message = self.service_patient.supprimer_patient(patient_id)
            
            if not succes:
                return {
                    'success': False,
                    'message': message
                }, 404 if message == "Patient non trouvé" else 400
            
            return {
                'success': True,
                'message': f'Patient avec ID {patient_id} supprimé avec succès'
            }, 200
            
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du patient: {str(e)}")
            return {
                'success': False,
                'message': f'Erreur lors de la suppression du patient: {str(e)}'
            }, 500
    
    def rechercher_patient(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour rechercher un patient par code ou CIN"""
        try:
            type_recherche = request.args.get('type', 'code')
            valeur = request.args.get('valeur', '').strip()
            
            if not valeur:
                return {
                    'success': False,
                    'message': 'Valeur de recherche requise'
                }, 400
            
            if type_recherche not in ['code', 'cin']:
                return {
                    'success': False,
                    'message': 'Type de recherche invalide. Utilisez "code" ou "cin"'
                }, 400
            
            if type_recherche == 'code':
                patient = self.service_patient.obtenir_patient_par_code(valeur)
            else:  # type_recherche == 'cin'
                patient = self.service_patient.obtenir_patient_par_cin(valeur)
            
            if not patient:
                return {
                    'success': False,
                    'message': 'Patient non trouvé'
                }, 404
            
            return {
                'success': True,
                'data': self.schema_patient.dump(patient),
                'message': 'Patient trouvé avec succès'
            }, 200
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche du patient: {str(e)}")
            return {
                'success': False,
                'message': f'Erreur lors de la recherche du patient: {str(e)}'
            }, 500