from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from io import BytesIO
from datetime import datetime
import os

def checkbox(checked=False):
    return '☑' if checked else '☐'

def generate_intervention_pdf(intervention):
    """Génère une fiche contrôle PDF fidèle au modèle fourni"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=15*mm, leftMargin=15*mm, topMargin=15*mm, bottomMargin=10*mm)
    styles = getSampleStyleSheet()
    story = []

    # En-tête avec logo et infos fiche
    header_data = [
        [
            # Logo (à adapter selon le chemin réel du logo)
            Image(os.path.join(os.path.dirname(__file__), 'logo-respireair.png'), width=40*mm, height=15*mm),
            Paragraph('<b>Fiche Contrôle</b>', styles['Title']),
            Paragraph('''<para align=right><b>R02-F101-FI</b><br/>Version : 01<br/>Date : {date}<br/>Page : 1/1</para>'''.format(date=datetime.now().strftime('%d/%m/%Y')), styles['Normal'])
        ]
    ]
    header = Table(header_data, colWidths=[55*mm, 70*mm, 40*mm])
    header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('ALIGN', (2,0), (2,0), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(header)
    story.append(Spacer(1, 6))

    # Section : Informations sur le patient (afficher uniquement les champs renseignés)
    story.append(Paragraph('<b>INFORMATION SUR LE PATIENT</b>', styles['Heading4']))
    patient = intervention.patient
    patient_info = []
    if getattr(patient, 'nom', None):
        patient_info.append([f"Nom : {patient.nom}"])
    if getattr(patient, 'prenom', None):
        patient_info.append([f"Prénom : {patient.prenom}"])
    if getattr(patient, 'date_naissance', None):
        patient_info.append([f"Date de naissance : {patient.date_naissance}"])
    if getattr(patient, 'adresse', None):
        patient_info.append([f"Adresse : {patient.adresse}"])
    if getattr(patient, 'telephone', None):
        patient_info.append([f"Téléphone : {patient.telephone}"])
    if getattr(patient, 'mutuelle', None):
        patient_info.append([f"Mutuelle : {patient.mutuelle}"])
    if getattr(intervention, 'technicien', None) and getattr(intervention.technicien, 'nom', None):
        patient_info.append([f"Technicien : {intervention.technicien.nom}"])
    if patient_info:
        t = Table(patient_info, colWidths=[180*mm])
        t.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 6))

    # Section : Information sur le traitement prescrit (texte uniquement)
    if getattr(intervention, 'traitement', None) or getattr(intervention, 'type_intervention', None):
        story.append(Paragraph('<b>INFORMATION SUR LE TRAITEMENT PRESCRIT</b>', styles['Heading4']))
        traitement_info = []
        if getattr(intervention, 'traitement', None):
            traitement_info.append([f"Traitement prescrit : {intervention.traitement}"])
        if getattr(intervention, 'type_intervention', None):
            traitement_info.append([f"Type d'intervention : {intervention.type_intervention}"])
        # Champs spécifiques selon le traitement
        if getattr(intervention, 'traitement', None) == 'OXYGENOTHERAPIE':
            if getattr(intervention, 'parametres', None):
                debit = intervention.parametres.get('debit_oxygene')
                if debit:
                    traitement_info.append([f"Débit d'oxygène (L/min) : {debit}"])
            if getattr(intervention, 'type_concentrateur', None):
                traitement_info.append([f"Type de concentrateur : {intervention.type_concentrateur}"])
        if getattr(intervention, 'traitement', None) in ['VENTILATION', 'PPC']:
            if getattr(intervention, 'mode_ventilation', None):
                traitement_info.append([f"Mode de ventilation : {intervention.mode_ventilation}"])
            if getattr(intervention, 'type_masque', None):
                traitement_info.append([f"Type de masque : {intervention.type_masque}"])
        t = Table(traitement_info, colWidths=[180*mm])
        t.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 6))

    # Section : Information sur le dispositif (afficher uniquement si renseigné)
    if getattr(intervention, 'dispositif', None):
        story.append(Paragraph('<b>INFORMATION SUR LE DISPOSITIF</b>', styles['Heading4']))
        dispositif = intervention.dispositif
        dispositif_info = []
        if getattr(dispositif, 'designation', None):
            dispositif_info.append([f"Désignation : {dispositif.designation}"])
        if getattr(dispositif, 'reference', None):
            dispositif_info.append([f"Référence : {dispositif.reference}"])
        if getattr(dispositif, 'numero_serie', None):
            dispositif_info.append([f"Numéro de série : {dispositif.numero_serie}"])
        t = Table(dispositif_info, colWidths=[180*mm])
        t.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 6))

    # Section : Réglages (afficher uniquement si renseigné)
    if getattr(intervention, 'reglage', None):
        reglage = intervention.reglage
        reglage_info = []
        if getattr(reglage, 'pmax', None):
            reglage_info.append([f"Pmax : {reglage.pmax}"])
        if getattr(reglage, 'pmin', None):
            reglage_info.append([f"Pmin : {reglage.pmin}"])
        if getattr(reglage, 'pramp', None):
            reglage_info.append([f"P ramp : {reglage.pramp}"])
        if getattr(reglage, 'hu', None):
            reglage_info.append([f"HU : {reglage.hu}"])
        if getattr(reglage, 're', None):
            reglage_info.append([f"RE : {reglage.re}"])
        if reglage_info:
            t = Table(reglage_info, colWidths=[180*mm])
            t.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            story.append(t)
            story.append(Spacer(1, 6))

    # Section : Consommables utilisés (afficher uniquement ceux utilisés)
    if getattr(intervention, 'consommables_utilises', None):
        consommables = intervention.consommables_utilises
        consommables_utilises = [k for k, v in consommables.items() if v]
        if consommables_utilises:
            story.append(Paragraph('<b>CONSOMMABLES UTILISÉS</b>', styles['Heading4']))
            consommables_info = [[c] for c in consommables_utilises]
            t = Table(consommables_info, colWidths=[180*mm])
            t.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            story.append(t)
            story.append(Spacer(1, 6))

    # Section : Vérifications de sécurité et Tests effectués (côte à côte)
    verifs = []
    tests = []
    if getattr(intervention, 'verification_securite', None):
        verifs = [k for k, v in intervention.verification_securite.items() if v is True or v == 1]
    if getattr(intervention, 'tests_effectues', None):
        tests = [k for k, v in intervention.tests_effectues.items() if v is True or v == 1]
    if verifs or tests:
        story.append(Paragraph('<b>VÉRIFICATIONS ET TESTS EFFECTUÉS</b>', styles['Heading4']))
        max_len = max(len(verifs), len(tests))
        rows = []
        for i in range(max_len):
            left = verifs[i] if i < len(verifs) else ''
            right = tests[i] if i < len(tests) else ''
            rows.append([left, right])
        t = Table(rows, colWidths=[90*mm, 90*mm])
        t.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 6))

    # Section : Remarques (si renseigné)
    if getattr(intervention, 'remarques', None):
        story.append(Paragraph('<b>REMARQUES</b>', styles['Heading4']))
        story.append(Paragraph(intervention.remarques, styles['Normal']))
        story.append(Spacer(1, 6))

    # Section : Signatures (toujours afficher la ligne, technicien à gauche, patient à droite)
    t = Table([
        ['Signature Technicien', 'Signature Patient']
    ], colWidths=[90*mm, 90*mm])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)
    return buffer 