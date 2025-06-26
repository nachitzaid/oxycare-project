import { InterventionType } from '@/types/intervention';

export const INTERVENTION_TYPES: Record<InterventionType, {
  name: string;
  types: string[];
}> = {
  OXYGENOTHERAPIE: {
    name: "Oxygénothérapie",
    types: [
      "Installation",
      "Réglage",
      "Entretien",
      "Remplacement",
      "Contrôle",
      "Changement de paramètres",
      "Ajustement masque",
      "Tirage de rapport"
    ]
  },
  VENTILATION: {
    name: "Ventilation",
    types: [
      "Installation",
      "Réglage",
      "Entretien",
      "Contrôle",
      "Changement de paramètres",
      "Ajustement masque",
      "Tirage de rapport"
    ]
  },
  PPC: {
    name: "PPC",
    types: [
      "Installation",
      "Réglage",
      "Remplacement",
      "Entretien",
      "Contrôle",
      "Changement de paramètres",
      "Ajustement masque",
      "Tirage de rapport"
    ]
  },
  POLYGRAPHIE: {
    name: "Polygraphie",
    types: [
      "Installation",
      "Désinstallation"
    ]
  },
  POLYSOMNOGRAPHIE: {
    name: "Polysomnographie (PSG)",
    types: [
      "Installation",
      "Désinstallation"
    ]
  }
};

export const VERIFICATIONS_SECURITE: Record<InterventionType, string[]> = {
  OXYGENOTHERAPIE: [
    "Vérification des connexions",
    "Test des alarmes",
    "Vérification des filtres",
    "Contrôle des débits",
    "Vérification de l'humidification"
  ],
  VENTILATION: [
    "Test des alarmes",
    "Vérification des circuits",
    "Contrôle des pressions",
    "Test des capteurs",
    "Vérification des batteries"
  ],
  PPC: [
    "Test des alarmes",
    "Vérification des circuits",
    "Contrôle des pressions",
    "Test des capteurs",
    "Vérification des batteries"
  ],
  POLYGRAPHIE: [
    "Vérification des connexions",
    "Test des capteurs",
    "Vérification de la batterie",
    "Test de l'enregistrement"
  ],
  POLYSOMNOGRAPHIE: [
    "Vérification des connexions",
    "Test des capteurs",
    "Vérification de la batterie",
    "Test de l'enregistrement",
    "Vérification des canaux"
  ]
};

export const TESTS_EFFECTUES: Record<InterventionType, string[]> = {
  OXYGENOTHERAPIE: [
    "Test de débit",
    "Test d'alarmes",
    "Test d'humidification",
    "Test de batterie",
    "Test de concentration"
  ],
  VENTILATION: [
    "Test de pressions",
    "Test de volumes",
    "Test d'alarmes",
    "Test de synchronisation",
    "Test de fuites"
  ],
  PPC: [
    "Test de pressions",
    "Test de fuites",
    "Test d'alarmes",
    "Test d'humidification",
    "Test de synchronisation"
  ],
  POLYGRAPHIE: [
    "Test de signal",
    "Test d'enregistrement",
    "Test de batterie",
    "Test de synchronisation"
  ],
  POLYSOMNOGRAPHIE: [
    "Test de signal",
    "Test d'enregistrement",
    "Test de batterie",
    "Test de synchronisation",
    "Test des canaux"
  ]
};

export const CONSOMMABLES = {
  filtres: "Filtres",
  tuyaux: "Tuyaux",
  masques: "Masques",
  humidificateurs: "Humidificateurs",
  batteries: "Batteries",
  capteurs: "Capteurs"
}; 