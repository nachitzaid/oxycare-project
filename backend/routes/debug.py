from flask import Blueprint, jsonify, current_app

debug_bp = Blueprint('debug', __name__)

@debug_bp.route('/cors-test', methods=['GET'])
def test_cors():
    """
    Route de test pour vérifier que CORS fonctionne correctement.
    Cette route renvoie simplement les en-têtes CORS configurés.
    """
    # Récupérer les en-têtes CORS depuis la configuration de l'application
    cors_headers = current_app.config.get('CORS_HEADERS', {})
    
    # Créer un dictionnaire pour la réponse
    response_data = {
        'success': True,
        'message': 'Test CORS réussi',
        'cors_headers': cors_headers
    }
    
    return jsonify(response_data), 200

# Pour l'installer, dans app.py:
# from routes.debug import debug_bp
# app.register_blueprint(debug_bp, url_prefix='/api/debug')
