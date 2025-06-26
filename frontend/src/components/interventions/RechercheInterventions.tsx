import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, X } from "lucide-react";

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

export function RechercheInterventions() {
  const router = useRouter();
  const { toast } = useToast();
  const [recherche, setRecherche] = useState("");
  const [type, setType] = useState("tout");
  const [resultats, setResultats] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (recherche.length >= 2) {
        effectuerRecherche();
      } else {
        setResultats([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [recherche, type]);

  const effectuerRecherche = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/interventions/recherche?q=${encodeURIComponent(recherche)}&type=${type}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      setResultats(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer la recherche",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRecherche("");
    setType("tout");
    setResultats([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher une intervention..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="pl-8"
            />
            {recherche && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1.5"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Select
          value={type}
          onValueChange={setType}
        >
          <option value="tout">Tout</option>
          <option value="patient">Patient</option>
          <option value="traitement">Traitement</option>
          <option value="lieu">Lieu</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-4">Recherche en cours...</div>
      ) : resultats.length > 0 ? (
        <div className="space-y-2">
          {resultats.map((intervention) => (
            <div
              key={intervention.id}
              className="p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/interventions/${intervention.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{intervention.traitement}</span>
                    <Badge className={STATUT_COLORS[intervention.statut as keyof typeof STATUT_COLORS]}>
                      {STATUT_LABELS[intervention.statut as keyof typeof STATUT_LABELS]}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(intervention.date_planifiee), "PPP", { locale: fr })}
                  </div>
                  <div className="text-sm">{intervention.lieu}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : recherche.length >= 2 ? (
        <div className="text-center py-4 text-gray-500">
          Aucun résultat trouvé
        </div>
      ) : null}
    </div>
  );
}