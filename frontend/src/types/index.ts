export interface User {
    id: number;
    nom_utilisateur: string;
    email: string;
    nom: string;
    prenom: string;
    role: 'admin' | 'technicien';
    date_creation: string;
    est_actif: boolean;
  }
  
  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface Patient {
    id: number;
    code_patient?: string;
    nom: string;
    prenom: string;
    cin?: string;
    date_naissance: string;
    telephone: string;
    email?: string;
    adresse?: string;
    ville?: string;
    mutuelle?: string;
    prescripteur_nom?: string;
    prescripteur_id?: number;
    technicien_id?: number;
    date_creation: string;
    date_modification?: string;
  }
  
  export interface LoginResponse {
    message: string;
    utilisateur: User;
    access_token: string;
    refresh_token: string;
  }
  export interface Prescripteur {
    id: number;
    nom: string;
    prenom: string;
    specialite: string;
    telephone: string;
    email: string;
    date_creation: string;
  }
  
  export interface DispositifMedical {
    id: number;
    patient_id: number;
    designation: string;
    reference: string;
    numero_serie: string;
    type_acquisition: 'location' | 'achat_garantie' | 'achat_externe' | 'achat_oxylife';
    date_acquisition: string;
    date_fin_garantie: string | null;
    duree_location: number | null;
    date_fin_location: string | null;
    statut: 'actif' | 'en_maintenance' | 'retiré';
    est_sous_garantie: boolean;
    est_location_active: boolean;
  }
  
  export interface Accessoire {
    id: number;
    dispositif_id: number;
    designation: string;
    reference: string;
    numero_lot: string;
    date_creation: string;
  }
  
  export interface Consommable {
    id: number;
    dispositif_id: number;
    designation: string;
    reference: string;
    numero_lot: string;
    date_peremption: string | null;
    date_creation: string;
  }
  
  export interface PaginatedResponse<T> {
    total: number;
    page_courante: number;
    pages_totales: number;
    resultats_par_page: number;
    total_resultats: number;
    items: T[];
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
  }
