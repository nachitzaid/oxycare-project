import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface RemarquesInterventionProps {
  interventionId: number;
  remarques: string | null;
  onRemarquesChange: (nouvellesRemarques: string) => void;
}

export function RemarquesIntervention({
  interventionId,
  remarques,
  onRemarquesChange,
}: RemarquesInterventionProps) {
  const { toast } = useToast();
  const [nouvelleRemarque, setNouvelleRemarque] = useState(remarques || "");
  const [isEditing, setIsEditing] = useState(!remarques);

  const sauvegarderRemarques = async () => {
    try {
      const response = await fetch(`/api/interventions/${interventionId}/remarques`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarques: nouvelleRemarque }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde des remarques');
      }

      onRemarquesChange(nouvelleRemarque);
      setIsEditing(false);

      toast({
        title: "Succès",
        description: "Les remarques ont été sauvegardées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les remarques",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Remarques</h3>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={nouvelleRemarque}
            onChange={(e) => setNouvelleRemarque(e.target.value)}
            placeholder="Ajouter des remarques..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={sauvegarderRemarques}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg">
          {remarques ? (
            <p className="whitespace-pre-wrap">{remarques}</p>
          ) : (
            <p className="text-gray-500 italic">Aucune remarque</p>
          )}
        </div>
      )}
    </div>
  );
} 