import { Intervention } from '@/types/intervention';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Pencil } from 'lucide-react';

interface InterventionListProps {
  interventions: Intervention[];
  onSelect: (intervention: Intervention) => void;
  onEdit: (intervention: Intervention) => void;
  onDelete?: (id: number) => void;
}

export function InterventionList({ interventions, onSelect, onEdit, onDelete }: InterventionListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {interventions.map((intervention) => (
        <Card key={intervention.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {intervention.type_intervention}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {intervention.patient
                    ? `${intervention.patient.prenom} ${intervention.patient.nom}`
                    : `Patient #${intervention.patient_id}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSelect(intervention)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(intervention)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Date prévue:</span>{" "}
                {intervention.date_planifiee
                  ? new Date(intervention.date_planifiee).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Non définie"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Statut:</span>{" "}
                {intervention.statut}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 