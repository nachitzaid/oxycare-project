import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface ActionsInterventionProps {
  interventionId: number;
  actions: string[];
  accessoires: string[];
  onActionsChange: (nouvellesActions: string[]) => void;
  onAccessoiresChange: (nouveauxAccessoires: string[]) => void;
}

export function ActionsIntervention({
  interventionId,
  actions,
  accessoires,
  onActionsChange,
  onAccessoiresChange,
}: ActionsInterventionProps) {
  const { toast } = useToast();
  const [nouvelleAction, setNouvelleAction] = useState("");
  const [nouvelAccessoire, setNouvelAccessoire] = useState("");

  const ajouterAction = async () => {
    if (!nouvelleAction.trim()) return;

    try {
      const response = await fetch(`/api/interventions/${interventionId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: nouvelleAction }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'action');
      }

      onActionsChange([...actions, nouvelleAction]);
      setNouvelleAction("");

      toast({
        title: "Succès",
        description: "L'action a été ajoutée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'action",
        variant: "destructive",
      });
    }
  };

  const supprimerAction = async (action: string) => {
    try {
      const response = await fetch(`/api/interventions/${interventionId}/actions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'action');
      }

      onActionsChange(actions.filter(a => a !== action));

      toast({
        title: "Succès",
        description: "L'action a été supprimée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'action",
        variant: "destructive",
      });
    }
  };

  const ajouterAccessoire = async () => {
    if (!nouvelAccessoire.trim()) return;

    try {
      const response = await fetch(`/api/interventions/${interventionId}/accessoires`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessoire: nouvelAccessoire }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'accessoire');
      }

      onAccessoiresChange([...accessoires, nouvelAccessoire]);
      setNouvelAccessoire("");

      toast({
        title: "Succès",
        description: "L'accessoire a été ajouté",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'accessoire",
        variant: "destructive",
      });
    }
  };

  const supprimerAccessoire = async (accessoire: string) => {
    try {
      const response = await fetch(`/api/interventions/${interventionId}/accessoires`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessoire }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'accessoire');
      }

      onAccessoiresChange(accessoires.filter(a => a !== accessoire));

      toast({
        title: "Succès",
        description: "L'accessoire a été supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'accessoire",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Actions effectuées</h3>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={nouvelleAction}
              onChange={(e) => setNouvelleAction(e.target.value)}
              placeholder="Ajouter une action..."
            />
            <Button onClick={ajouterAction}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {actions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span>{action}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => supprimerAction(action)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Accessoires utilisés</h3>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={nouvelAccessoire}
              onChange={(e) => setNouvelAccessoire(e.target.value)}
              placeholder="Ajouter un accessoire..."
            />
            <Button onClick={ajouterAccessoire}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {accessoires.map((accessoire, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span>{accessoire}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => supprimerAccessoire(accessoire)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 