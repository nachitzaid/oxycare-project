#!/usr/bin/env python3
"""
Script d'initialisation des dispositifs médicaux
Permet d'alimenter la base de données avec des données de test réalistes
"""

import sys
import os
from datetime import datetime, date, timedelta
from random import choice, randint

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import creer_app
from extensions.base_donnees import db
from modeles.dispositif_medical import DispositifMedical
from modeles.patient import Patient

def generer_numero_serie(prefix="DM"):
    """Génère un numéro de série unique"""
    return f"{prefix}{randint(100000, 999999)}"

def generer_date_aleatoire(jours_min=-365, jours_max=0):
    """Génère une date aléatoire dans une plage donnée"""
    base_date = date.today()
    delta_days = randint(jours_min, jours_max)
    return base_date + timedelta(days=delta_days)

def creer_dispositifs_exemple():
    """Crée des dispositifs médicaux d'exemple"""
    
    # Définir les types de dispositifs avec leurs caractéristiques
    types_dispositifs = [
        {
            'designation': 'Concentrateur d\'oxygène portable',
            'references': ['COX-P100', 'COX-P200', 'COX-P300'],
            'types_acquisition': ['location', 'achat_garantie', 'achat_externe']
        },
        {
            'designation': 'CPAP automatique',
            'references': ['CPAP-A10', 'CPAP-A20', 'CPAP-A30'],
            'types_acquisition': ['location', 'achat_garantie']
        },
        {
            'designation': 'BiPAP S/T',
            'references': ['BIPAP-ST100', 'BIPAP-ST200'],
            'types_acquisition': ['location', 'achat_garantie', 'achat_oxylife']
        },
        {
            'designation': 'Moniteur de saturation',
            'references': ['SAT-M100', 'SAT-M200', 'SAT-M300'],
            'types_acquisition': ['achat_externe', 'achat_oxylife']
        },
        {
            'designation': 'Extracteur d\'oxygène',
            'references': ['EXT-O2-500', 'EXT-O2-1000', 'EXT-O2-1500'],
            'types_acquisition': ['achat_garantie', 'achat_oxylife']
        },
        {
            'designation': 'Masque nasal CPAP',
            'references': ['MN-CPAP-S', 'MN-CPAP-M', 'MN-CPAP-L'],
            'types_acquisition': ['achat_externe', 'achat_oxylife']
        },
        {
            'designation': 'Humidificateur chauffant',
            'references': ['HUM-C100', 'HUM-C200'],
            'types_acquisition': ['achat_garantie', 'achat_oxylife']
        },
        {
            'designation': 'Débitmètre oxygène',
            'references': ['DEB-O2-15', 'DEB-O2-25', 'DEB-O2-50'],
            'types_acquisition': ['achat_externe', 'achat_oxylife']
        }
    ]
    
    dispositifs_crees = []
    
    # Récupérer tous les patients existants
    patients = Patient.query.all()
    if not patients:
        print("❌ Aucun patient trouvé dans la base de données.")
        print("   Veuillez d'abord créer des patients avant d'initialiser les dispositifs.")
        return []
    
    print(f"📋 {len(patients)} patients trouvés dans la base de données")
    
    # Créer des dispositifs pour chaque patient
    for patient in patients:
        # Chaque patient aura entre 1 et 3 dispositifs
        nb_dispositifs = randint(1, 3)
        
        for _ in range(nb_dispositifs):
            type_dispositif = choice(types_dispositifs)
            reference = choice(type_dispositif['references'])
            type_acquisition = choice(type_dispositif['types_acquisition'])
            
            # Générer les dates selon le type d'acquisition
            date_acquisition = generer_date_aleatoire(-730, -30)  # Entre 2 ans et 1 mois
            
            # Dates de garantie et location selon le type
            date_fin_garantie = None
            date_fin_location = None
            duree_location = None
            
            if type_acquisition == 'achat_garantie':
                # Garantie de 1 à 3 ans
                duree_garantie = randint(365, 1095)
                date_fin_garantie = date_acquisition + timedelta(days=duree_garantie)
            
            elif type_acquisition == 'location':
                # Location de 6 à 24 mois
                duree_location = randint(6, 24)
                date_fin_location = date_acquisition + timedelta(days=duree_location * 30)
            
            # Statut aléatoire
            statut = choice(['actif', 'actif', 'actif', 'en_maintenance', 'retiré'])  # Plus de chance d'être actif
            
            # Créer le dispositif
            dispositif = DispositifMedical(
                patient_id=patient.id,
                designation=type_dispositif['designation'],
                reference=reference,
                numero_serie=generer_numero_serie(),
                type_acquisition=type_acquisition,
                date_acquisition=date_acquisition,
                date_fin_garantie=date_fin_garantie,
                duree_location=duree_location,
                date_fin_location=date_fin_location,
                statut=statut
            )
            
            dispositifs_crees.append(dispositif)
    
    return dispositifs_crees

def initialiser_dispositifs():
    """Fonction principale d'initialisation"""
    print("🚀 Initialisation des dispositifs médicaux...")
    
    try:
        # Créer les dispositifs d'exemple
        dispositifs = creer_dispositifs_exemple()
        
        if not dispositifs:
            return
        
        print(f"📦 Création de {len(dispositifs)} dispositifs...")
        
        # Ajouter tous les dispositifs à la session
        for dispositif in dispositifs:
            db.session.add(dispositif)
        
        # Valider les changements
        db.session.commit()
        
        print("✅ Dispositifs créés avec succès!")
        
        # Afficher un résumé
        print("\n📊 Résumé des dispositifs créés:")
        
        # Statistiques par type d'acquisition
        stats_acquisition = {}
        stats_statut = {}
        stats_designation = {}
        
        for dispositif in dispositifs:
            # Par type d'acquisition
            if dispositif.type_acquisition not in stats_acquisition:
                stats_acquisition[dispositif.type_acquisition] = 0
            stats_acquisition[dispositif.type_acquisition] += 1
            
            # Par statut
            if dispositif.statut not in stats_statut:
                stats_statut[dispositif.statut] = 0
            stats_statut[dispositif.statut] += 1
            
            # Par désignation
            if dispositif.designation not in stats_designation:
                stats_designation[dispositif.designation] = 0
            stats_designation[dispositif.designation] += 1
        
        print("\n🔹 Répartition par type d'acquisition:")
        for type_acq, count in stats_acquisition.items():
            print(f"   • {type_acq}: {count}")
        
        print("\n🔹 Répartition par statut:")
        for statut, count in stats_statut.items():
            print(f"   • {statut}: {count}")
        
        print("\n🔹 Répartition par type de dispositif:")
        for designation, count in stats_designation.items():
            print(f"   • {designation}: {count}")
        
        print(f"\n🎉 Total: {len(dispositifs)} dispositifs créés!")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {str(e)}")
        db.session.rollback()
        raise

def nettoyer_dispositifs():
    """Supprime tous les dispositifs existants (optionnel)"""
    try:
        count = DispositifMedical.query.count()
        if count == 0:
            print("ℹ️  Aucun dispositif à supprimer")
            return
        
        confirmation = input(f"⚠️  Voulez-vous supprimer les {count} dispositifs existants? (oui/non): ").lower()
        if confirmation in ['oui', 'o', 'yes', 'y']:
            DispositifMedical.query.delete()
            db.session.commit()
            print(f"🗑️  {count} dispositifs supprimés")
        else:
            print("❌ Suppression annulée")
            return False
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la suppression: {str(e)}")
        db.session.rollback()
        return False

def main():
    """Fonction principale"""
    print("=" * 60)
    print("🏥 SCRIPT D'INITIALISATION DES DISPOSITIFS MÉDICAUX")
    print("=" * 60)
    
    # Créer l'application Flask
    app = creer_app()
    
    with app.app_context():
        try:
            # Vérifier la connexion à la base de données
            db.engine.execute('SELECT 1')
            print("✅ Connexion à la base de données établie")
            
            # Menu d'options
            print("\nOptions disponibles:")
            print("1. Initialiser les dispositifs (ajouter)")
            print("2. Nettoyer puis initialiser")
            print("3. Nettoyer uniquement")
            print("4. Afficher les statistiques actuelles")
            print("0. Quitter")
            
            choix = input("\nVotre choix (1-4, 0 pour quitter): ").strip()
            
            if choix == '1':
                initialiser_dispositifs()
            elif choix == '2':
                if nettoyer_dispositifs():
                    initialiser_dispositifs()
            elif choix == '3':
                nettoyer_dispositifs()
            elif choix == '4':
                count = DispositifMedical.query.count()
                print(f"📊 Nombre de dispositifs actuels: {count}")
                if count > 0:
                    # Afficher quelques statistiques
                    from sqlalchemy import func
                    stats = db.session.query(
                        DispositifMedical.statut,
                        func.count(DispositifMedical.id)
                    ).group_by(DispositifMedical.statut).all()
                    
                    print("\nRépartition par statut:")
                    for statut, count in stats:
                        print(f"   • {statut}: {count}")
            elif choix == '0':
                print("👋 Au revoir!")
            else:
                print("❌ Choix invalide")
                
        except Exception as e:
            print(f"❌ Erreur de connexion à la base de données: {str(e)}")
            sys.exit(1)

if __name__ == '__main__':
    main()