"use client"

import type React from "react"
import type { Patient } from "../../types"
import Modal from "../common/Modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Phone, Mail, CreditCard, User2, UserCog } from "lucide-react"

interface PatientDetailsProps {
  patient: Patient | null
  onClose: () => void
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, onClose }) => {
  if (!patient) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Détails du patient`} size="lg">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {patient.prenom} {patient.nom}
            </h2>
            <p className="text-muted-foreground">Code patient: {patient.code_patient}</p>
          </div>
          <div className="mt-2 md:mt-0">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Patient
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <User2 className="h-4 w-4 mr-2" /> Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">CIN</p>
                  <p className="font-medium">{patient.cin || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de naissance</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {formatDate(patient.date_naissance)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Date de création</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {formatDate(patient.date_creation)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2" /> Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  {patient.telephone}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  {patient.email || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  {patient.adresse ? `${patient.adresse}, ${patient.ville || ""}` : patient.ville || "Non renseignée"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <UserCog className="h-4 w-4 mr-2" /> Informations médicales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mutuelle</p>
                  <p className="font-medium flex items-center">
                    <CreditCard className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {patient.mutuelle || "Non renseignée"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prescripteur</p>
                  <p className="font-medium">
                    {patient.prescripteur_id ? `ID: ${patient.prescripteur_id}` : "Non assigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Technicien référent</p>
                  <p className="font-medium">
                    {patient.technicien_id ? `ID: ${patient.technicien_id}` : "Non assigné"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </Modal>
  )
}

export default PatientDetails
