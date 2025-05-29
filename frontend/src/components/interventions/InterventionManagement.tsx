"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Modal from "../common/Modal";
import InterventionForm from "./InterventionForm";
import InterventionDetails from "./InterventionDetails";

// Types
interface Patient {
  id: number;
  code_patient: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
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

interface ApiResponse {
  success?: boolean;
  data?: any;
  message?: string;
  errors?: any;
}

const InterventionManagementAdmin = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [viewingIntervention, setViewingIntervention] = useState<Intervention | null>(null);
  const [deletingIntervention, setDeletingIntervention] = useState<Intervention | null>(null);

  const API_BASE_URL = "http://localhost:5000/api";

  // Generic API request function
  const makeRequest = async (url: string, options: any = {}) => {
    const token = localStorage.getItem("token");
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
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
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Fetch interventions
  const fetchInterventions = async (search = "") => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("recherche", search);
      const data = await makeRequest(`/interventions?${params.toString()}`);
      if (data.success && Array.isArray(data.data.items)) {
        const cleanedInterventions = data.data.items.map((intervention: any) => ({
          id: intervention.id,
          patient_id: intervention.patient_id,
          dispositif_id: intervention.dispositif_id,
          technicien_id: intervention.technicien_id,
          type_intervention: intervention.type_intervention,
          planifiee: intervention.planifiee,
          date_planifiee: intervention.date_planifiee,
          date_reelle: intervention.date_reelle,
          temps_prevu: intervention.temps_prevu,
          temps_reel: intervention.temps_reel,
          actions_effectuees: intervention.actions_effectuees,
          satisfaction_technicien: intervention.satisfaction_technicien,
          signature_patient: intervention.signature_patient,
          signature_responsable: intervention.signature_responsable,
          commentaire: intervention.commentaire,
          date_creation: intervention.date_creation,
          patient: intervention.patient || null,
          dispositif: intervention.dispositif || null,
          technicien: intervention.technicien || null,
        }));
        setInterventions(cleanedInterventions);
      } else {
        throw new Error(data.message || "Erreur lors du chargement des interventions");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors du chargement des interventions", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const data = await makeRequest("/debug/patients");
      if (data.success && Array.isArray(data.patients)) {
        setPatients(data.patients);
      } else {
        showMessage(data.message || "Erreur lors de la récupération des patients", "error");
      }
    } catch (error) {
      showMessage("Erreur lors de la récupération des patients", "error");
    }
  };

  // Create intervention
  const handleCreateIntervention = async (interventionData: Partial<Intervention>) => {
    try {
      const response = await makeRequest("/interventions", {
        method: "POST",
        body: JSON.stringify(interventionData),
      });

      if (response.success) {
        showMessage("Intervention créée avec succès", "success");
        setShowCreateModal(false);
        await fetchInterventions(searchTerm);
      } else {
        throw new Error(response.message || "Erreur lors de la création");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la création de l'intervention", "error");
    }
  };

  // Edit intervention
  const handleEditIntervention = async (interventionData: Partial<Intervention>) => {
    if (!editingIntervention) return;

    try {
      const response = await makeRequest(`/interventions/${editingIntervention.id}`, {
        method: "PUT",
        body: JSON.stringify(interventionData),
      });

      if (response.success) {
        showMessage("Intervention modifiée avec succès", "success");
        setEditingIntervention(null);
        await fetchInterventions(searchTerm);
      } else {
        throw new Error(response.message || "Erreur lors de la modification");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la modification de l'intervention", "error");
    }
  };

  // Delete intervention
  const handleDeleteIntervention = async () => {
    if (!deletingIntervention) return;

    try {
      const response = await makeRequest(`/interventions/${deletingIntervention.id}`, {
        method: "DELETE",
      });

      if (response.success) {
        showMessage("Intervention supprimée avec succès", "success");
        setDeletingIntervention(null);
        await fetchInterventions(searchTerm);
      } else {
        throw new Error(response.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la suppression de l'intervention", "error");
    }
  };

  // Handle calendar event click
  const handleEventClick = (info: any) => {
    const intervention = interventions.find((int) => int.id.toString() === info.event.id);
    if (intervention) {
      setViewingIntervention(intervention);
    }
  };

  // Handle date click to create new intervention
  const handleDateClick = (info: any) => {
    setShowCreateModal(true);
    setEditingIntervention(null);
  };

  // Format events for FullCalendar
  const calendarEvents = interventions.map((intervention) => ({
    id: intervention.id.toString(),
    title: `${intervention.type_intervention} - ${intervention.patient ? `${intervention.patient.prenom} ${intervention.patient.nom}` : "Patient inconnu"}`,
    start: intervention.date_planifiee,
    end: intervention.date_planifiee
      ? new Date(new Date(intervention.date_planifiee).getTime() + (intervention.temps_prevu || 60) * 60 * 1000)
      : null,
    backgroundColor: intervention.planifiee ? "#3b82f6" : "#ef4444",
    borderColor: intervention.planifiee ? "#2563eb" : "#dc2626",
    extendedProps: {
      intervention,
    },
  }));

  // Initial data fetch
  useEffect(() => {
    fetchInterventions();
    fetchPatients();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Interventions (Admin)</h1>
            <p className="text-gray-600 mt-1">
              {interventions.length > 0 ? `${interventions.length} intervention(s) trouvée(s)` : "Chargement..."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => fetchInterventions(searchTerm)} disabled={loading} variant="outline" className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle Intervention
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchInterventions(e.target.value);
            }}
            placeholder="Rechercher par patient, dispositif ou technicien..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement des interventions...</span>
          </div>
        </div>
      )}

      {/* Calendar */}
      {!loading && (
        <Card>
          <CardContent className="p-6">
            {interventions.length === 0 && searchTerm ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun résultat</h3>
                <p className="text-gray-500">Aucune intervention trouvée pour "{searchTerm}"</p>
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
                dateClick={handleDateClick}
                editable={true}
                selectable={true}
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
      )}

      {/* Modals */}
      {showCreateModal && (
        <InterventionForm
          mode="create"
          intervention={null}
          onSubmit={handleCreateIntervention}
          onClose={() => setShowCreateModal(false)}
          patients={patients}
        />
      )}

      {editingIntervention && (
        <InterventionForm
          mode="edit"
          intervention={editingIntervention}
          onSubmit={handleEditIntervention}
          onClose={() => setEditingIntervention(null)}
          patients={patients}
        />
      )}

      {viewingIntervention && (
        <InterventionDetails
          intervention={viewingIntervention}
          onClose={() => setViewingIntervention(null)}
        />
      )}

      {deletingIntervention && (
        <Modal isOpen={true} onClose={() => setDeletingIntervention(null)} title="Confirmer la suppression">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Êtes-vous sûr de vouloir supprimer cette intervention ?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {deletingIntervention.type_intervention} -{" "}
                  {deletingIntervention.patient
                    ? `${deletingIntervention.patient.prenom} ${deletingIntervention.patient.nom}`
                    : "Patient inconnu"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Cette action est irréversible et supprimera définitivement toutes les données associées à cette intervention.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setDeletingIntervention(null)} variant="outline">
                Annuler
              </Button>
              <Button onClick={handleDeleteIntervention} variant="destructive">
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InterventionManagementAdmin;