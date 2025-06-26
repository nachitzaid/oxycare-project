import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

// Types pour les options des selects
interface TypeIntervention {
  [key: string]: string[];
}

const TYPES_INTERVENTION: TypeIntervention = {
  'Oxygénothérapie': [
    'Installation',
    'Réglage',
    'Entretien',
    'Remplacement',
    'Contrôle',
    'Changement de paramètres',
    'Ajustement masque',
    'Tirage de rapport'
  ],
  'Ventilation': [
    'Installation',
    'Réglage',
    'Entretien',
    'Contrôle',
    'Changement de paramètres',
    'Ajustement masque',
    'Tirage de rapport'
  ],
  'PPC': [
    'Installation',
    'Réglage',
    'Remplacement',
    'Entretien',
    'Contrôle',
    'Changement de paramètres',
    'Ajustement masque',
    'Tirage de rapport'
  ],
  'Polygraphie': ['Installation', 'Désinstallation'],
  'Polysomnographie': ['Installation', 'Désinstallation']
};

export function NouvelleIntervention() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    traitement: '',
    type_intervention: '',
    etat_materiel: '',
    type_concentrateur: '',
    mode_ventilation: '',
    type_masque: '',
    lieu: '',
    remarques: ''
  });

  // Gestion des champs dépendants
  const [typesInterventionDisponibles, setTypesInterventionDisponibles] = useState<string[]>([]);
  const [showTypeConcentrateur, setShowTypeConcentrateur] = useState(false);
  const [showModeVentilation, setShowModeVentilation] = useState(false);
  const [showTypeMasque, setShowTypeMasque] = useState(false);

  // Mise à jour des champs dépendants quand le traitement change
  useEffect(() => {
    if (formData.traitement) {
      setTypesInterventionDisponibles(TYPES_INTERVENTION[formData.traitement] || []);
      setShowTypeConcentrateur(formData.traitement === 'Oxygénothérapie');
      setShowModeVentilation(['PPC', 'Ventilation'].includes(formData.traitement));
      setShowTypeMasque(['PPC', 'Ventilation'].includes(formData.traitement));
      
      // Réinitialiser les champs dépendants si le traitement change
      if (!['PPC', 'Ventilation'].includes(formData.traitement)) {
        setFormData(prev => ({
          ...prev,
          mode_ventilation: '',
          type_masque: ''
        }));
      }
      if (formData.traitement !== 'Oxygénothérapie') {
        setFormData(prev => ({
          ...prev,
          type_concentrateur: ''
        }));
      }
    }
  }, [formData.traitement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date_planifiee: date?.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'intervention');
      }

      toast({
        title: "Succès",
        description: "L'intervention a été créée avec succès",
      });

      // Réinitialiser le formulaire
      setFormData({
        traitement: '',
        type_intervention: '',
        etat_materiel: '',
        type_concentrateur: '',
        mode_ventilation: '',
        type_masque: '',
        lieu: '',
        remarques: ''
      });
      setDate(undefined);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'intervention",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nouvelle Intervention</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Traitement */}
          <div className="space-y-2">
            <Label htmlFor="traitement">Traitement</Label>
            <Select
              value={formData.traitement}
              onValueChange={(value) => setFormData(prev => ({ ...prev, traitement: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un traitement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oxygénothérapie">Oxygénothérapie</SelectItem>
                <SelectItem value="Ventilation">Ventilation</SelectItem>
                <SelectItem value="PPC">PPC</SelectItem>
                <SelectItem value="Polygraphie">Polygraphie</SelectItem>
                <SelectItem value="Polysomnographie">Polysomnographie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type d'intervention */}
          <div className="space-y-2">
            <Label htmlFor="type_intervention">Type d'intervention</Label>
            <Select
              value={formData.type_intervention}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type_intervention: value }))}
              disabled={!formData.traitement}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type d'intervention" />
              </SelectTrigger>
              <SelectContent>
                {typesInterventionDisponibles.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* État du matériel */}
          <div className="space-y-2">
            <Label htmlFor="etat_materiel">État du matériel</Label>
            <Select
              value={formData.etat_materiel}
              onValueChange={(value) => setFormData(prev => ({ ...prev, etat_materiel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez l'état du matériel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fonctionnel">Fonctionnel</SelectItem>
                <SelectItem value="Défaut">Défaut</SelectItem>
                <SelectItem value="À remplacer">À remplacer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type de concentrateur (spécifique Oxygénothérapie) */}
          {showTypeConcentrateur && (
            <div className="space-y-2">
              <Label htmlFor="type_concentrateur">Type de concentrateur</Label>
              <Select
                value={formData.type_concentrateur}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type_concentrateur: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de concentrateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixe">Fixe</SelectItem>
                  <SelectItem value="Portable">Portable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mode de ventilation (spécifique PPC/Ventilation) */}
          {showModeVentilation && (
            <div className="space-y-2">
              <Label htmlFor="mode_ventilation">Mode de ventilation</Label>
              <Select
                value={formData.mode_ventilation}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mode_ventilation: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le mode de ventilation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Manuel">Manuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type de masque (spécifique PPC/Ventilation) */}
          {showTypeMasque && (
            <div className="space-y-2">
              <Label htmlFor="type_masque">Type de masque</Label>
              <Select
                value={formData.type_masque}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type_masque: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de masque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nasal">Nasal</SelectItem>
                  <SelectItem value="Facial">Facial</SelectItem>
                  <SelectItem value="Narinaire">Narinaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date planifiée */}
          <div className="space-y-2">
            <Label>Date planifiée</Label>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : "Sélectionnez une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="w-auto p-0">
                  <Calendar
                    value={date}
                    onChange={(val: any) => {
                      if (val instanceof Date) setDate(val);
                      else if (Array.isArray(val) && val[0] instanceof Date) setDate(val[0]);
                      else setDate(undefined);
                    }}
                    locale="fr-FR"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu</Label>
            <Input
              id="lieu"
              value={formData.lieu}
              onChange={(e) => setFormData(prev => ({ ...prev, lieu: e.target.value }))}
              placeholder="Adresse de l'intervention"
            />
          </div>

          {/* Remarques */}
          <div className="space-y-2">
            <Label htmlFor="remarques">Remarques</Label>
            <Textarea
              id="remarques"
              value={formData.remarques}
              onChange={(e) => setFormData(prev => ({ ...prev, remarques: e.target.value }))}
              placeholder="Remarques additionnelles..."
            />
          </div>

          {/* Bouton de soumission */}
          <Button type="submit" className="w-full">
            Créer l'intervention
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}