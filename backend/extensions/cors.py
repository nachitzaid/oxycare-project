from flask_cors import CORS

cors = CORS()

def init_app(app):
    """Initialiser l'extension CORS avec les bonnes configurations"""
    cors.init_app(app, 
                 resources={r"/api/*": {
                     "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],  # Origines spécifiques 
                     "methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
                     "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                     "supports_credentials": True,  # Important pour les cookies/auth
                 }},
                 # Ajouter ces options globales pour s'assurer que CORS est appliqué même en cas d'erreur
                 send_wildcard=False,
                 always_send=True)  # Toujours envoyer les en-têtes CORS, même en cas d'erreur
    
    # Conserver une référence aux en-têtes CORS pour les utiliser dans les gestionnaires d'erreurs
    cors_headers = {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true'
    }
    
    # Stocker les en-têtes CORS dans l'application pour y accéder globalement
    app.config['CORS_HEADERS'] = cors_headers
    
    # Définir une méthode pour obtenir les en-têtes CORS
    def get_response_headers():
        return cors_headers
    
    # Attacher la méthode à l'objet cors pour y accéder facilement
    cors.get_response_headers = get_response_headers