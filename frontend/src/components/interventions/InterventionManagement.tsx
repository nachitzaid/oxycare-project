"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useInterventions } from "@/hooks/useInterventions";
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
import { Intervention, InterventionStatus } from '@/types/intervention';
import { useToast } from '@/components/ui/use-toast';
import { InterventionList } from './InterventionList';

const InterventionManagementAdmin = () => {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { 
    interventions, 
    loading, 
    error, 
    success, 
    fetchInterventions, 
    createIntervention,
    makeRequest, 
    showMessage,
    pagination,
    updateIntervention,
    deleteIntervention
  } = useInterventions();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [viewingIntervention, setViewingIntervention] = useState<Intervention | null>(null);
  const [deletingIntervention, setDeletingIntervention] = useState<Intervention | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InterventionStatus | ''>('');
  const router = useRouter();
  const { toast } = useToast();

  // Redirect non-admins or unauthenticated users
  useEffect(() => {
    if (!authLoading && (!isAuthenticated() || !isAdmin())) {
      router.push("/login?redirect=/interventions");
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const data = await makeRequest("/debug/patients");
      if (data.success && Array.isArray(data.data)) {
        setPatients(data.data);
      } else {
        showMessage(data.message || "Erreur lors de la récupération des patients", "error");
      }
    } catch (error) {
      showMessage("Erreur lors de la récupération des patients", "error");
    }
  };

  // Initial data fetch
  useEffect(() => {
    let mounted = true;
    if (!authLoading && isAuthenticated() && isAdmin() && mounted) {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchInterventions(),
            fetchPatients()
          ]);
        } catch (error) {
          console.error("Erreur lors du chargement initial:", error);
        }
      };
      loadData();
    }
    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated, isAdmin]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchInterventions(1, pagination.perPage, { recherche: searchTerm });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle intervention creation
  const handleCreateIntervention = async (interventionData: Partial<Intervention>) => {
    try {
      const result = await createIntervention({
        patient_id: interventionData.patient_id!,
        dispositif_id: interventionData.dispositif_id!,
        date_intervention: interventionData.date_planifiee!,
        type_intervention: interventionData.type_intervention!,
        technicien_id: interventionData.technicien_id,
        statut: interventionData.planifiee ? "planifiée" : "en cours",
        description: interventionData.commentaire || undefined,
        notes: interventionData.commentaire || undefined
      });

      if (result) {
        setShowCreateModal(false);
        await fetchInterventions(searchTerm);
      }
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      showMessage(err instanceof Error ? err.message : "Erreur lors de la création de l'intervention", "error");
    }
  };

  // Handle intervention edit
  const handleUpdate = async (editingIntervention: Intervention) => {
    try {
      const response = await updateIntervention(editingIntervention);
      if (response.success) {
        showMessage("Intervention mise à jour avec succès", "success");
        await fetchInterventions();
      } else {
        throw new Error(response.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      showMessage(error instanceof Error ? error.message : "Une erreur est survenue", "error");
    }
  };

  // Handle intervention deletion
  const handleDelete = async (interventionId: number) => {
    try {
      const response = await deleteIntervention(interventionId);
      if (response.success) {
        showMessage("Intervention supprimée avec succès", "success");
        await fetchInterventions();
      } else {
        throw new Error(response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showMessage(error instanceof Error ? error.message : "Une erreur est survenue", "error");
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
    start: intervention.date_planifiee || undefined,
    end: intervention.date_planifiee
      ? new Date(new Date(intervention.date_planifiee).getTime() + (intervention.temps_prevu || 60) * 60 * 1000)
      : undefined,
    backgroundColor: intervention.planifiee ? "#3b82f6" : "#ef4444",
    borderColor: intervention.planifiee ? "#2563eb" : "#dc2626",
    extendedProps: {
      intervention,
    },
  }));

  // Skip render until auth is resolved
  if (authLoading || !isAuthenticated() || !isAdmin()) {
    return null;
  }

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
            onChange={(e) => setSearchTerm(e.target.value)}
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
        <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Nouvelle Intervention" size="lg">
          <InterventionForm
            mode="create"
            onSubmit={handleCreateIntervention}
            onClose={() => setShowCreateModal(false)}
          />
        </Modal>
      )}

      {editingIntervention && (
        <Modal isOpen={true} onClose={() => setEditingIntervention(null)} title="Modifier l'intervention" size="lg">
          <InterventionForm
            mode="edit"
            intervention={editingIntervention}
            onSubmit={handleUpdate}
            onClose={() => setEditingIntervention(null)}
          />
        </Modal>
      )}

      {viewingIntervention && (
        <InterventionDetails
          intervention={viewingIntervention}
          onClose={() => setViewingIntervention(null)}
          onEdit={(intervention) => {
            setViewingIntervention(null);
            setEditingIntervention(intervention);
          }}
          onDelete={handleDelete}
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
              <Button onClick={() => handleDelete(deletingIntervention.id)} variant="destructive">
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