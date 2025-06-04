from datetime import datetime
from modeles.intervention import Intervention
from modeles.utilisateur import Utilisateur
from modeles.patient import Patient
from modeles.dispositif_medical import DispositifMedical
from extensions.base_donnees import db
from typing import List, Dict, Optional, Any
import json

class InterventionService:
    @staticmethod
    def creer_intervention(data: Dict[str, Any]) -> Intervention:
        """Crée une nouvelle intervention"""
        # Vérification des relations
        patient = Patient.query.get_or_404(data['patient_id'])
        dispositif = DispositifMedical.query.get_or_404(data['dispositif_id'])
        technicien = Utilisateur.query.get_or_404(data['technicien_id'])
        
        # Création de l'intervention
        intervention = Intervention(**data)
        intervention.enregistrer()
        
        return intervention
    
    @staticmethod
    def obtenir_intervention(id: int) -> Intervention:
        """Récupère une intervention par son ID"""
        return Intervention.query.get_or_404(id)
    
    @staticmethod
    def lister_interventions(
        statut: Optional[str] = None,
        technicien_id: Optional[int] = None,
        date_debut: Optional[datetime] = None,
        date_fin: Optional[datetime] = None
    ) -> List[Intervention]:
        """Liste les interventions avec filtres"""
        query = Intervention.query
        
        if statut:
            query = query.filter(Intervention.statut == statut)
        if technicien_id:
            query = query.filter(Intervention.technicien_id == technicien_id)
        if date_debut:
            query = query.filter(Intervention.date_planifiee >= date_debut)
        if date_fin:
            query = query.filter(Intervention.date_planifiee <= date_fin)
            
        return query.order_by(Intervention.date_planifiee.desc()).all()
    
    @staticmethod
    def modifier_intervention(id: int, data: Dict[str, Any]) -> Intervention:
        """Modifie une intervention existante"""
        intervention = Intervention.query.get_or_404(id)
        
        # Mise à jour des champs
        for key, value in data.items():
            setattr(intervention, key, value)
        
        intervention.enregistrer()
        return intervention
    
    @staticmethod
    def modifier_statut(id: int, nouveau_statut: str, data: Optional[Dict[str, Any]] = None) -> Intervention:
        """Modifie le statut d'une intervention"""
        intervention = Intervention.query.get_or_404(id)
        
        # Validation du statut
        statuts_valides = ['planifiee', 'en_cours', 'terminee', 'patient_absent', 'annulee', 'reportee', 'partielle']
        if nouveau_statut not in statuts_valides:
            raise ValueError(f"Statut invalide. Valeurs autorisées: {', '.join(statuts_valides)}")
        
        # Mise à jour du statut
        intervention.statut = nouveau_statut
        
        # Gestion des cas spéciaux
        if nouveau_statut == 'terminee':
            intervention.date_reelle = datetime.utcnow()
        elif nouveau_statut == 'annulee' and data:
            intervention.motif_annulation = data.get('motif_annulation')
        elif nouveau_statut == 'reportee' and data:
            date_reprogrammation = data.get('date_reprogrammation')
            if not date_reprogrammation:
                raise ValueError("La date de reprogrammation est requise pour une intervention reportée")
            intervention.date_reprogrammation = date_reprogrammation
            intervention.date_planifiee = date_reprogrammation
        
        intervention.enregistrer()
        return intervention
    
    @staticmethod
    def ajouter_photos(id: int, photos: List[str]) -> Intervention:
        """Ajoute des photos à une intervention"""
        intervention = Intervention.query.get_or_404(id)
        
        # Mise à jour des photos
        if intervention.photos:
            intervention.photos.extend(photos)
        else:
            intervention.photos = photos
            
        intervention.enregistrer()
        return intervention
    
    @staticmethod
    def ajouter_signature(id: int, signature: str) -> Intervention:
        """Ajoute la signature du technicien à une intervention"""
        intervention = Intervention.query.get_or_404(id)
        
        # Vérification que l'intervention est terminée
        if intervention.statut != 'terminee':
            raise ValueError("La signature ne peut être ajoutée que pour une intervention terminée")
        
        intervention.signature_technicien = signature
        intervention.enregistrer()
        return intervention
    
    @staticmethod
    def generer_rapport(id: int) -> str:
        """Génère le rapport PDF d'une intervention"""
        intervention = Intervention.query.get_or_404(id)
        
        # Vérification que l'intervention est terminée
        if intervention.statut != 'terminee':
            raise ValueError("Le rapport ne peut être généré que pour une intervention terminée")
        
        # TODO: Implémenter la génération du rapport PDF
        # Pour l'instant, on simule juste l'URL du rapport
        rapport_url = f"/rapports/intervention_{id}.pdf"
        
        # Mise à jour de l'URL du rapport
        intervention.rapport_pdf_url = rapport_url
        intervention.enregistrer()
        
        return rapport_url
    
    @staticmethod
    def obtenir_statistiques_interventions(
        date_debut: Optional[datetime] = None,
        date_fin: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Obtient des statistiques sur les interventions"""
        query = Intervention.query
        
        if date_debut:
            query = query.filter(Intervention.date_planifiee >= date_debut)
        if date_fin:
            query = query.filter(Intervention.date_planifiee <= date_fin)
            
        interventions = query.all()
        
        # Calcul des statistiques
        total = len(interventions)
        par_statut = {}
        par_traitement = {}
        par_type = {}
        
        for intervention in interventions:
            # Statistiques par statut
            par_statut[intervention.statut] = par_statut.get(intervention.statut, 0) + 1
            
            # Statistiques par traitement
            par_traitement[intervention.traitement] = par_traitement.get(intervention.traitement, 0) + 1
            
            # Statistiques par type d'intervention
            par_type[intervention.type_intervention] = par_type.get(intervention.type_intervention, 0) + 1
        
        return {
            'total': total,
            'par_statut': par_statut,
            'par_traitement': par_traitement,
            'par_type': par_type
        } 