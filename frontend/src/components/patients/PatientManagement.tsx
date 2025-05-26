"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import PatientForm from "./patient-form"
import PatientDetails from "./patient-details"
import Modal from "../common/Modal"

// Types
interface Patient {
  id: number
  code_patient?: string
  nom: string
  prenom: string
  cin?: string
  date_naissance: string
  telephone: string
  email?: string
  adresse?: string
  ville?: string
  mutuelle?: string
  prescripteur_nom?: string
  prescripteur_id?: number
  technicien_id?: number
  date_creation: string
  date_modification?: string
}

interface Prescripteur {
  id: number
  nom: string
  prenom: string
  specialite: string
  telephone?: string
  email?: string
}

interface Technicien {
  id: number
  nom: string
  prenom: string
  email?: string
}

interface ApiResponse {
  success?: boolean
  data?: any
  message?: string
  errors?: any
}

const PatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [prescripteurs, setPrescripteurs] = useState<Prescripteur[]>([])
  const [techniciens, setTechniciens] = useState<Technicien[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)

  const API_BASE_URL = "http://localhost:5000/api"

  const makeRequest = async (url: string, options: any = {}) => {
    const token = localStorage.getItem("token")
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${API_BASE_URL}${url}`, config)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Fonction pour afficher les messages
  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(message)
      setTimeout(() => setSuccess(null), 5000)
    } else {
      setError(message)
      setTimeout(() => setError(null), 5000)
    }
  }

  // Charger les patients
  const fetchPatients = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await makeRequest("/debug/patients")

      if (data.patients && Array.isArray(data.patients)) {
        const cleanedPatients = data.patients.map((patient: any) => ({
          id: patient.id,
          code_patient: patient.code_patient || `P${patient.id}`,
          nom: patient.nom || "N/A",
          prenom: patient.prenom || "N/A",
          cin: patient.cin || "",
          date_naissance: patient.date_naissance || "",
          telephone: patient.telephone || "N/A",
          email: patient.email || "",
          adresse: patient.adresse || "",
          ville: patient.ville || "",
          mutuelle: patient.mutuelle || "",
          prescripteur_nom: patient.prescripteur_nom || "",
          prescripteur_id: patient.prescripteur_id || null,
          technicien_id: patient.technicien_id || null,
          date_creation: patient.date_creation || new Date().toISOString(),
          date_modification: patient.date_modification || null,
        }))

        setPatients(cleanedPatients)
        setFilteredPatients(cleanedPatients)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des patients")
    } finally {
      setLoading(false)
    }
  }

  // Charger les prescripteurs et techniciens
  const fetchReferenceData = async () => {
    try {
      // Techniciens seulement
      try {
        const techniciensData = await makeRequest("/utilisateurs?role=technicien")
        if (techniciensData.data) {
          setTechniciens(Array.isArray(techniciensData.data) ? techniciensData.data : [])
        }
      } catch (err) {
        console.log("Erreur techniciens:", err)
        setTechniciens([])
      }
    } catch (err) {
      console.log("Erreur lors du chargement des données de référence:", err)
    }
  }

  // Créer un patient
  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    try {
      const response = await makeRequest("/debug/patients", {
        method: "POST",
        body: JSON.stringify(patientData),
      })

      if (response.success) {
        showMessage("Patient créé avec succès", "success")
        setShowCreateModal(false)
        await fetchPatients()
      } else {
        throw new Error(response.message || "Erreur lors de la création")
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la création du patient", "error")
    }
  }

  // Modifier un patient
  const handleEditPatient = async (patientData: Partial<Patient>) => {
    if (!editingPatient) return

    try {
      const response = await makeRequest(`/debug/patients/${editingPatient.id}`, {
        method: "PUT",
        body: JSON.stringify(patientData),
      })

      if (response.success) {
        showMessage("Patient modifié avec succès", "success")
        setEditingPatient(null)
        await fetchPatients()
      } else {
        throw new Error(response.message || "Erreur lors de la modification")
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la modification du patient", "error")
    }
  }

  // Supprimer un patient
  const handleDeletePatient = async () => {
    if (!deletingPatient) return

    try {
      const response = await makeRequest(`/debug/patients/${deletingPatient.id}`, {
        method: "DELETE",
      })

      if (response.success) {
        showMessage("Patient supprimé avec succès", "success")
        setDeletingPatient(null)
        await fetchPatients()
      } else {
        throw new Error(response.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la suppression du patient", "error")
    }
  }

  // Filtrage des patients
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients)
      return
    }

    const filtered = patients.filter(
      (patient) =>
        patient.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.code_patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.telephone?.includes(searchTerm),
    )

    setFilteredPatients(filtered)
  }, [searchTerm, patients])

  // Chargement initial
  useEffect(() => {
    fetchPatients()
    fetchReferenceData()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A"
      return new Date(dateString).toLocaleDateString("fr-FR")
    } catch {
      return dateString || "N/A"
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-600 mt-1">
              {patients.length > 0 ? `${patients.length} patient(s) trouvé(s)` : "Chargement..."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPatients} disabled={loading} variant="outline" className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, prénom, CIN..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement des patients...</span>
          </div>
        </div>
      )}

      {/* Tableau des patients */}
      {!loading && (
        <Card>
          <CardContent className="p-0">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchTerm ? "Aucun résultat" : "Aucun patient"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? `Aucun patient trouvé pour "${searchTerm}"`
                    : "Aucun patient n'a été trouvé dans la base de données"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CIN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ville
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date création
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{patient.code_patient}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.prenom} {patient.nom}
                            </div>
                            {patient.email && <div className="text-sm text-gray-500">{patient.email}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.cin || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.telephone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.ville || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(patient.date_creation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setViewingPatient(patient)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setEditingPatient(patient)}
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingPatient(patient)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showCreateModal && (
        <PatientForm
          mode="create"
          patient={null}
          onSubmit={handleCreatePatient}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingPatient && (
        <PatientForm
          mode="edit"
          patient={editingPatient}
          onSubmit={handleEditPatient}
          onClose={() => setEditingPatient(null)}
        />
      )}

      {viewingPatient && <PatientDetails patient={viewingPatient} onClose={() => setViewingPatient(null)} />}

      {/* Modal de confirmation de suppression */}
      {deletingPatient && (
        <Modal isOpen={true} onClose={() => setDeletingPatient(null)} title="Confirmer la suppression">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Êtes-vous sûr de vouloir supprimer ce patient ?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {deletingPatient.prenom} {deletingPatient.nom} - {deletingPatient.code_patient}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Cette action est irréversible et supprimera définitivement toutes les données associées à ce patient.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setDeletingPatient(null)} variant="outline">
                Annuler
              </Button>
              <Button onClick={handleDeletePatient} variant="destructive">
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default PatientManagement
