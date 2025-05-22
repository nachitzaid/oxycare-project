import os
from datetime import timedelta
from dotenv import load_dotenv

# Charger les variables d'environnement du fichier .env
load_dotenv()

class Config:
    """Configuration de base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'oxycare_secret_key_dev'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'oxycare_jwt_secret_key_dev'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
class ConfigDeveloppement(Config):
    """Configuration de développement"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+pymysql://root:@localhost/oxycare_db'
    
class ConfigProduction(Config):
    """Configuration de production"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
class ConfigTest(Config):
    """Configuration de test"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or 'mysql+pymysql://root:@localhost/oxycare_test_db'
    
# Dictionnaire des configurations
config = {
    'developpement': ConfigDeveloppement,
    'production': ConfigProduction,
    'test': ConfigTest,
    'defaut': ConfigDeveloppement
}