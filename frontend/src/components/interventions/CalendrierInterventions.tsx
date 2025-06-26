import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

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

export function CalendrierInterventions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    chargerInterventions();
  }, [currentDate]);

  const chargerInterventions = async () => {
    try {
      const startDate = startOfWeek(currentDate, { locale: fr });
      const endDate = endOfWeek(currentDate, { locale: fr });

      const response = await fetch(
        `/api/interventions?date_debut=${startDate.toISOString()}&date_fin=${endDate.toISOString()}`
      );

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

  const handlePreviousWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const getInterventionsForDate = (date: Date) => {
    return interventions.filter(intervention => {
      const interventionDate = new Date(intervention.date_planifiee);
      return (
        interventionDate.getDate() === date.getDate() &&
        interventionDate.getMonth() === date.getMonth() &&
        interventionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { locale: fr }),
    end: endOfWeek(currentDate, { locale: fr }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendrier des interventions</h2>
        <Button onClick={() => navigate('/interventions/nouvelle')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle intervention
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Semaine précédente
        </Button>
        <h3 className="text-lg font-semibold">
          {format(startOfWeek(currentDate, { locale: fr }), "d MMMM", { locale: fr })} -{" "}
          {format(endOfWeek(currentDate, { locale: fr }), "d MMMM yyyy", { locale: fr })}
        </h3>
        <Button variant="outline" onClick={handleNextWeek}>
          Semaine suivante
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={fr}
            className="rounded-md border"
          />
        </div>

        <div className="col-span-6">
          {loading ? (
            <div className="text-center py-8">Chargement des interventions...</div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="space-y-2">
                  <div className="font-semibold text-center">
                    {format(day, "EEE d", { locale: fr })}
                  </div>
                  <div className="space-y-2">
                    {getInterventionsForDate(day).map((intervention) => (
                      <div
                        key={intervention.id}
                        className="p-2 rounded-lg border cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/interventions/${intervention.id}`)}
                      >
                        <div className="text-sm font-medium">{intervention.traitement}</div>
                        <div className="text-xs text-gray-500">{intervention.lieu}</div>
                        <Badge className={`mt-1 ${STATUT_COLORS[intervention.statut as keyof typeof STATUT_COLORS]}`}>
                          {STATUT_LABELS[intervention.statut as keyof typeof STATUT_LABELS]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 