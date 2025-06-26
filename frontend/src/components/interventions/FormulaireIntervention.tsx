import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface FormulaireInterventionProps {
  interventionId?: number;
  mode: 'creation' | 'modification';
}

const TRAITEMENTS = [
  "Oxygénothérapie",
  "Ventilation non invasive",
  "Ventilation invasive",
  "Aérosolthérapie",
  "Aspiration",
  "Autre",
];

const TYPES_INTERVENTION = {
  "Oxygénothérapie": [
    "Installation",
    "Maintenance",
    "Dépannage",
    "Désinstallation",
  ],
  "Ventilation non invasive": [
    "Installation",
    "Maintenance",
    "Dépannage",
    "Désinstallation",
  ],
  "Ventilation invasive": [
    "Installation",
    "Maintenance",
    "Dépannage",
    "Désinstallation",
  ],
  "Aérosolthérapie": [
    "Installation",
    "Maintenance",
    "Dépannage",
    "Désinstallation",
  ],
  "Aspiration": [
    "Installation",
    "Maintenance",
    "Dépannage",
    "Désinstallation",
  ],
  "Autre": [
    "Installation",
    "Maintenance",
    "Dépannage",
    "Désinstallation",
  ],
};

const ETATS_MATERIEL = [
  "Neuf",
  "Bon état",
  "État moyen",
  "Mauvais état",
  "Hors service",
];

const TYPES_CONCENTRATEUR = [
  "Stationnaire",
  "Portable",
  "Transportable",
];

const MODES_VENTILATION = [
  "Spontané",
  "Assisté",
  "Contrôlé",
  "Mixte",
];

const TYPES_MASQUE = [
  "Nasal",
  "Naso-buccal",
  "Buccal",
  "Facial",
  "Trachéotomie",
];

export function FormulaireIntervention({ interventionId, mode }: FormulaireInterventionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    traitement: "",
    type_intervention: "",
    date_planifiee: new Date(),
    lieu: "",
    etat_materiel: "",
    type_concentrateur: "",
    mode_ventilation: "",
    type_masque: "",
  });

  useEffect(() => {
    if (mode === 'modification' && interventionId) {
      chargerIntervention();
    }
  }, [interventionId, mode]);

  const chargerIntervention = async () => {
    try {
      const response = await fetch(`/api/interventions/${interventionId}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'intervention');
      }
      const data = await response.json();
      setFormData({
        ...data,
        date_planifiee: new Date(data.date_planifiee),
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'intervention",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'creation'
        ? '/api/interventions'
        : `/api/interventions/${interventionId}`;

      const response = await fetch(url, {
        method: mode === 'creation' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de l\'intervention');
      }

      const data = await response.json();

      toast({
        title: "Succès",
        description: `L'intervention a été ${mode === 'creation' ? 'créée' : 'modifiée'}`,
      });

      router.push(`/interventions/${data.id}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible de ${mode === 'creation' ? 'créer' : 'modifier'} l'intervention`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Réinitialiser les champs dépendants si le traitement change
      if (field === 'traitement') {
        newData.type_intervention = "";
        newData.type_concentrateur = "";
        newData.mode_ventilation = "";
        newData.type_masque = "";
      }

      return newData;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'creation' ? 'Nouvelle intervention' : 'Modifier l\'intervention'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="traitement">Traitement</Label>
              <Select
                value={formData.traitement}
                onValueChange={(value) => handleChange('traitement', value)}
              >
                <option value="">Sélectionner un traitement</option>
                {TRAITEMENTS.map((traitement) => (
                  <option key={traitement} value={traitement}>
                    {traitement}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_intervention">Type d'intervention</Label>
              <Select
                value={formData.type_intervention}
                onValueChange={(value) => handleChange('type_intervention', value)}
                disabled={!formData.traitement}
              >
                <option value="">Sélectionner un type</option>
                {formData.traitement &&
                  TYPES_INTERVENTION[formData.traitement as keyof typeof TYPES_INTERVENTION].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_planifiee">Date planifiée</Label>
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date_planifiee && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_planifiee ? (
                      format(formData.date_planifiee, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                  value={formData.date_planifiee}
                  onChange={(value, _event) => {
                    const date = Array.isArray(value) ? value[0] : value;
                    handleChange('date_planifiee', date);
                  }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu</Label>
              <Input
                id="lieu"
                value={formData.lieu}
                onChange={(e) => handleChange('lieu', e.target.value)}
                placeholder="Adresse de l'intervention"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="etat_materiel">État du matériel</Label>
              <Select
                value={formData.etat_materiel}
                onValueChange={(value) => handleChange('etat_materiel', value)}
              >
                <option value="">Sélectionner un état</option>
                {ETATS_MATERIEL.map((etat) => (
                  <option key={etat} value={etat}>
                    {etat}
                  </option>
                ))}
              </Select>
            </div>

            {formData.traitement === "Oxygénothérapie" && (
              <div className="space-y-2">
                <Label htmlFor="type_concentrateur">Type de concentrateur</Label>
                <Select
                  value={formData.type_concentrateur}
                  onValueChange={(value) => handleChange('type_concentrateur', value)}
                >
                  <option value="">Sélectionner un type</option>
                  {TYPES_CONCENTRATEUR.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {(formData.traitement === "Ventilation non invasive" ||
              formData.traitement === "Ventilation invasive") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mode_ventilation">Mode de ventilation</Label>
                  <Select
                    value={formData.mode_ventilation}
                    onValueChange={(value) => handleChange('mode_ventilation', value)}
                  >
                    <option value="">Sélectionner un mode</option>
                    {MODES_VENTILATION.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_masque">Type de masque</Label>
                  <Select
                    value={formData.type_masque}
                    onValueChange={(value) => handleChange('type_masque', value)}
                  >
                    <option value="">Sélectionner un type</option>
                    {TYPES_MASQUE.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Enregistrement..."
                : mode === 'creation'
                ? "Créer l'intervention"
                : "Modifier l'intervention"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}