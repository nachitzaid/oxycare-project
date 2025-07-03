# Dockerfile pour backend Flask compatible Fly.io
FROM python:3.12-slim

# Variables d'environnement pour Flask
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_ENV=production
ENV PORT=8080

# Dépendances système (ajuste selon tes besoins)
RUN apt-get update && apt-get install -y build-essential libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Crée le dossier de l'app
WORKDIR /app

# Copie les fichiers requirements
COPY requirements.txt ./

# Installe les dépendances Python
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copie tout le code
COPY . .

# Expose le port 5000 (Fly.io peut router n'importe quel port)
EXPOSE 5000

# Commande de démarrage (gunicorn sur le port 5000)
CMD ["gunicorn", "-b", ":5000", "wsgi:app"]
