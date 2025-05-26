"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import Modal from "../common/Modal"

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

interface PatientFormProps {
  mode: "create" | "edit" | "view"
  patient: Patient | null
  onSubmit: (patientData: Partial<Patient>) => Promise<void>
  onClose: () => void
}

const PatientForm: React.FC<PatientFormProps> = ({ mode, patient, onSubmit, onClose }) => {
  const defaultFormData: Partial<Patient> = {
    nom: "",
    prenom: "",
    cin: "",
    date_naissance: "",
    telephone: "",
    email: "",
    adresse: "",
    ville: "",
    mutuelle: "",
    prescripteur_nom: "",
    prescripteur_id: undefined,
    technicien_id: undefined,
  }

  const [formData, setFormData] = useState<Partial<Patient>>(patient || defaultFormData)
  const [prescripteurs, setPrescripteurs] = useState<Prescripteur[]>([])
  const [techniciens, setTechniciens] = useState<Technicien[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const isReadOnly = mode === "view"

  useEffect(() => {
    setFormData(patient || defaultFormData)
    if (mode !== "view") {
      fetchReferenceData()
    }
  }, [patient, mode])

  const fetchReferenceData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      }

      // Fetch techniciens
      try {
        const response = await fetch("http://localhost:5000/api/utilisateurs/techniciens")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setTechniciens(Array.isArray(data.data) ? data.data : [])
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des techniciens:", error)
        setTechniciens([])
      }

      // Fetch prescripteurs (si nécessaire)
      try {
        const response = await fetch("http://localhost:5000/api/prescripteurs", { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setPrescripteurs(Array.isArray(data.data) ? data.data : [])
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des prescripteurs:", error)
        setPrescripteurs([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de référence:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle select fields that should be numbers or null
    if ((name === "prescripteur_id" || name === "technicien_id") && value === "") {
      setFormData((prev) => ({ ...prev, [name]: null }))
    } else if ((name === "prescripteur_id" || name === "technicien_id") && value !== "") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value, 10) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (value === "" || value === "-1") {
      setFormData((prev) => ({ ...prev, [name]: null }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value, 10) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadOnly) return

    setSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={mode === "create" ? "Ajouter un patient" : mode === "edit" ? "Modifier un patient" : "Détails du patient"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              name="nom"
              value={formData.nom || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              name="prenom"
              value={formData.prenom || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cin">CIN</Label>
            <Input
              id="cin"
              name="cin"
              value={formData.cin || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_naissance">Date de naissance *</Label>
            <Input
              id="date_naissance"
              name="date_naissance"
              type="date"
              value={formData.date_naissance ? formData.date_naissance.split("T")[0] : ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              name="telephone"
              type="tel"
              value={formData.telephone || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              name="adresse"
              value={formData.adresse || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ville">Ville</Label>
            <Input
              id="ville"
              name="ville"
              value={formData.ville || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mutuelle">Mutuelle</Label>
            <Input
              id="mutuelle"
              name="mutuelle"
              value={formData.mutuelle || ""}
              onChange={handleChange}
              disabled={isReadOnly || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technicien_id">Technicien référent</Label>
            <Select
              disabled={isReadOnly || loading || submitting}
              value={formData.technicien_id?.toString() || ""}
              onValueChange={(value) => handleSelectChange("technicien_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un technicien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">Aucun technicien</SelectItem>
                {techniciens.map((technicien) => (
                  <SelectItem key={technicien.id} value={technicien.id.toString()}>
                    {technicien.prenom} {technicien.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Afficher le code patient en mode d'affichage (view) */}
        {mode === "view" && patient?.code_patient && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Code Patient</p>
                <p className="font-medium">{patient.code_patient}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                <p className="font-medium">{new Date(patient.date_creation).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {isReadOnly ? "Fermer" : "Annuler"}
          </Button>

          {!isReadOnly && (
            <Button type="submit" disabled={submitting}>
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
          )}
        </div>
      </form>
    </Modal>
  )
}

export default PatientForm
