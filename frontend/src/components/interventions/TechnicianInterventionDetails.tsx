import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Trash2, Camera, FileText } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Intervention, InterventionFormData, InterventionType, InterventionUpdateData } from '@/types/intervention';
import { INTERVENTION_TYPES, VERIFICATIONS_SECURITE, TESTS_EFFECTUES, CONSOMMABLES } from '@/constants/interventions';
import type { InterventionStatus } from '@/types/intervention';

interface TechnicianInterventionDetailsProps {
  intervention: Intervention;
  onUpdate: (data: InterventionUpdateData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  user?: any;
}

export function TechnicianInterventionDetails({ intervention, onUpdate, onDelete, user }: TechnicianInterventionDetailsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState<InterventionFormData>(() => ({
    traitement: intervention.traitement,
    type_intervention: intervention.type_intervention,
    type_concentrateur: intervention.type_concentrateur || '',
    mode_ventilation: intervention.mode_ventilation || '',
    type_masque: intervention.type_masque || '',
    remarques: intervention.remarques || '',
    statut: intervention.statut,
    parametres: intervention.parametres || {},
    photos: intervention.photos || [],
    signature: intervention.signature_technicien,
    rapport_pdf: intervention.rapport_pdf_url,
    reglage: {
      pmax: intervention.reglage?.pmax?.toString() || '',
      pmin: intervention.reglage?.pmin?.toString() || '',
      pramp: intervention.reglage?.pramp?.toString() || '',
      hu: intervention.reglage?.hu?.toString() || '',
      re: intervention.reglage?.re?.toString() || '',
      commentaire: intervention.reglage?.commentaire || ''
    },
    verification_securite: intervention.verification_securite || {},
    tests_effectues: intervention.tests_effectues || {},
    consommables_utilises: intervention.consommables_utilises || {},
    maintenance_preventive: intervention.maintenance_preventive,
    date_prochaine_maintenance: intervention.date_prochaine_maintenance || ''
  }));

  useEffect(() => {
    if (intervention) {
      setFormData({
        traitement: intervention.traitement,
        type_intervention: intervention.type_intervention,
        type_concentrateur: intervention.type_concentrateur || '',
        mode_ventilation: intervention.mode_ventilation || '',
        type_masque: intervention.type_masque || '',
        remarques: intervention.remarques || '',
        statut: intervention.statut,
        parametres: intervention.parametres || {},
        photos: intervention.photos || [],
        signature: intervention.signature_technicien,
        rapport_pdf: intervention.rapport_pdf_url,
        reglage: {
          pmax: intervention.reglage?.pmax?.toString() || '',
          pmin: intervention.reglage?.pmin?.toString() || '',
          pramp: intervention.reglage?.pramp?.toString() || '',
          hu: intervention.reglage?.hu?.toString() || '',
          re: intervention.reglage?.re?.toString() || '',
          commentaire: intervention.reglage?.commentaire || ''
        },
        verification_securite: intervention.verification_securite || {},
        tests_effectues: intervention.tests_effectues || {},
        consommables_utilises: intervention.consommables_utilises || {},
        maintenance_preventive: intervention.maintenance_preventive,
        date_prochaine_maintenance: intervention.date_prochaine_maintenance || ''
      });
    }
  }, [intervention]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Vérifier que l'intervention est bien assignée au technicien
      if (!intervention || !user) {
        toast({
          title: "Erreur",
          description: "Données manquantes",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("Vérification des permissions:", {
        interventionTechnicienId: intervention.technicien_id,
        userId: user.id,
        interventionId: intervention.id
      });

      const dataToSubmit: InterventionUpdateData = {
        ...formData,
        id: intervention.id,
        reglage: {
          pmax: formData.reglage.pmax ? parseFloat(formData.reglage.pmax) : null,
          pmin: formData.reglage.pmin ? parseFloat(formData.reglage.pmin) : null,
          pramp: formData.reglage.pramp ? parseFloat(formData.reglage.pramp) : null,
          hu: formData.reglage.hu ? parseFloat(formData.reglage.hu) : null,
          re: formData.reglage.re ? parseFloat(formData.reglage.re) : null,
          commentaire: formData.reglage.commentaire
        }
      };

      console.log("Données à envoyer:", dataToSubmit);
      await onUpdate(dataToSubmit);
      // Le message de succès sera affiché par le hook useInterventions
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette intervention ?")) {
      try {
        await onDelete(intervention.id);
        toast({
          title: "Succès",
          description: "L'intervention a été supprimée avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownloadPDF = () => {
    if (intervention.rapport_pdf_url) {
      window.open(intervention.rapport_pdf_url, '_blank');
    } else {
      toast({
        title: "Information",
        description: "Aucun rapport PDF disponible pour cette intervention",
      });
    }
  };

  const renderParametresForm = () => {
    switch (formData.traitement) {
      case 'OXYGENOTHERAPIE':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Débit d'oxygène (L/min)</Label>
                <Input
                  type="number"
                  value={formData.parametres.debit_oxygene || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parametres: { ...formData.parametres, debit_oxygene: e.target.value }
                  })}
                />
              </div>
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
                    <SelectItem value="Stationnaire">Stationnaire</SelectItem>
                    <SelectItem value="Portable">Portable</SelectItem>
                    <SelectItem value="Transportable">Transportable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'VENTILATION':
      case 'PPC':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="VCV">VCV</SelectItem>
                    <SelectItem value="PCV">PCV</SelectItem>
                    <SelectItem value="PSV">PSV</SelectItem>
                    <SelectItem value="SIMV">SIMV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="Oronasal">Oronasal</SelectItem>
                    <SelectItem value="Nasal à coussinets">Nasal à coussinets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderReglagesForm = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Réglages</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pression Max (cmH2O)</Label>
            <Input
              type="number"
              value={formData.reglage.pmax}
              onChange={(e) => setFormData({
                ...formData,
                reglage: { ...formData.reglage, pmax: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Pression Min (cmH2O)</Label>
            <Input
              type="number"
              value={formData.reglage.pmin}
              onChange={(e) => setFormData({
                ...formData,
                reglage: { ...formData.reglage, pmin: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Ramp (min)</Label>
            <Input
              type="number"
              value={formData.reglage.pramp}
              onChange={(e) => setFormData({
                ...formData,
                reglage: { ...formData.reglage, pramp: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Humidification (%)</Label>
            <Input
              type="number"
              value={formData.reglage.hu}
              onChange={(e) => setFormData({
                ...formData,
                reglage: { ...formData.reglage, hu: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Réserve d'expiration</Label>
            <Input
              type="number"
              value={formData.reglage.re}
              onChange={(e) => setFormData({
                ...formData,
                reglage: { ...formData.reglage, re: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Commentaire</Label>
            <Textarea
              value={formData.reglage.commentaire}
              onChange={(e) => setFormData({
                ...formData,
                reglage: { ...formData.reglage, commentaire: e.target.value }
              })}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderVerificationsSecurite = () => {
    const verifications = VERIFICATIONS_SECURITE[formData.traitement] || [];
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vérifications de sécurité</h3>
        <div className="grid grid-cols-2 gap-4">
          {verifications.map((verification) => (
            <div key={verification} className="flex items-center space-x-2">
              <Checkbox
                id={verification}
                checked={formData.verification_securite[verification] || false}
                onCheckedChange={(checked: boolean) => {
                  setFormData({
                    ...formData,
                    verification_securite: {
                      ...formData.verification_securite,
                      [verification]: checked
                    }
                  });
                }}
              />
              <Label htmlFor={verification}>{verification}</Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTestsEffectues = () => {
    const tests = TESTS_EFFECTUES[formData.traitement] || [];
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tests effectués</h3>
        <div className="grid grid-cols-2 gap-4">
          {tests.map((test) => (
            <div key={test} className="flex items-center space-x-2">
              <Checkbox
                id={test}
                checked={formData.tests_effectues[test] || false}
                onCheckedChange={(checked: boolean) => {
                  setFormData({
                    ...formData,
                    tests_effectues: {
                      ...formData.tests_effectues,
                      [test]: checked
                    }
                  });
                }}
              />
              <Label htmlFor={test}>{test}</Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConsommables = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Consommables utilisés</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(CONSOMMABLES).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                type="number"
                value={formData.consommables_utilises[key] || 0}
                onChange={(e) => setFormData({
                  ...formData,
                  consommables_utilises: {
                    ...formData.consommables_utilises,
                    [key]: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMaintenance = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Maintenance</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="maintenance_preventive"
              checked={formData.maintenance_preventive}
              onCheckedChange={(checked: boolean) => {
                setFormData({
                  ...formData,
                  maintenance_preventive: checked
                });
              }}
            />
            <Label htmlFor="maintenance_preventive">Maintenance préventive effectuée</Label>
          </div>
          <div className="space-y-2">
            <Label>Date de la prochaine maintenance</Label>
            <Input
              type="date"
              value={formData.date_prochaine_maintenance}
              onChange={(e) => setFormData({
                ...formData,
                date_prochaine_maintenance: e.target.value
              })}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Détails de l'intervention</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF} disabled={!intervention?.rapport_pdf_url}>
            <FileText className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="technique">Technique</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="rapport">Rapport</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Traitement</Label>
                    <Select
                      value={formData.traitement}
                      onValueChange={(value) => setFormData({ ...formData, traitement: value as InterventionType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le traitement" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INTERVENTION_TYPES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'intervention</Label>
                    <Select
                      value={formData.type_intervention}
                      onValueChange={(value) => setFormData({ ...formData, type_intervention: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVENTION_TYPES[formData.traitement]?.types.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {renderParametresForm()}
                {renderReglagesForm()}

                <div className="space-y-2">
                  <Label>Remarques</Label>
                  <Textarea
                    value={formData.remarques}
                    onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
                    placeholder="Ajouter des remarques sur l'intervention..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value) => setFormData({ ...formData, statut: value as InterventionStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="terminee">Terminée</SelectItem>
                      <SelectItem value="annulee">Annulée</SelectItem>
                      <SelectItem value="planifiee">Planifiée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="technique">
            <ScrollArea className="h-[600px] pr-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderVerificationsSecurite()}
                {renderTestsEffectues()}
                {renderConsommables()}
                {renderMaintenance()}
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="photos">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {formData.photos.map((photo: string, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => {
                  // Logique pour ajouter des photos
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Ajouter des photos
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="rapport">
            <div className="space-y-4">
              {formData.rapport_pdf ? (
                <div className="space-y-2">
                  <p>Rapport disponible</p>
                  <Button
                    type="button"
                    onClick={handleDownloadPDF}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Télécharger le rapport
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>Aucun rapport disponible</p>
                  <Button
                    type="button"
                    onClick={() => {
                      // Logique pour générer le rapport
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Générer le rapport
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 