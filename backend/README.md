# Documentation des Routes API

## Authentification

### POST /api/auth/enregistrer
Enregistre un nouvel utilisateur.

**Corps de la requête:**
```json
{
  "nom_utilisateur": "string",
  "email": "string",
  "mot_de_passe": "string",
  "nom": "string",
  "prenom": "string",
  "role": "string" // "admin" ou "technicien"
}
```

**Réponse:**
```json
{
  "utilisateur": {
    "id": "number",
    "nom_utilisateur": "string",
    "email": "string",
    "nom": "string",
    "prenom": "string",
    "role": "string"
  },
  "access_token": "string",
  "refresh_token": "string"
}
```

### POST /api/auth/connexion
Connecte un utilisateur existant.

**Corps de la requête:**
```json
{
  "nom_utilisateur": "string",
  "mot_de_passe": "string"
}
```

**Réponse:**
```json
{
  "utilisateur": {
    "id": "number",
    "nom_utilisateur": "string",
    "email": "string",
    "nom": "string",
    "prenom": "string",
    "role": "string"
  },
  "access_token": "string",
  "refresh_token": "string"
}
```

### POST /api/auth/rafraichir
Rafraîchit le token d'accès.

**Headers requis:**
```
Authorization: Bearer <refresh_token>
```

**Réponse:**
```json
{
  "access_token": "string"
}
```

### GET /api/auth/profil
Récupère le profil de l'utilisateur connecté.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Réponse:**
```json
{
  "id": "number",
  "nom_utilisateur": "string",
  "email": "string",
  "nom": "string",
  "prenom": "string",
  "role": "string"
}
```

## Interventions

### GET /api/interventions
Récupère la liste des interventions.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Paramètres de requête:**
- `page` (optionnel): Numéro de page (défaut: 1)
- `par_page` (optionnel): Nombre d'éléments par page (défaut: 10)
- `statut` (optionnel): Filtrer par statut
- `technicien_id` (optionnel): Filtrer par technicien

**Réponse:**
```json
{
  "interventions": [
    {
      "id": "number",
      "date_creation": "string",
      "date_intervention": "string",
      "statut": "string",
      "description": "string",
      "technicien": {
        "id": "number",
        "nom": "string",
        "prenom": "string"
      },
      "patient": {
        "id": "number",
        "nom": "string",
        "prenom": "string"
      }
    }
  ],
  "total": "number",
  "pages": "number"
}
```

### POST /api/interventions
Crée une nouvelle intervention.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Corps de la requête:**
```json
{
  "date_intervention": "string",
  "description": "string",
  "patient_id": "number",
  "technicien_id": "number"
}
```

**Réponse:**
```json
{
  "id": "number",
  "date_creation": "string",
  "date_intervention": "string",
  "statut": "string",
  "description": "string",
  "technicien": {
    "id": "number",
    "nom": "string",
    "prenom": "string"
  },
  "patient": {
    "id": "number",
    "nom": "string",
    "prenom": "string"
  }
}
```

### PUT /api/interventions/{id}
Met à jour une intervention existante.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Corps de la requête:**
```json
{
  "date_intervention": "string",
  "description": "string",
  "statut": "string",
  "patient_id": "number",
  "technicien_id": "number"
}
```

**Réponse:**
```json
{
  "id": "number",
  "date_creation": "string",
  "date_intervention": "string",
  "statut": "string",
  "description": "string",
  "technicien": {
    "id": "number",
    "nom": "string",
    "prenom": "string"
  },
  "patient": {
    "id": "number",
    "nom": "string",
    "prenom": "string"
  }
}
```

### DELETE /api/interventions/{id}
Supprime une intervention.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Réponse:**
```json
{
  "message": "Intervention supprimée avec succès"
}
```

## Patients

### GET /api/patients
Récupère la liste des patients.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Paramètres de requête:**
- `page` (optionnel): Numéro de page (défaut: 1)
- `par_page` (optionnel): Nombre d'éléments par page (défaut: 10)
- `recherche` (optionnel): Terme de recherche

**Réponse:**
```json
{
  "patients": [
    {
      "id": "number",
      "nom": "string",
      "prenom": "string",
      "date_naissance": "string",
      "email": "string",
      "telephone": "string"
    }
  ],
  "total": "number",
  "pages": "number"
}
```

### POST /api/patients
Crée un nouveau patient.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Corps de la requête:**
```json
{
  "nom": "string",
  "prenom": "string",
  "date_naissance": "string",
  "email": "string",
  "telephone": "string"
}
```

**Réponse:**
```json
{
  "id": "number",
  "nom": "string",
  "prenom": "string",
  "date_naissance": "string",
  "email": "string",
  "telephone": "string"
}
```

### PUT /api/patients/{id}
Met à jour un patient existant.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Corps de la requête:**
```json
{
  "nom": "string",
  "prenom": "string",
  "date_naissance": "string",
  "email": "string",
  "telephone": "string"
}
```

**Réponse:**
```json
{
  "id": "number",
  "nom": "string",
  "prenom": "string",
  "date_naissance": "string",
  "email": "string",
  "telephone": "string"
}
```

### DELETE /api/patients/{id}
Supprime un patient.

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Réponse:**
```json
{
  "message": "Patient supprimé avec succès"
}
```

## Codes d'erreur

- 400: Requête invalide
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 500: Erreur serveur

## Notes

- Toutes les dates sont au format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- Les tokens JWT expirent après 1 heure pour l'access token et 30 jours pour le refresh token
- Les requêtes nécessitant une authentification doivent inclure le token dans le header Authorization 