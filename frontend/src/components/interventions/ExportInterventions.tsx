import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Download } from "lucide-react";

interface ExportInterventionsProps {
  onExport: (params: {
    format: string;
    dateDebut: Date | null;
    dateFin: Date | null;
    statut: string;
    traitement: string;
  }) => void;
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

export function ExportInterventions({ onExport }: ExportInterventionsProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState("excel");
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);
  const [statut, setStatut] = useState("");
  const [traitement, setTraitement] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!dateDebut || !dateFin) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une période",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onExport({
        format,
        dateDebut,
        dateFin,
        statut,
        traitement,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Exporter les interventions</h3>
        <Button
          onClick={handleExport}
          disabled={loading}
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Export en cours..." : "Exporter"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select
            value={format}
            onValueChange={setFormat}
          >
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select
            value={statut}
            onValueChange={setStatut}
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
            value={traitement}
            onValueChange={setTraitement}
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
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateDebut ? (
                  format(dateDebut, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateDebut || undefined}
                onSelect={(date: Date | undefined) => setDateDebut(date || null)}
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
                {dateFin ? (
                  format(dateFin, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFin || undefined}
                onSelect={(date: Date | undefined) => setDateFin(date || null)}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
} 