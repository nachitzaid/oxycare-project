export type InterventionType = 'OXYGENOTHERAPIE' | 'VENTILATION' | 'PPC' | 'POLYGRAPHIE' | 'POLYSOMNOGRAPHIE';
export type InterventionStatus = 'planifiee' | 'en_cours' | 'terminee' | 'patient_absent' | 'annulee' | 'reportee' | 'partielle';

export interface Reglage {
  pmax: number | null;
  pmin: number | null;
  pramp: number | null;
  hu: number | null;
  re: number | null;
  commentaire: string;
}

export interface Patient {
  id: number;
  code_patient: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
}

export interface Intervention {
  id: number;
  patient_id: number;
  dispositif_id: number;
  technicien_id: number;
  reglage_id: number | null;
  traitement: InterventionType;
  type_intervention: string;
  date_planifiee: string;
  date_reelle: string | null;
  lieu: string;
  etat_materiel: string | null;
  type_concentrateur: string | null;
  mode_ventilation: string | null;
  type_masque: string | null;
  statut: InterventionStatus;
  actions_effectuees: Record<string, any> | null;
  accessoires_utilises: Record<string, any> | null;
  photos: string[] | null;
  signature_technicien: string | null;
  rapport_pdf_url: string | null;
  remarques: string | null;
  motif_annulation: string | null;
  date_reprogrammation: string | null;
  date_creation: string;
  date_modification: string;
  parametres: Record<string, any> | null;
  reglage: Reglage | null;
  verification_securite: Record<string, boolean> | null;
  tests_effectues: Record<string, boolean> | null;
  consommables_utilises: Record<string, number> | null;
  maintenance_preventive: boolean;
  date_prochaine_maintenance: string | null;
  planifiee: boolean;
  temps_prevu: number;
  temps_reel: number | null;
  satisfaction_technicien: number | null;
  satisfaction_patient: number | null;
  commentaire: string | null;
  patient?: Patient;
  dispositif?: any;
  technicien?: any;
}

export interface InterventionFormData {
  traitement: InterventionType;
  type_intervention: string;
  type_concentrateur?: string;
  mode_ventilation?: string;
  type_masque?: string;
  remarques?: string;
  statut: InterventionStatus;
  parametres: Record<string, any>;
  photos: string[];
  signature: string | null;
  rapport_pdf: string | null;
  reglage: {
    pmax: string;
    pmin: string;
    pramp: string;
    hu: string;
    re: string;
    commentaire: string;
  };
  verification_securite: Record<string, boolean>;
  tests_effectues: Record<string, boolean>;
  consommables_utilises: Record<string, number>;
  maintenance_preventive: boolean;
  date_prochaine_maintenance: string;
}

export interface InterventionUpdateData extends Omit<InterventionFormData, 'reglage'> {
  technicien_id?: number;
  reglage: {
    pmax: number | null;
    pmin: number | null;
    pramp: number | null;
    hu: number | null;
    re: number | null;
    commentaire: string;
  };
} 