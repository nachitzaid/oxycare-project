import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface StatutInterventionProps {
  interventionId: number;
  statutActuel: string;
  onStatutChange: (nouveauStatut: string) => void;
}

export function StatutIntervention({ interventionId, statutActuel, onStatutChange }: StatutInterventionProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [nouveauStatut, setNouveauStatut] = useState<string>("");
  const [motif, setMotif] = useState<string>("");
  const [dateReprogrammation, setDateReprogrammation] = useState<Date | undefined>(undefined);

  const handleStatutChange = async () => {
    try {
      const data: any = {
        statut: nouveauStatut,
      };

      if (nouveauStatut === 'annulee' || nouveauStatut === 'patient_absent') {
        if (!motif) {
          toast({
            title: "Erreur",
            description: "Veuillez fournir un motif",
            variant: "destructive",
          });
          return;
        }
        data.motif_annulation = motif;
      }

      if (nouveauStatut === 'reportee') {
        if (!dateReprogrammation) {
          toast({
            title: "Erreur",
            description: "Veuillez sélectionner une date de reprogrammation",
            variant: "destructive",
          });
          return;
        }
        data.date_reprogrammation = dateReprogrammation.toISOString();
      }

      const response = await fetch(`/api/interventions/${interventionId}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de statut');
      }

      onStatutChange(nouveauStatut);
      setIsOpen(false);
      setMotif("");
      setDateReprogrammation(undefined);

      toast({
        title: "Succès",
        description: "Le statut a été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatutOptions = () => {
    switch (statutActuel) {
      case 'planifiee':
        return ['en_cours', 'annulee', 'reportee'];
      case 'en_cours':
        return ['terminee', 'patient_absent', 'partielle'];
      case 'terminee':
        return [];
      case 'patient_absent':
        return ['planifiee', 'annulee'];
      case 'annulee':
        return ['planifiee'];
      case 'reportee':
        return ['planifiee', 'annulee'];
      case 'partielle':
        return ['terminee', 'planifiee'];
      default:
        return [];
    }
  };

  const getStatutLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      planifiee: "Planifiée",
      en_cours: "En cours",
      terminee: "Terminée",
      patient_absent: "Patient absent",
      annulee: "Annulée",
      reportee: "Reportée",
      partielle: "Partielle",
    };
    return labels[statut] || statut;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Changer le statut</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le statut de l'intervention</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nouveau statut</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={nouveauStatut}
              onChange={(e) => setNouveauStatut(e.target.value)}
            >
              <option value="">Sélectionner un statut</option>
              {getStatutOptions().map((statut) => (
                <option key={statut} value={statut}>
                  {getStatutLabel(statut)}
                </option>
              ))}
            </select>
          </div>

          {(nouveauStatut === 'annulee' || nouveauStatut === 'patient_absent') && (
            <div>
              <Label>Motif</Label>
              <Textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Entrez le motif..."
              />
            </div>
          )}

          {nouveauStatut === 'reportee' && (
            <div>
              <Label>Date de reprogrammation</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateReprogrammation && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateReprogrammation ? (
                      format(dateReprogrammation, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateReprogrammation}
                    onSelect={setDateReprogrammation}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleStatutChange}>
              Confirmer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 