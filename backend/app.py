import os
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import init_app
from config import config

def creer_app(nom_config=None):
    """Fonction factory pour créer l'application Flask"""
    if nom_config is None:
        nom_config = os.environ.get('FLASK_CONFIG', 'defaut')
    
    app = Flask(__name__)
    app.config.from_object(config[nom_config])
    
    app.url_map.strict_slashes = False
    
    CORS(app, 
         origins=["http://localhost:3000", "http://127.0.0.1:3000"],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    
    init_app(app)
    
    # Enregistrement des blueprints
    from routes.auth import auth_bp
    from routes.patients import patients_bp
    from routes.prescripteurs import prescripteurs_bp
    from routes.utilisateurs import utilisateurs_bp
    from routes.debug import debug_bp
    from routes.dispositifs import dispositifs_bp
    from routes.interventions import interventions_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(prescripteurs_bp, url_prefix='/api/prescripteurs') 
    app.register_blueprint(utilisateurs_bp, url_prefix='/api/utilisateurs')
    app.register_blueprint(debug_bp, url_prefix='/api/debug')
    app.register_blueprint(dispositifs_bp, url_prefix='/api/dispositifs') 
    app.register_blueprint(interventions_bp, url_prefix='/api/interventions') 
    
    # Route de test pour vérifier la connexion
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'OK', 'message': 'Serveur fonctionnel'}), 200

    # Gestionnaire d'erreurs global
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Erreur non gérée: {str(e)}")
        return jsonify({'message': 'Une erreur est survenue sur le serveur'}), 500
    
    # Gestionnaire pour les erreurs 404
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'message': 'Route non trouvée'}), 404
    
    return app

if __name__ == '__main__':
    app = creer_app()
    print("Serveur Flask démarré sur http://localhost:5000")
    print("Routes disponibles:")
    print("- GET    /api/health")
    print("- GET    /api/debug/patients")
    print("- DELETE /api/debug/patients/<id>")
    print("- GET    /api/debug/prescripteurs")
    print("- GET    /api/debug/utilisateurs")
    print("- POST   /api/auth/connexion")
    print("- GET    /api/patients")
    print("- GET    /api/interventions")
    app.run(host='0.0.0.0', port=5000, debug=True)