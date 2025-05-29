"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Search, Eye, RefreshCw, AlertCircle, CheckCircle, Calendar, Clock, User, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/contexts/AuthContext";
// Import conditionnel pour éviter les erreurs
import dynamic from "next/dynamic";

// Import dynamique des composants qui pourraient causer des problèmes
const InterventionDetails = dynamic(() => import("@/components/interventions/InterventionDetails"), {
  ssr: false,
  loading: () => <div>Chargement...</div>
});

// Types
interface Patient {
  id: number;
  code_patient: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
}

interface DispositifMedical {
  id: number;
  designation: string;
  reference: string;
  numero_serie: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Intervention {
  id: number;
  patient_id: number;
  dispositif_id: number;
  technicien_id: number;
  type_intervention: string;
  planifiee: boolean;
  date_planifiee: string | null;
  date_reelle: string | null;
  temps_prevu: number | null;
  temps_reel: number | null;
  actions_effectuees: any;
  satisfaction_technicien: number | null;
  signature_patient: boolean;
  signature_responsable: boolean;
  commentaire: string | null;
  date_creation: string | null;
  patient?: Patient;
  dispositif?: DispositifMedical;
  technicien?: Utilisateur;
}

const MyInterventions = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingIntervention, setViewingIntervention] = useState<Intervention | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [mounted, setMounted] = useState(false);
  
  const { user, isLoading: authLoading } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Vérifier que le composant est monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generic API request function avec gestion d'erreur améliorée
  const makeRequest = async (url: string, options: any = {}) => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      throw new Error('Cette fonction ne peut être utilisée que côté client');
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${API_BASE_URL}${url}`);
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      if (!response.ok) {
        // Gérer les différents codes d'erreur
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        } else if (response.status === 403) {
          throw new Error('Accès non autorisé');
        } else if (response.status === 404) {
          throw new Error('Ressource non trouvée');
        } else if (response.status >= 500) {
          throw new Error('Erreur serveur, veuillez réessayer plus tard');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`Erreur requête ${url}:`, error);
      throw error;
    }
  };

  // Show success/error messages
  const showMessage = (message: string, type: "success" | "error") => {
    console.log(`${type.toUpperCase()}: ${message}`);
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Fetch technician's interventions avec gestion d'erreur améliorée
  const fetchMyInterventions = async (search = "") => {
    if (!user?.id) {
      showMessage("Utilisateur non identifié", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("technicien_id", user.id.toString());
      if (search.trim()) {
        params.append("recherche", search.trim());
      }
      
      console.log('Fetching interventions with params:', params.toString());
      const data = await makeRequest(`/interventions?${params.toString()}`);
      
      console.log('API Response:', data);
      
      if (data.success && data.data && Array.isArray(data.data.items)) {
        const cleanedInterventions = data.data.items.map((intervention: any) => ({
          id: intervention.id,
          patient_id: intervention.patient_id,
          dispositif_id: intervention.dispositif_id,
          technicien_id: intervention.technicien_id,
          type_intervention: intervention.type_intervention || 'Non défini',
          planifiee: Boolean(intervention.planifiee),
          date_planifiee: intervention.date_planifiee,
          date_reelle: intervention.date_reelle,
          temps_prevu: intervention.temps_prevu,
          temps_reel: intervention.temps_reel,
          actions_effectuees: intervention.actions_effectuees,
          satisfaction_technicien: intervention.satisfaction_technicien,
          signature_patient: Boolean(intervention.signature_patient),
          signature_responsable: Boolean(intervention.signature_responsable),
          commentaire: intervention.commentaire,
          date_creation: intervention.date_creation,
          patient: intervention.patient || null,
          dispositif: intervention.dispositif || null,
          technicien: intervention.technicien || null,
        }));
        
        console.log('Cleaned interventions:', cleanedInterventions);
        setInterventions(cleanedInterventions);
      } else if (data.success && (!data.data || !data.data.items)) {
        // Cas où il n'y a pas d'interventions
        setInterventions([]);
      } else {
        throw new Error(data.message || "Erreur lors du chargement de vos interventions");
      }
    } catch (err) {
      console.error('Error fetching interventions:', err);
      showMessage(err instanceof Error ? err.message : "Erreur lors du chargement de vos interventions", "error");
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle calendar event click
  const handleEventClick = (info: any) => {
    const intervention = interventions.find((int) => int.id.toString() === info.event.id);
    if (intervention) {
      setViewingIntervention(intervention);
    }
  };

  // Format events for FullCalendar avec vérification
  const calendarEvents = interventions
    .filter(intervention => intervention.date_planifiee) // Filtrer les interventions sans date
    .map((intervention) => ({
      id: intervention.id.toString(),
      title: `${intervention.type_intervention} - ${intervention.patient ? `${intervention.patient.prenom} ${intervention.patient.nom}` : "Patient inconnu"}`,
      start: intervention.date_planifiee,
      end: intervention.date_planifiee && intervention.temps_prevu
        ? new Date(new Date(intervention.date_planifiee).getTime() + intervention.temps_prevu * 60 * 1000).toISOString()
        : intervention.date_planifiee,
      backgroundColor: getEventColor(intervention),
      borderColor: getEventBorderColor(intervention),
      extendedProps: {
        intervention,
      },
    }));

  // Get event colors based on status
  const getEventColor = (intervention: Intervention) => {
    if (intervention.date_reelle) return "#10b981"; // Green for completed
    if (intervention.planifiee) return "#3b82f6"; // Blue for planned
    return "#f59e0b"; // Amber for pending
  };

  const getEventBorderColor = (intervention: Intervention) => {
    if (intervention.date_reelle) return "#059669";
    if (intervention.planifiee) return "#2563eb";
    return "#d97706";
  };

  // Get status badge
  const getStatusBadge = (intervention: Intervention) => {
    if (intervention.date_reelle) {
      return <Badge className="bg-green-100 text-green-800">Terminée</Badge>;
    } else if (intervention.planifiee) {
      return <Badge className="bg-blue-100 text-blue-800">Planifiée</Badge>;
    } else {
      return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
    }
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    const typeStyles = {
      installation: "bg-purple-100 text-purple-800",
      controle: "bg-blue-100 text-blue-800",
      entretien: "bg-green-100 text-green-800",
      changement_filtre: "bg-amber-100 text-amber-800",
      reparation: "bg-red-100 text-red-800",
      remplacement: "bg-orange-100 text-orange-800",
    } as const;
    
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_') as keyof typeof typeStyles;
    
    return (
      <Badge className={typeStyles[normalizedType] || "bg-gray-100 text-gray-800"}>
        {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  // Format date avec gestion d'erreur
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Date invalide";
    }
  };

  // Filter interventions based on search term
  const filteredInterventions = interventions.filter((intervention) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      intervention.type_intervention.toLowerCase().includes(searchLower) ||
      (intervention.patient && 
        (`${intervention.patient.prenom} ${intervention.patient.nom}`.toLowerCase().includes(searchLower) ||
         intervention.patient.code_patient.toLowerCase().includes(searchLower))) ||
      (intervention.dispositif && 
        (intervention.dispositif.designation.toLowerCase().includes(searchLower) ||
         intervention.dispositif.reference.toLowerCase().includes(searchLower)))
    );
  });

  // Initial data fetch avec vérification de l'utilisateur
  useEffect(() => {
    if (mounted && !authLoading && user?.id) {
      console.log('User loaded, fetching interventions for user:', user);
      fetchMyInterventions();
    }
  }, [user, authLoading, mounted]);

  // Ne pas rendre tant que le composant n'est pas monté côté client
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  // Attendre le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Vérification de l'authentification...</span>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Authentification requise
          </h3>
          <p className="text-gray-500">
            Veuillez vous connecter pour accéder à vos interventions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mes Interventions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {loading ? "Chargement..." : `${interventions.length} intervention(s) assignée(s)`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setViewMode(viewMode === "calendar" ? "list" : "calendar")} 
              variant="outline"
            >
              {viewMode === "calendar" ? "Vue Liste" : "Vue Calendrier"}
            </Button>
            <Button 
              onClick={() => fetchMyInterventions(searchTerm)} 
              disabled={loading} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par patient, dispositif ou type..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement de vos interventions...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {viewMode === "calendar" ? (
            /* Calendar View */
            <Card>
              <CardContent className="p-6">
                {filteredInterventions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                      <Calendar className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {searchTerm ? "Aucun résultat" : "Aucune intervention"}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `Aucune intervention trouvée pour "${searchTerm}"`
                        : "Vous n'avez aucune intervention assignée pour le moment."
                      }
                    </p>
                  </div>
                ) : (
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    editable={false}
                    selectable={false}
                    locale="fr"
                    height="auto"
                    firstDay={1}
                    buttonText={{
                      today: "Aujourd'hui",
                      month: "Mois",
                      week: "Semaine",
                      day: "Jour",
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredInterventions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-2">
                      <Search className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {searchTerm ? "Aucun résultat" : "Aucune intervention"}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `Aucune intervention trouvée pour "${searchTerm}"`
                        : "Vous n'avez aucune intervention assignée pour le moment."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredInterventions.map((intervention) => (
                  <Card key={intervention.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeBadge(intervention.type_intervention)}
                            {getStatusBadge(intervention)}
                          </div>
                          <CardTitle className="text-lg">
                            {intervention.patient 
                              ? `${intervention.patient.prenom} ${intervention.patient.nom}`
                              : `Patient #${intervention.patient_id}`
                            }
                          </CardTitle>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingIntervention(intervention)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500">Date planifiée</p>
                            <p className="font-medium">{formatDate(intervention.date_planifiee)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500">Dispositif</p>
                            <p className="font-medium">
                              {intervention.dispositif 
                                ? intervention.dispositif.designation
                                : `Dispositif #${intervention.dispositif_id}`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500">Durée prévue</p>
                            <p className="font-medium">
                              {intervention.temps_prevu ? `${intervention.temps_prevu} min` : "Non définie"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {intervention.commentaire && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Commentaire:</strong> {intervention.commentaire}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Intervention Details Modal */}
      {viewingIntervention && (
        <InterventionDetails
          intervention={viewingIntervention}
          onClose={() => setViewingIntervention(null)}
        />
      )}
    </div>
  );
};

export default MyInterventions;