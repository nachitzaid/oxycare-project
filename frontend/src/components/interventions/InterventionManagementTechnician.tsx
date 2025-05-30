"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useInterventions } from "@/hooks/useInterventions";
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
  dispositif?: any;
  technicien?: any;
}

const InterventionManagementTechnician = () => {
  const { user, isAuthenticated, isTechnician, loading: authLoading } = useAuth();
  const { 
    interventions, 
    loading, 
    error, 
    success, 
    fetchInterventions, 
    makeRequest, 
    showMessage 
  } = useInterventions();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingIntervention, setViewingIntervention] = useState<Intervention | null>(null);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

  // Initial data fetch
  useEffect(() => {
    let mounted = true;
    if (!authLoading && isAuthenticated() && isTechnician() && mounted) {
      fetchInterventions();
    }
    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated, isTechnician]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchInterventions(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle intervention edit
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

  // Filter interventions for current technician
  const myInterventions = interventions.filter(
    (intervention) => intervention.technicien_id === user?.id
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Interventions</h1>
            <p className="text-gray-600 mt-1">
              {myInterventions.length > 0 ? `${myInterventions.length} intervention(s) trouvée(s)` : "Aucune intervention"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => fetchInterventions(searchTerm)} disabled={loading} variant="outline" className="flex items-center gap-2">
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
            placeholder="Rechercher une intervention..."
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

      {/* Interventions List */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myInterventions.map((intervention) => (
            <Card key={intervention.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {intervention.type_intervention}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {intervention.patient
                        ? `${intervention.patient.prenom} ${intervention.patient.nom}`
                        : `Patient #${intervention.patient_id}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingIntervention(intervention)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingIntervention(intervention)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Date prévue:</span>{" "}
                    {intervention.date_planifiee
                      ? new Date(intervention.date_planifiee).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Non définie"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Statut:</span>{" "}
                    {intervention.planifiee ? "Planifiée" : "En cours"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {editingIntervention && (
        <Modal isOpen={true} onClose={() => setEditingIntervention(null)} title="Modifier l'intervention" size="lg">
          <InterventionForm
            mode="edit"
            intervention={editingIntervention}
            onSubmit={handleEditIntervention}
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
        />
      )}
    </div>
  );
};

export default InterventionManagementTechnician; 