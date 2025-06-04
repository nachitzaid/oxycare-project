import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface TechnicianInterventionFormProps {
  intervention: any;
  onUpdate: (data: any) => Promise<void>;
}

export function TechnicianInterventionForm({ intervention, onUpdate }: TechnicianInterventionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    etat_materiel: intervention.etat_materiel || '',
    type_concentrateur: intervention.type_concentrateur || '',
    mode_ventilation: intervention.mode_ventilation || '',
    type_masque: intervention.type_masque || '',
    actions_effectuees: intervention.actions_effectuees || [],
    accessoires_utilises: intervention.accessoires_utilises || [],
    remarques: intervention.remarques || '',
    statut: intervention.statut || 'en_cours'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
      toast({
        title: "Succès",
        description: "L'intervention a été mise à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Détails de l'intervention</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* État du matériel */}
          <div className="space-y-2">
            <Label>État du matériel</Label>
            <Select
              value={formData.etat_materiel}
              onValueChange={(value) => setFormData({ ...formData, etat_materiel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'état" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fonctionnel">Fonctionnel</SelectItem>
                <SelectItem value="Defaut">Défaut</SelectItem>
                <SelectItem value="A_remplacer">À remplacer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type de concentrateur */}
          <div className="space-y-2">
            <Label>Type de concentrateur</Label>
            <Select
              value={formData.type_concentrateur}
              onValueChange={(value) => setFormData({ ...formData, type_concentrateur: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixe">Fixe</SelectItem>
                <SelectItem value="Portable">Portable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mode de ventilation */}
          <div className="space-y-2">
            <Label>Mode de ventilation</Label>
            <Select
              value={formData.mode_ventilation}
              onValueChange={(value) => setFormData({ ...formData, mode_ventilation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Auto">Auto</SelectItem>
                <SelectItem value="Manuel">Manuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type de masque */}
          <div className="space-y-2">
            <Label>Type de masque</Label>
            <Select
              value={formData.type_masque}
              onValueChange={(value) => setFormData({ ...formData, type_masque: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nasal">Nasal</SelectItem>
                <SelectItem value="Facial">Facial</SelectItem>
                <SelectItem value="Narinaire">Narinaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions effectuées */}
          <div className="space-y-2">
            <Label>Actions effectuées</Label>
            <Textarea
              value={formData.actions_effectuees.join('\n')}
              onChange={(e) => setFormData({ ...formData, actions_effectuees: e.target.value.split('\n') })}
              placeholder="Listez les actions effectuées (une par ligne)"
            />
          </div>

          {/* Accessoires utilisés */}
          <div className="space-y-2">
            <Label>Accessoires utilisés</Label>
            <Textarea
              value={formData.accessoires_utilises.join('\n')}
              onChange={(e) => setFormData({ ...formData, accessoires_utilises: e.target.value.split('\n') })}
              placeholder="Listez les accessoires utilisés (un par ligne)"
            />
          </div>

          {/* Remarques */}
          <div className="space-y-2">
            <Label>Remarques</Label>
            <Textarea
              value={formData.remarques}
              onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
              placeholder="Ajoutez vos remarques ici"
            />
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label>Statut de l'intervention</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) => setFormData({ ...formData, statut: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="terminee">Terminée</SelectItem>
                <SelectItem value="patient_absent">Patient absent</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
                <SelectItem value="reportee">Reportée</SelectItem>
                <SelectItem value="partielle">Partielle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Mise à jour..." : "Mettre à jour l'intervention"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 