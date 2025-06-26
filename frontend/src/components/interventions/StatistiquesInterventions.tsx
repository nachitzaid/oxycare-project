import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Statistiques {
  total_interventions: number;
  par_statut: {
    [key: string]: number;
  };
  par_traitement: {
    [key: string]: number;
  };
  par_type: {
    [key: string]: number;
  };
  evolution_mensuelle: {
    mois: string;
    total: number;
  }[];
}

const STATUT_COLORS = {
  planifiee: "#3b82f6",
  en_cours: "#eab308",
  terminee: "#22c55e",
  patient_absent: "#ef4444",
  annulee: "#6b7280",
  reportee: "#a855f7",
  partielle: "#f97316",
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

const CHART_COLORS = [
  "#3b82f6",
  "#eab308",
  "#22c55e",
  "#ef4444",
  "#6b7280",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#8b5cf6",
  "#ec4899",
];

export function StatistiquesInterventions() {
  const { toast } = useToast();
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState("3");

  useEffect(() => {
    chargerStatistiques();
  }, [periode]);

  const chargerStatistiques = async () => {
    try {
      const dateDebut = subMonths(new Date(), parseInt(periode));
      const response = await fetch(
        `/api/interventions/statistiques?date_debut=${dateDebut.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const data = await response.json();
      setStatistiques(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareDonneesStatut = () => {
    if (!statistiques) return [];
    return Object.entries(statistiques.par_statut).map(([statut, nombre]) => ({
      name: STATUT_LABELS[statut as keyof typeof STATUT_LABELS],
      value: nombre,
    }));
  };

  const prepareDonneesTraitement = () => {
    if (!statistiques) return [];
    return Object.entries(statistiques.par_traitement).map(([traitement, nombre]) => ({
      name: traitement,
      value: nombre,
    }));
  };

  const prepareDonneesEvolution = () => {
    if (!statistiques) return [];
    return statistiques.evolution_mensuelle.map(item => ({
      mois: format(new Date(item.mois), "MMM yyyy", { locale: fr }),
      total: item.total,
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>;
  }

  if (!statistiques) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistiques des interventions</h2>
        <Select
          value={periode}
          onValueChange={setPeriode}
        >
          <option value="1">1 mois</option>
          <option value="3">3 mois</option>
          <option value="6">6 mois</option>
          <option value="12">12 mois</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total des interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistiques.total_interventions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareDonneesStatut()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {prepareDonneesStatut().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUT_COLORS[Object.keys(STATUT_COLORS)[index % Object.keys(STATUT_COLORS).length] as keyof typeof STATUT_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Par traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareDonneesTraitement()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {prepareDonneesTraitement().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareDonneesEvolution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Nombre d'interventions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 