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
    
    # IMPORTANT: Désactiver les redirections automatiques de trailing slashes
    app.url_map.strict_slashes = False
    
    # Configuration CORS explicite
    CORS(app, 
         origins=["http://localhost:3000", "http://127.0.0.1:3000"],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    
    # Initialisation des extensions
    init_app(app)
    
    # Enregistrement des blueprints
    from routes.auth import auth_bp
    from routes.patients import patients_bp
    from routes.prescripteurs import prescripteurs_bp
    from routes.utilisateurs import utilisateurs_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(prescripteurs_bp, url_prefix='/api/prescripteurs') 
    app.register_blueprint(utilisateurs_bp, url_prefix='/api/utilisateurs')
    # Route de test pour vérifier la connexion
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'OK', 'message': 'Serveur fonctionnel'}), 200
    
    # Route de debug pour tester les patients
    @app.route('/api/debug/patients', methods=['GET'])
    def debug_patients():
        """Route de debug pour récupérer tous les patients avec tous leurs champs"""
        try:
            from modeles.patient import Patient
            patients = Patient.query.all()
            
            # Fonction pour sérialiser un patient avec tous ses champs
            def serialize_patient(patient):
                return {
                    'id': patient.id,
                    'code_patient': patient.code_patient,
                    'nom': patient.nom,
                    'prenom': patient.prenom,
                    'cin': patient.cin,
                    'date_naissance': patient.date_naissance.isoformat() if patient.date_naissance else None,
                    'telephone': patient.telephone,
                    'email': patient.email,
                    'adresse': patient.adresse,
                    'ville': patient.ville,
                    'mutuelle': patient.mutuelle,
                    'prescripteur_nom': patient.prescripteur_nom,
                    'prescripteur_id': getattr(patient, 'prescripteur_id', None),
                    'technicien_id': patient.technicien_id,
                    'date_creation': patient.date_creation.isoformat() if patient.date_creation else None,
                    'date_modification': patient.date_modification.isoformat() if patient.date_modification else None
                }
            
            patients_data = []
            for patient in patients:
                try:
                    patients_data.append(serialize_patient(patient))
                except Exception as serialize_error:
                    # En cas d'erreur sur un patient spécifique, log l'erreur mais continue
                    print(f"Erreur lors de la sérialisation du patient {patient.id}: {serialize_error}")
                    # Ajouter au moins les champs de base
                    patients_data.append({
                        'id': patient.id,
                        'code_patient': getattr(patient, 'code_patient', f'P{patient.id}'),
                        'nom': patient.nom or 'N/A',
                        'prenom': patient.prenom or 'N/A',
                        'cin': getattr(patient, 'cin', ''),
                        'date_naissance': None,
                        'telephone': getattr(patient, 'telephone', ''),
                        'email': getattr(patient, 'email', ''),
                        'adresse': getattr(patient, 'adresse', ''),
                        'ville': getattr(patient, 'ville', ''),
                        'mutuelle': getattr(patient, 'mutuelle', ''),
                        'prescripteur_nom': getattr(patient, 'prescripteur_nom', ''),
                        'prescripteur_id': getattr(patient, 'prescripteur_id', None),
                        'technicien_id': getattr(patient, 'technicien_id', None),
                        'date_creation': None,
                        'date_modification': None
                    })
            
            return jsonify({
                'success': True,
                'count': len(patients_data),
                'patients': patients_data,
                'message': f'{len(patients_data)} patients récupérés avec succès'
            }), 200
            
        except Exception as e:
            print(f"Erreur dans debug_patients: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e),
                'count': 0,
                'patients': [],
                'message': 'Erreur lors de la récupération des patients'
            }), 500
        
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
    print("- GET  /api/health")
    print("- GET  /api/debug/patients")
    print("- POST /api/auth/connexion")
    print("- GET  /api/patients")
    app.run(host='0.0.0.0', port=5000, debug=True)