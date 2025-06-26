import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download, Loader2 } from "lucide-react";

interface RapportInterventionProps {
  interventionId: number;
  rapportUrl: string | null;
  onRapportGenerate: (rapportUrl: string) => void;
}

export function RapportIntervention({ interventionId, rapportUrl, onRapportGenerate }: RapportInterventionProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRapport = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/interventions/${interventionId}/rapport`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }

      const data = await response.json();
      onRapportGenerate(data.rapport_pdf_url);

      toast({
        title: "Succès",
        description: "Le rapport a été généré",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadRapport = () => {
    if (!rapportUrl) return;

    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = rapportUrl;
    link.download = `rapport_intervention_${interventionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rapport d'intervention</h3>
        <div className="flex items-center space-x-2">
          {rapportUrl ? (
            <Button onClick={downloadRapport}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger le rapport
            </Button>
          ) : (
            <Button onClick={generateRapport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Générer le rapport
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {rapportUrl && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Rapport disponible</span>
          </div>
        </div>
      )}
    </div>
  );
} 