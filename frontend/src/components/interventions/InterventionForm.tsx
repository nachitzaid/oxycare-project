"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "@/lib/axios"
import type { Intervention, Patient, DispositifMedical, User, ApiResponse } from "../../types"
import Modal from "../common/Modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"

interface InterventionFormProps {
  mode: "create" | "edit"
  intervention: Intervention | null
  onSubmit: (interventionData: Partial<Intervention>) => Promise<boolean>
  onClose: () => void
}

const InterventionForm: React.FC<InterventionFormProps> = ({ mode, intervention, onSubmit, onClose }) => {
  const { user } = useAuth()

  const defaultFormData: Partial<Intervention> = {
    type: "maintenance",
    statut: "planifiee",
    date_planifiee: format(new Date(), "yyyy-MM-dd"),
    heure_planifiee: "09:00",
    date_realisation: null,
    duree_minutes: 60,
    patient_id: undefined,
    dispositif_id: undefined,
    technicien_id: user?.role === "technicien" ? user.id : undefined,
    description: "",
    observations: "",
    lieu: "Domicile patient",
    est_urgente: false,
  }

  const [formData, setFormData] = useState<Partial<Intervention>>(intervention || defaultFormData)
  const [patients, setPatients] = useState<Patient[]>([])
  const [devices, setDevices] = useState<DispositifMedical[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [patientDevices, setPatientDevices] = useState<DispositifMedical[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [fetchingDevices, setFetchingDevices] = useState<boolean>(false)

  useEffect(() => {
    setFormData(intervention || defaultFormData)
    fetchReferenceData()

    // Si intervention existe, charger les dispositifs du patient
    if (intervention?.patient_id) {
      fetchPatientDevices(intervention.patient_id)
    }
  }, [intervention])

  const fetchReferenceData = async () => {
    setLoading(true)
    try {
      const [patientsRes, techniciansRes] = await Promise.all([
        axios.get<ApiResponse<Patient[]>>("/patients/all"),
        axios.get<ApiResponse<User[]>>("/utilisateurs?role=technicien"),
      ])

      if (patientsRes.data.success && patientsRes.data.data) {
        setPatients(patientsRes.data.data)
      }

      if (techniciansRes.data.success && techniciansRes.data.data) {
        setTechnicians(techniciansRes.data.data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de référence:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientDevices = async (patientId: number) => {
    if (!patientId) {
      setPatientDevices([])
      return
    }

    setFetchingDevices(true)
    try {
      const response = await axios.get<ApiResponse<DispositifMedical[]>>(`/patients/${patientId}/dispositifs`)

      if (response.data.success && response.data.data) {
        setPatientDevices(response.data.data)

        // Si nous avons un dispositif sélectionné qui n'appartient pas à ce patient, le réinitialiser
        if (formData.dispositif_id) {
          const deviceExists = response.data.data.some((device) => device.id === formData.dispositif_id)
          if (!deviceExists) {
            setFormData((prev) => ({ ...prev, dispositif_id: undefined }))
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des dispositifs du patient:", error)
    } finally {
      setFetchingDevices(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    // Gestion des champs numériques
    if (name === "duree_minutes") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number.parseInt(value, 10) : null,
      }))
    }
    // Gestion des interrupteurs
    else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    }
    // Gestion des autres champs
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "patient_id") {
      const patientId = value ? Number.parseInt(value, 10) : undefined
      setFormData((prev) => ({
        ...prev,
        patient_id: patientId,
        dispositif_id: undefined, // Réinitialiser le dispositif lorsque le patient change
      }))

      // Charger les dispositifs du patient
      if (patientId) {
        fetchPatientDevices(patientId)
      } else {
        setPatientDevices([])
      }
    } else if (name === "dispositif_id" || name === "technicien_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number.parseInt(value, 10) : undefined,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation de base
    if (!formData.patient_id || !formData.dispositif_id || !formData.technicien_id || !formData.date_planifiee) {
      alert("Veuillez remplir tous les champs obligatoires.")
      return
    }

    setSubmitting(true)
    try {
      const success = await onSubmit(formData)
      if (!success) {
        setSubmitting(false)
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={mode === "create" ? "Planifier une intervention" : "Modifier une intervention"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type et Statut */}
          <div className="space-y-2">
            <Label htmlFor="type">Type d'intervention</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
              disabled={loading || submitting}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reparation">Réparation</SelectItem>
                <SelectItem value="remplacement">Remplacement</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) => handleSelectChange("statut", value)}
              disabled={loading || submitting}
            >
              <SelectTrigger id="statut">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planifiee">Planifiée</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="terminee">Terminée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patient et Dispositif */}
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient</Label>
            <Select
              value={formData.patient_id?.toString() || ""}
              onValueChange={(value) => handleSelectChange("patient_id", value)}
              disabled={loading || submitting}
            >
              <SelectTrigger id="patient_id">
                <SelectValue placeholder="Sélectionner un patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.prenom} {patient.nom} ({patient.code_patient})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispositif_id">
              Dispositif {fetchingDevices && <Loader2 className="inline h-3 w-3 animate-spin" />}
            </Label>
            <Select
              value={formData.dispositif_id?.toString() || ""}
              onValueChange={(value) => handleSelectChange("dispositif_id", value)}
              disabled={loading || submitting || fetchingDevices || !formData.patient_id || patientDevices.length === 0}
            >
              <SelectTrigger id="dispositif_id">
                <SelectValue
                  placeholder={
                    !formData.patient_id
                      ? "Sélectionnez d'abord un patient"
                      : patientDevices.length === 0
                        ? "Aucun dispositif disponible"
                        : "Sélectionner un dispositif"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {patientDevices.map((device) => (
                  <SelectItem key={device.id} value={device.id.toString()}>
                    {device.designation} ({device.reference})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Technicien et Date prévue */}
          <div className="space-y-2">
            <Label htmlFor="technicien_id">Technicien</Label>
            <Select
              value={formData.technicien_id?.toString() || ""}
              onValueChange={(value) => handleSelectChange("technicien_id", value)}
              disabled={loading || submitting || user?.role === "technicien"}
            >
              <SelectTrigger id="technicien_id">
                <SelectValue placeholder="Sélectionner un technicien" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id.toString()}>
                    {tech.prenom} {tech.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_planifiee">Date prévue</Label>
            <Input
              id="date_planifiee"
              name="date_planifiee"
              type="date"
              value={formData.date_planifiee || ""}
              onChange={handleChange}
              disabled={loading || submitting}
              required
            />
          </div>

          {/* Heure et Durée */}
          <div className="space-y-2">
            <Label htmlFor="heure_planifiee">Heure prévue</Label>
            <Input
              id="heure_planifiee"
              name="heure_planifiee"
              type="time"
              value={formData.heure_planifiee || ""}
              onChange={handleChange}
              disabled={loading || submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duree_minutes">Durée (minutes)</Label>
            <Input
              id="duree_minutes"
              name="duree_minutes"
              type="number"
              min="15"
              step="15"
              value={formData.duree_minutes?.toString() || "60"}
              onChange={handleChange}
              disabled={loading || submitting}
            />
          </div>

          {/* Lieu et Urgence */}
          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu</Label>
            <Input
              id="lieu"
              name="lieu"
              value={formData.lieu || ""}
              onChange={handleChange}
              disabled={loading || submitting}
              placeholder="Ex: Domicile patient, Centre médical..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="est_urgente">Intervention urgente</Label>
              <Switch
                id="est_urgente"
                name="est_urgente"
                checked={formData.est_urgente || false}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, est_urgente: checked }))}
                disabled={loading || submitting}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Les interventions urgentes sont prioritaires et signalées spécifiquement.
            </p>
          </div>

          {/* Description et Observations */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              disabled={loading || submitting}
              placeholder="Décrivez l'intervention à réaliser..."
              className="min-h-[100px]"
            />
          </div>

          {formData.statut === "terminee" && (
            <>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">Observations</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  value={formData.observations || ""}
                  onChange={handleChange}
                  disabled={loading || submitting}
                  placeholder="Observations suite à l'intervention..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_realisation">Date de réalisation</Label>
                <Input
                  id="date_realisation"
                  name="date_realisation"
                  type="date"
                  value={formData.date_realisation || formData.date_planifiee || ""}
                  onChange={handleChange}
                  disabled={loading || submitting}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>

          <Button type="submit" disabled={submitting || loading || fetchingDevices}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Création..." : "Mise à jour..."}
              </>
            ) : mode === "create" ? (
              "Créer"
            ) : (
              "Mettre à jour"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default InterventionForm
