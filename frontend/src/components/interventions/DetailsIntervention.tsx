import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, AlertCircle, XCircle, Clock, Calendar } from "lucide-react";

interface Intervention {
  id: number;
  patient_id: number;
  dispositif_id: number;
  technicien_id: number;
  traitement: string;
  type_intervention: string;
  date_planifiee: string;
  date_reelle: string | null;
  lieu: string;
  etat_materiel: string;
  type_concentrateur: string | null;
  mode_ventilation: string | null;
  type_masque: string | null;
  statut: string;
  actions_effectuees: any;
  accessoires_utilises: any;
  photos: string[] | null;
  signature_technicien: string | null;
  rapport_pdf_url: string | null;
  remarques: string | null;
  motif_annulation: string | null;
  date_reprogrammation: string | null;
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

const STATUT_ICONS = {
  planifiee: <Calendar className="h-4 w-4" />,
  en_cours: <Clock className="h-4 w-4" />,
  terminee: <CheckCircle className="h-4 w-4" />,
  patient_absent: <XCircle className="h-4 w-4" />,
  annulee: <XCircle className="h-4 w-4" />,
  reportee: <Calendar className="h-4 w-4" />,
  partielle: <AlertCircle className="h-4 w-4" />,
};

export function DetailsIntervention() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerIntervention();
  }, [id]);

  const chargerIntervention = async () => {
    try {
      const response = await fetch(`/api/interventions/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'intervention');
      }
      const data = await response.json();
      setIntervention(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'intervention",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const genererRapport = async () => {
    if (!intervention) return;

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/rapport`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }

      const data = await response.json();
      
      // Ouvrir le rapport dans un nouvel onglet
      window.open(data.rapport_pdf_url, '_blank');

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
    }
  };

  if (loading) {
    return <div>Chargement des détails de l'intervention...</div>;
  }

  if (!intervention) {
    return <div>Intervention non trouvée</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Détails de l'intervention #{intervention.id}</CardTitle>
            <Badge className={STATUT_COLORS[intervention.statut as keyof typeof STATUT_COLORS]}>
              <span className="flex items-center gap-1">
                {STATUT_ICONS[intervention.statut as keyof typeof STATUT_ICONS]}
                {intervention.statut}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informations générales</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Traitement</dt>
                  <dd>{intervention.traitement}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Type d'intervention</dt>
                  <dd>{intervention.type_intervention}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Date planifiée</dt>
                  <dd>{format(new Date(intervention.date_planifiee), "PPP", { locale: fr })}</dd>
                </div>
                {intervention.date_reelle && (
                  <div>
                    <dt className="text-sm text-gray-500">Date réelle</dt>
                    <dd>{format(new Date(intervention.date_reelle), "PPP", { locale: fr })}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Lieu</dt>
                  <dd>{intervention.lieu}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Détails techniques</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">État du matériel</dt>
                  <dd>{intervention.etat_materiel}</dd>
                </div>
                {intervention.type_concentrateur && (
                  <div>
                    <dt className="text-sm text-gray-500">Type de concentrateur</dt>
                    <dd>{intervention.type_concentrateur}</dd>
                  </div>
                )}
                {intervention.mode_ventilation && (
                  <div>
                    <dt className="text-sm text-gray-500">Mode de ventilation</dt>
                    <dd>{intervention.mode_ventilation}</dd>
                  </div>
                )}
                {intervention.type_masque && (
                  <div>
                    <dt className="text-sm text-gray-500">Type de masque</dt>
                    <dd>{intervention.type_masque}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {intervention.remarques && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Remarques</h3>
              <p className="text-gray-700">{intervention.remarques}</p>
            </div>
          )}

          {intervention.motif_annulation && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Motif d'annulation</h3>
              <p className="text-gray-700">{intervention.motif_annulation}</p>
            </div>
          )}

          {intervention.date_reprogrammation && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Date de reprogrammation</h3>
              <p className="text-gray-700">
                {format(new Date(intervention.date_reprogrammation), "PPP", { locale: fr })}
              </p>
            </div>
          )}

          {intervention.photos && intervention.photos.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Photos</h3>
              <div className="grid grid-cols-3 gap-4">
                {intervention.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {intervention.statut === 'terminee' && (
            <div className="mt-6 flex justify-end">
              <Button onClick={genererRapport}>
                Générer le rapport
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}