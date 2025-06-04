import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Search, Filter } from "lucide-react";

interface Intervention {
  id: number;
  patient_id: number;
  traitement: string;
  type_intervention: string;
  date_planifiee: string;
  lieu: string;
  statut: string;
}

const STATUT_COLORS = {
  planifiee: "bg-blue-100 text-blue-800",
  en_cours: "bg-yellow-100 text-yellow-800",
  terminee: "bg-green-100 text-green-800",
  patient_absent: "bg-red-100 text-red-800",
  annulee: "bg-gray-100 text-gray-800",
  reportee: "bg-purple-100 text-purple-800",
  partielle: "bg-orange-100 text-orange-800",
};

const STATUT_LABELS = {
  planifiee: "Planifiée",
  en_cours: "En cours",
  terminee: "Terminée",
  patient_absent: "Patient absent",
  annulee: "Annulée",
  reportee: "Reportée",
  partielle: "Partielle",
};

export function ListeInterventions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    chargerInterventions();
  }, [statusFilter, dateFilter]);

  const chargerInterventions = async () => {
    try {
      let url = '/api/interventions';
      const params = new URLSearchParams();

      if (statusFilter) {
        params.append('statut', statusFilter);
      }

      if (dateFilter) {
        params.append('date', dateFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des interventions');
      }

      const data = await response.json();
      setInterventions(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les interventions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInterventions = interventions.filter(intervention => {
    const searchLower = searchTerm.toLowerCase();
    return (
      intervention.traitement.toLowerCase().includes(searchLower) ||
      intervention.type_intervention.toLowerCase().includes(searchLower) ||
      intervention.lieu.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Interventions</h2>
        <Button onClick={() => navigate('/interventions/nouvelle')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle intervention
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher une intervention..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          value={dateFilter}
          onValueChange={setDateFilter}
        >
          <option value="">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement des interventions...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Traitement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterventions.map((intervention) => (
                <TableRow key={intervention.id}>
                  <TableCell>
                    {format(new Date(intervention.date_planifiee), "PPP", { locale: fr })}
                  </TableCell>
                  <TableCell>{intervention.patient_id}</TableCell>
                  <TableCell>{intervention.traitement}</TableCell>
                  <TableCell>{intervention.type_intervention}</TableCell>
                  <TableCell>{intervention.lieu}</TableCell>
                  <TableCell>
                    <Badge className={STATUT_COLORS[intervention.statut as keyof typeof STATUT_COLORS]}>
                      {STATUT_LABELS[intervention.statut as keyof typeof STATUT_LABELS]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/interventions/${intervention.id}`)}
                    >
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 