"use client"

import type React from "react"
import type { InterventionDetail } from "../../types"
import Modal from "../common/Modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Calendar,
  Clock,
  Cpu,
  User,
  MapPin,
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  PenToolIcon as Tool,
} from "lucide-react"

interface InterventionDetailsProps {
  intervention: InterventionDetail | null
  onClose: () => void
}

const InterventionDetails: React.FC<InterventionDetailsProps> = ({ intervention, onClose }) => {
  if (!intervention) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie"
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return ""
    return timeString.substring(0, 5)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planifiee":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Planifiée</Badge>
      case "en_cours":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">En cours</Badge>
      case "terminee":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Terminée</Badge>
      case "annulee":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Annulée</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "installation":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Installation</Badge>
        )
      case "maintenance":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Maintenance</Badge>
      case "reparation":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Réparation</Badge>
      case "remplacement":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Remplacement</Badge>
      case "formation":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Formation</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Détails de l'intervention`} size="lg">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Intervention {getTypeBadge(intervention.type)}</h2>
              {intervention.est_urgente && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Urgente
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(intervention.date_planifiee)} <Clock className="h-4 w-4 ml-2 mr-1" />
              {formatTime(intervention.heure_planifiee)}
            </p>
          </div>
          <div className="mt-2 md:mt-0">{getStatusBadge(intervention.statut)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Information patient */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <User className="h-4 w-4 mr-2" /> Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">
                  {intervention.patient
                    ? `${intervention.patient.prenom} ${intervention.patient.nom}`
                    : `Patient #${intervention.patient_id}`}
                </p>
              </div>
              {intervention.patient && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Code patient</p>
                    <p className="font-medium">{intervention.patient.code_patient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{intervention.patient.telephone}</p>
                  </div>
                  {intervention.patient.adresse && (
                    <div>
                      <p className="text-sm text-muted-foreground">Adresse</p>
                      <p className="font-medium">
                        {intervention.patient.adresse}, {intervention.patient.ville || ""}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Information dispositif */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Cpu className="h-4 w-4 mr-2" /> Dispositif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Désignation</p>
                <p className="font-medium">
                  {intervention.dispositif
                    ? intervention.dispositif.designation
                    : `Dispositif #${intervention.dispositif_id}`}
                </p>
              </div>
              {intervention.dispositif && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Référence</p>
                    <p className="font-medium">{intervention.dispositif.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Numéro de série</p>
                    <p className="font-medium">{intervention.dispositif.numero_serie}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="font-medium capitalize">{intervention.dispositif.statut.replace(/_/g, " ")}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Détails de l'intervention */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Tool className="h-4 w-4 mr-2" /> Détails de l'intervention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Technicien</p>
                  <p className="font-medium">
                    {intervention.technicien
                      ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
                      : `Technicien #${intervention.technicien_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée prévue</p>
                  <p className="font-medium">
                    {intervention.duree_minutes ? `${intervention.duree_minutes} minutes` : "Non définie"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lieu</p>
                  <p className="font-medium flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {intervention.lieu || "Non précisé"}
                  </p>
                </div>
              </div>

              {intervention.description && (
                <div className="p-4 bg-muted/30 rounded-md mb-6">
                  <h4 className="font-medium flex items-center mb-2">
                    <FileText className="h-4 w-4 mr-2" /> Description
                  </h4>
                  <p className="text-sm whitespace-pre-line">{intervention.description}</p>
                </div>
              )}

              {intervention.statut === "terminee" && (
                <>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-md">
                    <h4 className="font-medium flex items-center mb-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-2" /> Intervention terminée
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date de réalisation</p>
                        <p className="font-medium">{formatDate(intervention.date_realisation)}</p>
                      </div>
                    </div>
                    {intervention.observations && (
                      <div>
                        <h5 className="text-sm font-medium flex items-center mb-1">
                          <ClipboardList className="h-3.5 w-3.5 mr-1" /> Observations
                        </h5>
                        <p className="text-sm whitespace-pre-line">{intervention.observations}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
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

export default InterventionDetails
