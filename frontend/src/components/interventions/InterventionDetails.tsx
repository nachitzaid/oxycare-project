"use client"

import type React from "react"
import { useState } from "react"
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
  Star,
  UserCheck,
  FileSignature,
  X,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Types basés sur votre structure de données réelle
interface Patient {
  id: number;
  code_patient: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
}

interface DispositifMedical {
  id: number;
  designation: string;
  reference: string;
  numero_serie: string;
  statut?: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
}

interface Intervention {
  id: number;
  patient_id: number;
  dispositif_id: number;
  technicien_id: number;
  type_intervention: string;
  planifiee: boolean;
  date_planifiee: string | null;
  date_reelle: string | null;
  temps_prevu: number | null;
  temps_reel: number | null;
  actions_effectuees: string | null;
  satisfaction_technicien: number | null;
  signature_patient: boolean;
  signature_responsable: boolean;
  commentaire: string | null;
  date_creation: string | null;
  patient?: Patient;
  dispositif?: DispositifMedical;
  technicien?: Utilisateur;
}

interface InterventionDetailsProps {
  intervention: Intervention | null
  onClose: () => void
  onEdit?: (intervention: Intervention) => void
  onDelete?: (interventionId: number) => Promise<void>
}

const InterventionDetails: React.FC<InterventionDetailsProps> = ({ intervention, onClose, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!intervention) return null

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    setError(null)
    
    try {
      await onDelete(intervention.id)
      setShowDeleteConfirm(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie"
    try {
      return format(new Date(dateString), "d MMMM yyyy à HH:mm", { locale: fr })
    } catch (error) {
      return "Date invalide"
    }
  }

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return "Non définie"
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: fr })
    } catch (error) {
      return "Date invalide"
    }
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return ""
    try {
      return format(new Date(timeString), "HH:mm", { locale: fr })
    } catch (error) {
      return ""
    }
  }

  const getStatusBadge = () => {
    if (!intervention.planifiee && intervention.date_reelle) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Terminée</Badge>
    } else if (intervention.planifiee && !intervention.date_reelle) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Planifiée</Badge>
    } else if (!intervention.planifiee && !intervention.date_reelle) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">En attente</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Statut inconnu</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "installation":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Installation</Badge>
        )
      case "controle":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Contrôle</Badge>
      case "entretien":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Entretien</Badge>
      case "changement_filtre":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Changement de filtre</Badge>
      case "reparation":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Réparation</Badge>
      case "remplacement":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Remplacement</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getSatisfactionStars = (satisfaction: number | null) => {
    if (!satisfaction) return "Non évaluée"
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < satisfaction ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const getSatisfactionText = (satisfaction: number | null) => {
    if (!satisfaction) return "Non évaluée"
    switch (satisfaction) {
      case 1: return "Très insatisfait"
      case 2: return "Insatisfait"
      case 3: return "Neutre"
      case 4: return "Satisfait"
      case 5: return "Très satisfait"
      default: return "Non évaluée"
    }
  }

  const isCompleted = !intervention.planifiee && intervention.date_reelle

  return (
    <Modal isOpen={true} onClose={onClose} title="Détails de l'intervention" size="lg">
      <div className="space-y-6">
        {/* En-tête avec statut */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold">Intervention {getTypeBadge(intervention.type_intervention)}</h2>
            </div>
            <p className="text-muted-foreground flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDateOnly(intervention.date_planifiee)} 
              {intervention.date_planifiee && (
                <>
                  <Clock className="h-4 w-4 ml-2 mr-1" />
                  {formatTime(intervention.date_planifiee)}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            {getStatusBadge()}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(intervention)}
                className="flex items-center gap-1"
              >
                <Tool className="h-4 w-4" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>
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
                  {intervention.patient.telephone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{intervention.patient.telephone}</p>
                    </div>
                  )}
                  {intervention.patient.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{intervention.patient.email}</p>
                    </div>
                  )}
                  {intervention.patient.adresse && (
                    <div>
                      <p className="text-sm text-muted-foreground">Adresse</p>
                      <p className="font-medium flex items-start">
                        <MapPin className="h-4 w-4 mr-1 mt-1 text-muted-foreground flex-shrink-0" />
                        <span>
                          {intervention.patient.adresse}
                          {intervention.patient.ville && `, ${intervention.patient.ville}`}
                        </span>
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
                <Cpu className="h-4 w-4 mr-2" /> Dispositif médical
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
                    <p className="font-medium">{intervention.dispositif.reference || "Non spécifiée"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Numéro de série</p>
                    <p className="font-medium">{intervention.dispositif.numero_serie || "Non spécifié"}</p>
                  </div>
                  {intervention.dispositif.statut && (
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <p className="font-medium capitalize">{intervention.dispositif.statut.replace(/_/g, " ")}</p>
                    </div>
                  )}
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
                  <p className="text-sm text-muted-foreground">Technicien assigné</p>
                  <p className="font-medium">
                    {intervention.technicien
                      ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
                      : `Technicien #${intervention.technicien_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée prévue</p>
                  <p className="font-medium">
                    {intervention.temps_prevu ? `${intervention.temps_prevu} minutes` : "Non définie"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type d'intervention</p>
                  <p className="font-medium">
                    {intervention.planifiee ? "Planifiée" : "Non planifiée"}
                  </p>
                </div>
              </div>

              {intervention.date_creation && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Date de création</p>
                  <p className="font-medium">{formatDate(intervention.date_creation)}</p>
                </div>
              )}

              {intervention.commentaire && (
                <div className="p-4 bg-muted/30 rounded-md mb-6">
                  <h4 className="font-medium flex items-center mb-2">
                    <FileText className="h-4 w-4 mr-2" /> Commentaire initial
                  </h4>
                  <p className="text-sm whitespace-pre-line">{intervention.commentaire}</p>
                </div>
              )}

              {/* Section pour les interventions terminées */}
              {isCompleted && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-md">
                  <h4 className="font-medium flex items-center mb-4 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2" /> Intervention terminée
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date de réalisation</p>
                      <p className="font-medium">{formatDate(intervention.date_reelle)}</p>
                    </div>
                    {intervention.temps_reel && (
                      <div>
                        <p className="text-sm text-muted-foreground">Durée réelle</p>
                        <p className="font-medium">{intervention.temps_reel} minutes</p>
                      </div>
                    )}
                  </div>

                  {intervention.actions_effectuees && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium flex items-center mb-2">
                        <ClipboardList className="h-3.5 w-3.5 mr-1" /> Actions effectuées
                      </h5>
                      <p className="text-sm whitespace-pre-line bg-white dark:bg-gray-800 p-3 rounded border">
                        {intervention.actions_effectuees}
                      </p>
                    </div>
                  )}

                  {intervention.satisfaction_technicien && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium flex items-center mb-2">
                        <Star className="h-3.5 w-3.5 mr-1" /> Satisfaction du technicien
                      </h5>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getSatisfactionStars(intervention.satisfaction_technicien)}</div>
                        <span className="text-sm text-muted-foreground">
                          ({intervention.satisfaction_technicien}/5 - {getSatisfactionText(intervention.satisfaction_technicien)})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Signature patient:</span>
                      {intervention.signature_patient ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Signée
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non signée</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Signature responsable:</span>
                      {intervention.signature_responsable ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Signée
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non signée</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette intervention ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à cette intervention seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  )
}

export default InterventionDetails