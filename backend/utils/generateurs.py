import random
import string
from datetime import datetime

def generer_code_patient(nom, prenom):
    """Génère un code patient unique basé sur les initiales et un timestamp"""
    if nom and prenom:
        initiales = nom[0].upper() + prenom[0].upper()
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M')
        return f"P{initiales}{timestamp}"
    return None

def generer_code_aleatoire(longueur=8):
    """Génère un code aléatoire de la longueur spécifiée"""
    caracteres = string.ascii_uppercase + string.digits
    return ''.join(random.choice(caracteres) for _ in range(longueur))