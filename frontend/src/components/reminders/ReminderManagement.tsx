"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useInterventions } from "@/hooks/useInterventions";
import { Search, Bell, RefreshCw, AlertCircle, CheckCircle, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Modal from "../common/Modal";
import InterventionDetails from "../interventions/InterventionDetails";
import type { Intervention } from '@/types/intervention';

// Types
interface Patient {
  id: number;
  code_patient: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
}

const ReminderManagement = () => {
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
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

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
        fetchInterventions(1, 10, { recherche: searchTerm });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter interventions for current technician and date range
  const getFilteredInterventions = () => {
    const myInterventions = interventions.filter(
      (intervention) => intervention.technicien_id === user?.id
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return myInterventions.filter(intervention => {
      if (!intervention.date_planifiee) return false;
      
      const interventionDate = new Date(intervention.date_planifiee);
      
      switch (filter) {
        case "today":
          return interventionDate.toDateString() === today.toDateString();
        case "week":
          return interventionDate >= today && interventionDate <= nextWeek;
        default:
          return true;
      }
    });
  };

  const filteredInterventions = getFilteredInterventions();

  // Get urgency badge
  const getUrgencyBadge = (date: string) => {
    const interventionDate = new Date(date);
    const now = new Date();
    const diffHours = (interventionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return <Badge variant="destructive">En retard</Badge>;
    } else if (diffHours < 24) {
      return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
    } else if (diffHours < 48) {
      return <Badge className="bg-orange-100 text-orange-800">Proche</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Planifié</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rappels</h1>
            <p className="text-gray-600 mt-1">
              {filteredInterventions.length > 0 
                ? `${filteredInterventions.length} intervention(s) à venir` 
                : "Aucune intervention à venir"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setFilter("all")} 
              variant={filter === "all" ? "default" : "outline"}
            >
              Toutes
            </Button>
            <Button 
              onClick={() => setFilter("today")} 
              variant={filter === "today" ? "default" : "outline"}
            >
              Aujourd'hui
            </Button>
            <Button 
              onClick={() => setFilter("week")} 
              variant={filter === "week" ? "default" : "outline"}
            >
              Cette semaine
            </Button>
            <Button onClick={() => fetchInterventions(1, 10, { recherche: searchTerm })} disabled={loading} variant="outline" className="flex items-center gap-2">
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
            <span>Chargement des rappels...</span>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInterventions.map((intervention) => (
            <Card key={intervention.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getUrgencyBadge(intervention.date_planifiee!)}
                    </div>
                    <h3 className="font-semibold text-lg">
                      {intervention.type_intervention}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {intervention.patient
                        ? `${intervention.patient.prenom} ${intervention.patient.nom}`
                        : `Patient #${intervention.patient_id}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingIntervention(intervention)}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(intervention.date_planifiee!).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(intervention.date_planifiee!).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {intervention.temps_prevu && (
                    <p className="text-sm text-muted-foreground">
                      Durée prévue: {intervention.temps_prevu} minutes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

export default ReminderManagement;