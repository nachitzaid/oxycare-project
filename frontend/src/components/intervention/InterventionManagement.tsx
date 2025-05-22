"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import axios from "@/lib/axios"
import { toast } from "react-toastify"
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, Calendar, Clock, Filter } from "lucide-react"
import type { Intervention, PaginatedResponse, ApiResponse, InterventionDetail } from "../../types"
import InterventionForm from "./InterventionForm"
import InterventionDetails from "./InterventionDetails"
import ConfirmDialog from "../common/ConfirmDialog"
import Pagination from "../common/Pagination"
import Spinner from "../common/Spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAuth } from "@/contexts/AuthContext"

const InterventionManagement: React.FC = () => {
  const [interventions, setInterventions] = useState<InterventionDetail[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalInterventions, setTotalInterventions] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionDetail | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const { isAuthenticated, user } = useAuth()

  const fetchInterventions = useCallback(
    async (page = 1, search = "", status = "", type = "") => {
      setLoading(true)
      setError(null)

      try {
        // Vérification de l'authentification
        if (!isAuthenticated()) {
          throw new Error("Veuillez vous connecter pour accéder à cette page")
        }

        // Construire les paramètres de requête
        const params = new URLSearchParams()
        params.append("page", page.toString())
        if (search) params.append("recherche", search)
        if (status !== "all") params.append("statut", status)
        if (type !== "all") params.append("type", type)

        // Ajouter le filtre par technicien si l'utilisateur est un technicien
        if (user?.role === "technicien" && user?.id) {
          params.append("technicien_id", user.id.toString())
        }

        const response = await axios.get<ApiResponse<PaginatedResponse<InterventionDetail>>>(
          `/interventions?${params.toString()}`,
        )

        if (response.data.success && response.data.data) {
          // Traitement des données pour afficher des informations complètes
          const processedInterventions = response.data.data.items.map((intervention) => ({
            ...intervention,
            patient: intervention.patient
              ? {
                  ...intervention.patient,
                  nom_complet: `${intervention.patient.prenom} ${intervention.patient.nom}`,
                }
              : undefined,
            dispositif: intervention.dispositif
              ? {
                  ...intervention.dispositif,
                  designation_complete: `${intervention.dispositif.designation} (${intervention.dispositif.reference})`,
                }
              : undefined,
          }))

          setInterventions(processedInterventions)
          setTotalPages(response.data.data.pages_totales || 1)
          setCurrentPage(response.data.data.page_courante || 1)
          setTotalInterventions(response.data.data.total || 0)
        } else {
          throw new Error(response.data.message || "Erreur lors du chargement des interventions")
        }
      } catch (err) {
        console.error("Erreur lors du chargement des interventions:", err)
        const message = err instanceof Error ? err.message : "Erreur de connexion au serveur"
        setError(message)
        toast.error(message)
        setInterventions([])
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, user],
  )

  useEffect(() => {
    fetchInterventions(currentPage, searchTerm, statusFilter, typeFilter)
  }, [currentPage, fetchInterventions, statusFilter, typeFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchInterventions(1, searchTerm, statusFilter, typeFilter)
  }

  const handleFilterChange = (filterType: "status" | "type", value: string) => {
    if (filterType === "status") {
      setStatusFilter(value)
    } else {
      setTypeFilter(value)
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const openCreateModal = () => {
    setSelectedIntervention(null)
    setModalMode("create")
    setShowModal(true)
  }

  const openEditModal = (intervention: InterventionDetail) => {
    setSelectedIntervention(intervention)
    setModalMode("edit")
    setShowModal(true)
  }

  const openViewModal = (intervention: InterventionDetail) => {
    setSelectedIntervention(intervention)
    setModalMode("view")
    setShowModal(true)
  }

  const openDeleteConfirm = (intervention: InterventionDetail) => {
    setSelectedIntervention(intervention)
    setShowConfirmDelete(true)
  }

  const handleDelete = async () => {
    if (!selectedIntervention) return

    try {
      const response = await axios.delete<ApiResponse>(`/interventions/${selectedIntervention.id}`)

      if (response.data.success) {
        toast.success("Intervention supprimée avec succès")
        fetchInterventions(currentPage, searchTerm, statusFilter, typeFilter)
      } else {
        throw new Error(response.data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion au serveur"
      toast.error(message)
    } finally {
      setShowConfirmDelete(false)
    }
  }

  const handleFormSubmit = async (interventionData: Partial<Intervention>) => {
    try {
      let response

      if (modalMode === "create") {
        response = await axios.post<ApiResponse>("/interventions", interventionData)
      } else if (modalMode === "edit" && selectedIntervention) {
        response = await axios.put<ApiResponse>(`/interventions/${selectedIntervention.id}`, interventionData)
      } else {
        throw new Error("Mode d'opération invalide")
      }

      if (response.data.success) {
        toast.success(
          modalMode === "create" ? "Intervention créée avec succès" : "Intervention mise à jour avec succès",
        )
        setShowModal(false)
        fetchInterventions(currentPage, searchTerm, statusFilter, typeFilter)
      } else {
        throw new Error(response.data.message || "Erreur lors de l'opération")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion au serveur"
      toast.error(message)
      return false
    }
    return true
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planifiee":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Planifiée
          </Badge>
        )
      case "en_cours":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            En cours
          </Badge>
        )
      case "terminee":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Terminée
          </Badge>
        )
      case "annulee":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Annulée
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "installation":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            Installation
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Maintenance
          </Badge>
        )
      case "reparation":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Réparation
          </Badge>
        )
      case "remplacement":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Remplacement
          </Badge>
        )
      case "formation":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            Formation
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDateTime = (date: string, time: string) => {
    try {
      if (!date) return "Non défini"

      const fullDate = new Date(`${date}T${time || "00:00"}`)
      return format(fullDate, "d MMM yyyy à HH'h'mm", { locale: fr })
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return "Date invalide"
    }
  }

  return (
    <div className="container mx-auto p-4 animate-fadeIn">
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Gestion des Interventions</CardTitle>
              <CardDescription>
                {totalInterventions > 0 ? (
                  <span>
                    {totalInterventions} intervention{totalInterventions > 1 ? "s" : ""} au total
                  </span>
                ) : (
                  "Gérez les interventions techniques"
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchInterventions(currentPage, searchTerm, statusFilter, typeFilter)}
                disabled={loading}
                title="Rafraîchir"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="sr-only">Rafraîchir</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
                title="Filtres"
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtres</span>
              </Button>
              <Button onClick={openCreateModal} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Nouvelle Intervention
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par patient, dispositif ou technicien..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                Rechercher
              </Button>
            </form>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="planifiee">Planifiée</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="terminee">Terminée</SelectItem>
                      <SelectItem value="annulee">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reparation">Réparation</SelectItem>
                      <SelectItem value="remplacement">Remplacement</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="text-destructive text-center py-8 bg-destructive/10 rounded-md flex flex-col items-center">
              <p className="mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchInterventions(currentPage, searchTerm, statusFilter, typeFilter)}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead className="hidden md:table-cell">Dispositif</TableHead>
                      <TableHead className="hidden md:table-cell">Technicien</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interventions.length > 0 ? (
                      interventions.map((intervention) => (
                        <TableRow key={intervention.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>{format(new Date(intervention.date_planifiee), "dd/MM/yyyy")}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{intervention.heure_planifiee}</span>
                              </div>
                              {intervention.est_urgente && (
                                <Badge variant="destructive" className="mt-1 text-[10px] h-5">
                                  Urgente
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(intervention.type)}</TableCell>
                          <TableCell>
                            {intervention.patient?.nom_complet || `Patient #${intervention.patient_id}`}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {intervention.dispositif?.designation_complete ||
                              `Dispositif #${intervention.dispositif_id}`}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {intervention.technicien
                              ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
                              : `Technicien #${intervention.technicien_id}`}
                          </TableCell>
                          <TableCell>{getStatusBadge(intervention.statut)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openViewModal(intervention)}
                                className="h-8 w-8 text-primary"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Voir</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(intervention)}
                                className="h-8 w-8 text-amber-500"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(intervention)}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? (
                            <div className="flex flex-col items-center">
                              <p className="mb-2">Aucune intervention ne correspond à votre recherche</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm("")
                                  setStatusFilter("all")
                                  setTypeFilter("all")
                                  fetchInterventions(1, "", "all", "all")
                                }}
                              >
                                Effacer les filtres
                              </Button>
                            </div>
                          ) : (
                            "Aucune intervention trouvée"
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showModal &&
        (modalMode === "view" ? (
          <InterventionDetails intervention={selectedIntervention} onClose={() => setShowModal(false)} />
        ) : (
          <InterventionForm
            mode={modalMode}
            intervention={selectedIntervention}
            onSubmit={handleFormSubmit}
            onClose={() => setShowModal(false)}
          />
        ))}

      {showConfirmDelete && selectedIntervention && (
        <ConfirmDialog
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer cette intervention ${selectedIntervention.type} prévue le ${format(new Date(selectedIntervention.date_planifiee), "dd/MM/yyyy")} ?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
          variant="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  )
}

export default InterventionManagement
