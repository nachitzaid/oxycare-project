"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useInterventions } from "@/hooks/useInterventions";
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Modal from "../common/Modal";
import InterventionForm from "./InterventionForm";
import InterventionDetails from "./InterventionDetails";
import { Intervention, InterventionStatus, InterventionUpdateData } from '@/types/intervention';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { InterventionList } from './InterventionList';

const InterventionManagementTechnician = () => {
  const router = useRouter();
  const { user, isAuthenticated, isTechnician, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { 
    interventions, 
    loading, 
    error, 
    success, 
    pagination, 
    fetchInterventions, 
    updateIntervention, 
    showMessage 
  } = useInterventions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<InterventionStatus | ''>('');
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

  // Initial data fetch
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("Non authentifié, redirection vers login");
      router.push("/login?redirect=/technicien/interventions");
      return;
    }

    if (!isTechnician()) {
      console.log("Non technicien, redirection vers accueil");
      router.push("/");
      return;
    }

    if (user?.id) {
      console.log("Chargement des interventions pour le technicien:", user);
      fetchInterventions(1, Number(pagination.perPage), { technicien_id: user.id.toString() });
    }
  }, [isAuthenticated, isTechnician, router, fetchInterventions, user?.id, pagination.perPage]);

  // Handle search with debounce
  useEffect(() => {
    if (!user?.id) return;
    
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchInterventions(1, Number(pagination.perPage), { 
          recherche: searchTerm,
          technicien_id: user.id.toString()
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, user?.id]);

  const handleStatusChange = (value: InterventionStatus | '') => {
    if (!user?.id) return;
    
    setSelectedStatus(value);
    fetchInterventions(1, Number(pagination.perPage), { 
      statut: value,
      technicien_id: user.id.toString()
    });
  };

  const handleUpdate = async (interventionData: Partial<Intervention>) => {
    if (!user?.id) return;
    try {
      // S'assurer que l'objet passé à updateIntervention contient bien un id
      if (!interventionData.id) {
        showMessage("L'intervention doit avoir un id pour être modifiée", "error");
        return;
      }
      const response = await updateIntervention({
        ...interventionData,
        technicien_id: user.id,
      } as Intervention);
      if (response.success) {
        showMessage("Intervention mise à jour avec succès", "success");
        await fetchInterventions(1, Number(pagination.perPage), { technicien_id: user.id.toString() });
      } else {
        throw new Error(response.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      showMessage(error instanceof Error ? error.message : "Une erreur est survenue", "error");
    }
  };

  // Filter interventions for current technician
  const myInterventions = interventions.filter(
    (intervention) => intervention.technicien_id === user?.id
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mes interventions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
          <Input
              placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="planifiee">Planifiée</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="terminee">Terminée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
                <SelectItem value="reportee">Reportée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div>Chargement...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <InterventionList
              interventions={myInterventions}
              onSelect={(intervention: Intervention) => setSelectedIntervention(intervention)}
              onEdit={(intervention: Intervention) => setEditingIntervention(intervention)}
            />
          )}
              </CardContent>
            </Card>

      {selectedIntervention && (
        <InterventionDetails
          intervention={selectedIntervention}
          onClose={() => setSelectedIntervention(null)}
          onEdit={() => {
            setEditingIntervention(selectedIntervention);
            setSelectedIntervention(null);
          }}
        />
      )}

      {editingIntervention && (
          <InterventionForm
            mode="edit"
            intervention={editingIntervention as Intervention}
            onSubmit={handleUpdate}
            onClose={() => setEditingIntervention(null)}
          />
      )}
    </div>
  );
};

export default InterventionManagementTechnician;