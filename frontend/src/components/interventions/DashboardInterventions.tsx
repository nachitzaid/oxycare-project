import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
import { Plus, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Statistiques {
  total_interventions: number;
  interventions_jour: number;
  interventions_semaine: number;
  interventions_mois: number;
  par_statut: {
    [key: string]: number;
  };
  par_traitement: {
    [key: string]: number;
  };
  evolution_mensuelle: {
    mois: string;
    total: number;
  }[];
}

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

export function DashboardInterventions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [interventionsAujourdhui, setInterventionsAujourdhui] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [statsResponse, interventionsResponse] = await Promise.all([
        fetch('/api/interventions/statistiques'),
        fetch('/api/interventions/aujourdhui'),
      ]);

      if (!statsResponse.ok || !interventionsResponse.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const [statsData, interventionsData] = await Promise.all([
        statsResponse.json(),
        interventionsResponse.json(),
      ]);

      setStatistiques(statsData);
      setInterventionsAujourdhui(interventionsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
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
    return <div className="text-center py-8">Chargement du tableau de bord...</div>;
  }

  if (!statistiques) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tableau de bord</h2>
        <Button onClick={() => navigate('/interventions/nouvelle')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle intervention
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des interventions</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistiques.total_interventions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistiques.interventions_jour}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistiques.interventions_semaine}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistiques.interventions_mois}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareDonneesStatut()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
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
            <CardTitle>Répartition par traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareDonneesTraitement()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
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

      <Card>
        <CardHeader>
          <CardTitle>Interventions aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interventionsAujourdhui.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Aucune intervention prévue aujourd'hui
              </div>
            ) : (
              interventionsAujourdhui.map((intervention) => (
                <div
                  key={intervention.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/interventions/${intervention.id}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{intervention.traitement}</span>
                      <Badge className={STATUT_COLORS[intervention.statut as keyof typeof STATUT_COLORS]}>
                        {STATUT_LABELS[intervention.statut as keyof typeof STATUT_LABELS]}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(intervention.date_planifiee), "HH:mm", { locale: fr })}
                    </div>
                    <div className="text-sm">{intervention.lieu}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {intervention.statut === 'planifiee' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/interventions/${intervention.id}/demarrer`);
                        }}
                      >
                        Démarrer
                      </Button>
                    )}
                    {intervention.statut === 'en_cours' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/interventions/${intervention.id}/terminer`);
                        }}
                      >
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 