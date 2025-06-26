"use client";

import React, { useEffect, useState } from 'react';
import { TechnicianInterventionDetails } from '@/components/interventions/TechnicianInterventionDetails';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInterventions } from '@/hooks/useInterventions';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { Intervention, InterventionType, InterventionStatus } from '@/types/intervention';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

function completeIntervention(intervention: any): Intervention {
  return {
    verification_securite: intervention.verification_securite || {},
    tests_effectues: intervention.tests_effectues || {},
    consommables_utilises: intervention.consommables_utilises || {},
    maintenance_preventive: intervention.maintenance_preventive || false,
    date_prochaine_maintenance: intervention.date_prochaine_maintenance || null,
    parametres: intervention.parametres || {},
    photos: intervention.photos || [],
    signature_technicien: intervention.signature_technicien || null,
    rapport_pdf_url: intervention.rapport_pdf_url || null,
    remarques: intervention.remarques || null,
    motif_annulation: intervention.motif_annulation || null,
    date_reprogrammation: intervention.date_reprogrammation || null,
    actions_effectuees: intervention.actions_effectuees || {},
    accessoires_utilises: intervention.accessoires_utilises || {},
    etat_materiel: intervention.etat_materiel || null,
    type_concentrateur: intervention.type_concentrateur || null,
    mode_ventilation: intervention.mode_ventilation || null,
    type_masque: intervention.type_masque || null,
    date_reelle: intervention.date_reelle || null,
    date_creation: intervention.date_creation,
    date_modification: intervention.date_modification,
    planifiee: intervention.planifiee,
    temps_prevu: intervention.temps_prevu,
    temps_reel: intervention.temps_reel || null,
    satisfaction_technicien: intervention.satisfaction_technicien || null,
    satisfaction_patient: intervention.satisfaction_patient || null,
    commentaire: intervention.commentaire || null,
    id: intervention.id,
    patient_id: intervention.patient_id,
    dispositif_id: intervention.dispositif_id,
    technicien_id: intervention.technicien_id,
    reglage_id: intervention.reglage_id,
    traitement: intervention.traitement,
    type_intervention: intervention.type_intervention,
    date_planifiee: intervention.date_planifiee,
    lieu: intervention.lieu,
    statut: intervention.statut,
    patient: intervention.patient,
    dispositif: intervention.dispositif,
    technicien: intervention.technicien,
    reglage: intervention.reglage,
  };
}

export default function TechnicianInterventionsPage() {
  const { user, isTechnician, loading: authLoading } = useAuth();
  const router = useRouter();
  const { interventions, loading, error, updateIntervention, deleteIntervention, fetchInterventions } = useInterventions();
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Forcer le rechargement des données
  useEffect(() => {
    if (fetchInterventions) {
      fetchInterventions(1, 10);
    }
  }, [refreshKey, fetchInterventions]);

  // Vérifier si l'utilisateur est un technicien
  useEffect(() => {
    if (!authLoading && !isTechnician()) {
      router.push('/login');
      toast({
        title: "Accès refusé",
        description: "Vous devez être technicien pour accéder à cette page",
        variant: "destructive",
      });
    }
  }, [isTechnician, router, toast, authLoading]);

  // Vérifier si l'intervention sélectionnée est bien assignée au technicien
  useEffect(() => {
    if (selectedIntervention && selectedIntervention.technicien_id !== user?.id) {
      console.log("Tentative d'accès à une intervention non assignée:", {
        interventionId: selectedIntervention.id,
        interventionTechnicienId: selectedIntervention.technicien_id,
        userTechnicienId: user?.id
      });
      setSelectedIntervention(null);
      toast({
        title: "Accès non autorisé",
        description: "Cette intervention ne vous est pas assignée",
        variant: "destructive",
      });
    }
  }, [selectedIntervention, user?.id, toast]);

  // Afficher un message de chargement pendant la vérification de l'authentification
  if (authLoading) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur n'est pas un technicien, ne rien afficher
  if (!isTechnician()) {
    return null;
  }

  // Filtrer les interventions du technicien
  const technicianInterventions = interventions.filter(
    (intervention) => intervention.technicien_id === user?.id
  );

  console.log("Interventions assignées au technicien:", {
    technicienId: user?.id,
    totalInterventions: interventions.length,
    interventionsAssignees: technicianInterventions.length,
    interventions: technicianInterventions.map(i => ({
      id: i.id,
      type: i.type_intervention,
      technicien_id: i.technicien_id,
      statut: i.statut
    }))
  });

  console.log("Toutes les interventions:", interventions.map(i => ({
    id: i.id,
    type: i.type_intervention,
    technicien_id: i.technicien_id,
    statut: i.statut
  })));

  // Grouper les interventions par statut
  const interventionsByStatus = {
    planifiee: technicianInterventions.filter(i => i.statut === 'planifiee'),
    en_cours: technicianInterventions.filter(i => i.statut === 'en_cours'),
    terminee: technicianInterventions.filter(i => i.statut === 'terminee'),
    autres: technicianInterventions.filter(i => 
      ['patient_absent', 'annulee', 'reportee', 'partielle'].includes(i.statut)
    ),
  };

  const handleUpdateIntervention = async (data: Partial<Intervention>) => {
    if (selectedIntervention) {
      try {
        console.log("Mise à jour de l'intervention:", {
          interventionId: selectedIntervention.id,
          technicienId: user?.id,
          interventionTechnicienId: selectedIntervention.technicien_id,
          data
        });
        await updateIntervention({
          ...selectedIntervention,
          ...data
        });
        
        // Forcer le rechargement des données
        setRefreshKey(prev => prev + 1);
        
        // Mettre à jour l'intervention sélectionnée avec les nouvelles données
        setSelectedIntervention(prev => prev ? {
          ...prev,
          ...data
        } : null);

        toast({
          title: "Succès",
          description: "L'intervention a été mise à jour avec succès",
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteIntervention = async (id: number) => {
    try {
      await deleteIntervention(id);
      setSelectedIntervention(null);
      // Forcer le rechargement des données
      setRefreshKey(prev => prev + 1);
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
  };

  const handleSelectIntervention = (intervention: Intervention) => {
    if (intervention.technicien_id !== user?.id) {
      toast({
        title: "Accès non autorisé",
        description: "Cette intervention ne vous est pas assignée",
        variant: "destructive",
      });
      return;
    }
    // Mettre à jour l'intervention sélectionnée avec les données complètes
    setSelectedIntervention({
      ...intervention,
      type_intervention: intervention.type_intervention,
      statut: intervention.statut,
      date_planifiee: intervention.date_planifiee,
      patient: intervention.patient,
      reglage: intervention.reglage,
      verification_securite: intervention.verification_securite || {},
      tests_effectues: intervention.tests_effectues || {},
      consommables_utilises: intervention.consommables_utilises || {},
      maintenance_preventive: intervention.maintenance_preventive || false,
      date_prochaine_maintenance: intervention.date_prochaine_maintenance || null,
      parametres: intervention.parametres || {},
      photos: intervention.photos || [],
      signature_technicien: intervention.signature_technicien || null,
      rapport_pdf_url: intervention.rapport_pdf_url || null,
      remarques: intervention.remarques || null,
      motif_annulation: intervention.motif_annulation || null,
      date_reprogrammation: intervention.date_reprogrammation || null,
      actions_effectuees: intervention.actions_effectuees || {},
      accessoires_utilises: intervention.accessoires_utilises || {},
      etat_materiel: intervention.etat_materiel || null,
      type_concentrateur: intervention.type_concentrateur || null,
      mode_ventilation: intervention.mode_ventilation || null,
      type_masque: intervention.type_masque || null,
      date_reelle: intervention.date_reelle || null,
      date_creation: intervention.date_creation,
      date_modification: intervention.date_modification,
      planifiee: intervention.planifiee,
      temps_prevu: intervention.temps_prevu,
      temps_reel: intervention.temps_reel || null,
      satisfaction_technicien: intervention.satisfaction_technicien || null,
      satisfaction_patient: intervention.satisfaction_patient || null,
      commentaire: intervention.commentaire || null
    });
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar à gauche */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Navbar en haut */}
        <Navbar />
        {/* Contenu principal */}
        <main className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-6">Mes Interventions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liste des interventions */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="planifiee">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="planifiee">Planifiées</TabsTrigger>
                <TabsTrigger value="en_cours">En cours</TabsTrigger>
                <TabsTrigger value="terminee">Terminées</TabsTrigger>
                <TabsTrigger value="autres">Autres</TabsTrigger>
              </TabsList>

              <TabsContent value="planifiee">
                {interventionsByStatus.planifiee.map((intervention) => (
                  <div
                    key={intervention.id}
                    className={`p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50 ${
                      selectedIntervention?.id === intervention.id ? 'bg-gray-100' : ''
                    }`}
                            onClick={() => handleSelectIntervention(completeIntervention(intervention))}
                  >
                    <h3 className="font-semibold">{intervention.type_intervention}</h3>
                    <p>Date: {new Date(intervention.date_planifiee).toLocaleDateString()}</p>
                    <p>Patient: {intervention.patient?.nom} {intervention.patient?.prenom}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="en_cours">
                {interventionsByStatus.en_cours.map((intervention) => (
                  <div
                    key={intervention.id}
                    className={`p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50 ${
                      selectedIntervention?.id === intervention.id ? 'bg-gray-100' : ''
                    }`}
                            onClick={() => handleSelectIntervention(completeIntervention(intervention))}
                  >
                    <h3 className="font-semibold">{intervention.type_intervention}</h3>
                    <p>Date: {new Date(intervention.date_planifiee).toLocaleDateString()}</p>
                    <p>Patient: {intervention.patient?.nom} {intervention.patient?.prenom}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="terminee">
                {interventionsByStatus.terminee.map((intervention) => (
                  <div
                    key={intervention.id}
                    className={`p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50 ${
                      selectedIntervention?.id === intervention.id ? 'bg-gray-100' : ''
                    }`}
                            onClick={() => handleSelectIntervention(completeIntervention(intervention))}
                  >
                    <h3 className="font-semibold">{intervention.type_intervention}</h3>
                    <p>Date: {new Date(intervention.date_planifiee).toLocaleDateString()}</p>
                    <p>Patient: {intervention.patient?.nom} {intervention.patient?.prenom}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="autres">
                {interventionsByStatus.autres.map((intervention) => (
                  <div
                    key={intervention.id}
                    className={`p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50 ${
                      selectedIntervention?.id === intervention.id ? 'bg-gray-100' : ''
                    }`}
                            onClick={() => handleSelectIntervention(completeIntervention(intervention))}
                  >
                    <h3 className="font-semibold">{intervention.type_intervention}</h3>
                    <p>Date: {new Date(intervention.date_planifiee).toLocaleDateString()}</p>
                    <p>Patient: {intervention.patient?.nom} {intervention.patient?.prenom}</p>
                    <p>Statut: {intervention.statut}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Détails de l'intervention */}
        {selectedIntervention ? (
          <TechnicianInterventionDetails
            intervention={selectedIntervention}
            onUpdate={handleUpdateIntervention}
            onDelete={handleDeleteIntervention}
                    user={user}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-[500px]">
              <p className="text-gray-500">Sélectionnez une intervention pour voir les détails</p>
            </CardContent>
          </Card>
        )}
          </div>
        </main>
      </div>
    </div>
  );
} 