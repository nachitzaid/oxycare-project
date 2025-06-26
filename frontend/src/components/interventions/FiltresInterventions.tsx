import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

interface FiltresInterventionsProps {
  filtres: {
    recherche: string;
    statut: string;
    traitement: string;
    type: string;
    dateDebut: Date | null;
    dateFin: Date | null;
  };
  onFiltresChange: (filtres: any) => void;
  onReset: () => void;
}

const STATUT_LABELS = {
  planifiee: "Planifiée",
  en_cours: "En cours",
  terminee: "Terminée",
  patient_absent: "Patient absent",
  annulee: "Annulée",
  reportee: "Reportée",
  partielle: "Partielle",
};

const TRAITEMENTS = [
  "Oxygénothérapie",
  "Ventilation",
  "CPAP",
  "BiPAP",
  "Aérosolthérapie",
  "Aspiration",
  "Autre",
];

const TYPES_INTERVENTION = [
  "Installation",
  "Maintenance",
  "Dépannage",
  "Formation",
  "Retrait",
  "Autre",
];

export function FiltresInterventions({
  filtres,
  onFiltresChange,
  onReset,
}: FiltresInterventionsProps) {
  const handleChange = (field: string, value: any) => {
    onFiltresChange({
      ...filtres,
      [field]: value,
    });
  };

  const hasActiveFilters = Object.values(filtres).some(value => {
    if (value instanceof Date) return true;
    if (typeof value === 'string') return value !== '';
    return false;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtres</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recherche">Recherche</Label>
          <Input
            id="recherche"
            placeholder="Rechercher..."
            value={filtres.recherche}
            onChange={(e) => handleChange('recherche', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select
            id="statut"
            value={filtres.statut}
            onValueChange={(value) => handleChange('statut', value)}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="traitement">Traitement</Label>
          <Select
            id="traitement"
            value={filtres.traitement}
            onValueChange={(value) => handleChange('traitement', value)}
          >
            <option value="">Tous les traitements</option>
            {TRAITEMENTS.map((traitement) => (
              <option key={traitement} value={traitement}>
                {traitement}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type d'intervention</Label>
          <Select
            id="type"
            value={filtres.type}
            onValueChange={(value) => handleChange('type', value)}
          >
            <option value="">Tous les types</option>
            {TYPES_INTERVENTION.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filtres.dateDebut ? (
                  format(filtres.dateDebut, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filtres.dateDebut || undefined}
                onSelect={(date) => handleChange('dateDebut', date)}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filtres.dateFin ? (
                  format(filtres.dateFin, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filtres.dateFin || undefined}
                onSelect={(date) => handleChange('dateFin', date)}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
} 