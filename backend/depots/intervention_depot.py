from typing import List, Dict, Optional, Any
from datetime import datetime
from modeles.intervention import Intervention
from extensions.base_donnees import db
from sqlalchemy import and_, or_

class InterventionDepot:
    @staticmethod
    def creer(data: Dict[str, Any]) -> Intervention:
        """Crée une nouvelle intervention"""
        intervention = Intervention(**data)
        db.session.add(intervention)
        db.session.commit()
        return intervention
    
    @staticmethod
    def obtenir_par_id(id: int) -> Optional[Intervention]:
        """Récupère une intervention par son ID"""
        return Intervention.query.get(id)
    
    @staticmethod
    def obtenir_par_patient(patient_id: int) -> List[Intervention]:
        """Récupère toutes les interventions d'un patient"""
        return Intervention.query.filter_by(patient_id=patient_id).all()
    
    @staticmethod
    def obtenir_par_technicien(technicien_id: int) -> List[Intervention]:
        """Récupère toutes les interventions d'un technicien"""
        return Intervention.query.filter_by(technicien_id=technicien_id).all()
    
    @staticmethod
    def obtenir_par_dispositif(dispositif_id: int) -> List[Intervention]:
        """Récupère toutes les interventions d'un dispositif"""
        return Intervention.query.filter_by(dispositif_id=dispositif_id).all()
    
    @staticmethod
    def obtenir_par_statut(statut: str) -> List[Intervention]:
        """Récupère toutes les interventions d'un statut donné"""
        return Intervention.query.filter_by(statut=statut).all()
    
    @staticmethod
    def obtenir_par_periode(date_debut: datetime, date_fin: datetime) -> List[Intervention]:
        """Récupère toutes les interventions dans une période donnée"""
        return Intervention.query.filter(
            and_(
                Intervention.date_planifiee >= date_debut,
                Intervention.date_planifiee <= date_fin
            )
        ).all()
    
    @staticmethod
    def obtenir_par_traitement(traitement: str) -> List[Intervention]:
        """Récupère toutes les interventions d'un traitement donné"""
        return Intervention.query.filter_by(traitement=traitement).all()
    
    @staticmethod
    def obtenir_par_type_intervention(type_intervention: str) -> List[Intervention]:
        """Récupère toutes les interventions d'un type donné"""
        return Intervention.query.filter_by(type_intervention=type_intervention).all()
    
    @staticmethod
    def obtenir_interventions_planifiees() -> List[Intervention]:
        """Récupère toutes les interventions planifiées"""
        return Intervention.query.filter_by(statut='planifiee').all()
    
    @staticmethod
    def obtenir_interventions_en_cours() -> List[Intervention]:
        """Récupère toutes les interventions en cours"""
        return Intervention.query.filter_by(statut='en_cours').all()
    
    @staticmethod
    def obtenir_interventions_terminees() -> List[Intervention]:
        """Récupère toutes les interventions terminées"""
        return Intervention.query.filter_by(statut='terminee').all()
    
    @staticmethod
    def obtenir_interventions_annulees() -> List[Intervention]:
        """Récupère toutes les interventions annulées"""
        return Intervention.query.filter_by(statut='annulee').all()
    
    @staticmethod
    def obtenir_interventions_reportees() -> List[Intervention]:
        """Récupère toutes les interventions reportées"""
        return Intervention.query.filter_by(statut='reportee').all()
    
    @staticmethod
    def obtenir_interventions_patient_absent() -> List[Intervention]:
        """Récupère toutes les interventions où le patient était absent"""
        return Intervention.query.filter_by(statut='patient_absent').all()
    
    @staticmethod
    def obtenir_interventions_partielle() -> List[Intervention]:
        """Récupère toutes les interventions partielles"""
        return Intervention.query.filter_by(statut='partielle').all()
    
    @staticmethod
    def modifier(id: int, data: Dict[str, Any]) -> Optional[Intervention]:
        """Modifie une intervention existante"""
        intervention = Intervention.query.get(id)
        if intervention:
            for key, value in data.items():
                setattr(intervention, key, value)
            db.session.commit()
        return intervention
    
    @staticmethod
    def supprimer(id: int) -> bool:
        """Supprime une intervention"""
        intervention = Intervention.query.get(id)
        if intervention:
            db.session.delete(intervention)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def obtenir_statistiques(
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
    
    @staticmethod
    def obtenir_interventions_avec_filtres(
        statut: Optional[str] = None,
        technicien_id: Optional[int] = None,
        patient_id: Optional[int] = None,
        dispositif_id: Optional[int] = None,
        traitement: Optional[str] = None,
        type_intervention: Optional[str] = None,
        date_debut: Optional[datetime] = None,
        date_fin: Optional[datetime] = None
    ) -> List[Intervention]:
        """Récupère les interventions avec plusieurs filtres"""
        query = Intervention.query
        
        if statut:
            query = query.filter(Intervention.statut == statut)
        if technicien_id:
            query = query.filter(Intervention.technicien_id == technicien_id)
        if patient_id:
            query = query.filter(Intervention.patient_id == patient_id)
        if dispositif_id:
            query = query.filter(Intervention.dispositif_id == dispositif_id)
        if traitement:
            query = query.filter(Intervention.traitement == traitement)
        if type_intervention:
            query = query.filter(Intervention.type_intervention == type_intervention)
        if date_debut:
            query = query.filter(Intervention.date_planifiee >= date_debut)
        if date_fin:
            query = query.filter(Intervention.date_planifiee <= date_fin)
            
        return query.order_by(Intervention.date_planifiee.desc()).all() 