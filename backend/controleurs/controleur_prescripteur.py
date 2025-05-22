from typing import Dict, Any, Tuple
from flask import request
from modeles.prescripteur import Prescripteur
from schemas.schema_prescripteur import SchemaPrescripteur
from extensions.base_donnees import db

class ControleurPrescripteur:
    """Contrôleur pour les endpoints relatifs aux prescripteurs"""
    
    def __init__(self):
        self.schema_prescripteur = SchemaPrescripteur()
        self.schema_prescripteurs = SchemaPrescripteur(many=True)
    
    def obtenir_prescripteurs(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour récupérer tous les prescripteurs"""
        prescripteurs = Prescripteur.query.all()
        
        return {
            'success': True,
            'data': self.schema_prescripteurs.dump(prescripteurs)
        }, 200
    
    def obtenir_prescripteur(self, prescripteur_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour récupérer un prescripteur par son ID"""
        prescripteur = Prescripteur.query.get(prescripteur_id)
        
        if not prescripteur:
            return {
                'success': False,
                'message': 'Prescripteur non trouvé'
            }, 404
        
        return {
            'success': True,
            'data': self.schema_prescripteur.dump(prescripteur)
        }, 200
    
    def creer_prescripteur(self) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour créer un nouveau prescripteur"""
        donnees = request.get_json()
        
        # Validation des données
        erreurs = self.schema_prescripteur.validate(donnees)
        if erreurs:
            return {
                'success': False,
                'message': 'Données invalides',
                'errors': erreurs
            }, 400
        
        try:
            prescripteur = Prescripteur(
                nom=donnees.get('nom'),
                prenom=donnees.get('prenom'),
                specialite=donnees.get('specialite'),
                telephone=donnees.get('telephone'),
                email=donnees.get('email')
            )
            
            db.session.add(prescripteur)
            db.session.commit()
            
            return {
                'success': True,
                'data': self.schema_prescripteur.dump(prescripteur),
                'message': 'Prescripteur créé avec succès'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'message': f'Erreur lors de la création du prescripteur: {str(e)}'
            }, 500
    
    def mettre_a_jour_prescripteur(self, prescripteur_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour mettre à jour un prescripteur existant"""
        prescripteur = Prescripteur.query.get(prescripteur_id)
        
        if not prescripteur:
            return {
                'success': False,
                'message': 'Prescripteur non trouvé'
            }, 404
        
        donnees = request.get_json()
        
        # Validation des données
        erreurs = self.schema_prescripteur.validate(donnees, partial=True)
        if erreurs:
            return {
                'success': False,
                'message': 'Données invalides',
                'errors': erreurs
            }, 400
        
        try:
            if 'nom' in donnees:
                prescripteur.nom = donnees['nom']
            if 'prenom' in donnees:
                prescripteur.prenom = donnees['prenom']
            if 'specialite' in donnees:
                prescripteur.specialite = donnees['specialite']
            if 'telephone' in donnees:
                prescripteur.telephone = donnees['telephone']
            if 'email' in donnees:
                prescripteur.email = donnees['email']
            
            db.session.commit()
            
            return {
                'success': True,
                'data': self.schema_prescripteur.dump(prescripteur),
                'message': 'Prescripteur mis à jour avec succès'
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'message': f'Erreur lors de la mise à jour du prescripteur: {str(e)}'
            }, 500
    
    def supprimer_prescripteur(self, prescripteur_id: int) -> Tuple[Dict[str, Any], int]:
        """Endpoint pour supprimer un prescripteur existant"""
        prescripteur = Prescripteur.query.get(prescripteur_id)
        
        if not prescripteur:
            return {
                'success': False,
                'message': 'Prescripteur non trouvé'
            }, 404
        
        try:
            db.session.delete(prescripteur)
            db.session.commit()
            
            return {
                'success': True,
                'message': f'Prescripteur avec ID {prescripteur_id} supprimé avec succès'
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'message': f'Erreur lors de la suppression du prescripteur: {str(e)}'
            }, 500