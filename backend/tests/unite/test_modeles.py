# tests/unite/test_modeles.py
import unittest
from app import creer_app
from extensions.base_donnees import db
from modeles.utilisateur import Utilisateur
from modeles.patient import Patient

class TestModeles(unittest.TestCase):
    """Tests unitaires pour les modèles"""
    
    def setUp(self):
        """Configuration avant chaque test"""
        self.app = creer_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        """Nettoyage après chaque test"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_utilisateur_mot_de_passe(self):
        """Test du hachage et de la vérification du mot de passe"""
        u = Utilisateur(nom_utilisateur='test')
        u.mot_de_passe = 'test123'
        self.assertTrue(u.verifier_mot_de_passe('test123'))
        self.assertFalse(u.verifier_mot_de_passe('mauvais_mdp'))
    
    def test_generer_code_patient(self):
        """Test de la génération du code patient"""
        p = Patient(nom='Dupont', prenom='Jean')
        code = p.generer_code_patient()
        self.assertTrue(code.startswith('PDJ'))
        self.assertEqual(len(code), 14)  # "P" + 2 initiales + 11 caractères timestamp

if __name__ == '__main__':
    unittest.main()