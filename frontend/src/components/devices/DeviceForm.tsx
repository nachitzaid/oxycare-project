"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import type { DispositifMedical, Patient, ApiResponse } from "../../types"
import Modal from "../common/Modal"

interface DeviceFormProps {
  mode: "create" | "edit"
  device: DispositifMedical | null
  onSubmit: (deviceData: Partial<DispositifMedical>) => Promise<void>
  onClose: () => void
}

const DeviceForm: React.FC<DeviceFormProps> = ({ mode, device, onSubmit, onClose }) => {
  const defaultFormData: Partial<DispositifMedical> = {
    patient_id: null,
    designation: "",
    reference: "",
    numero_serie: "",
    type_acquisition: "location",
    date_acquisition: new Date().toISOString().split("T")[0],
    date_fin_garantie: null,
    duree_location: null,
    date_fin_location: null,
    statut: "actif",
    est_sous_garantie: false,
    est_location_active: false,
  }

  const [formData, setFormData] = useState<Partial<DispositifMedical>>(device || defaultFormData)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showLocationFields, setShowLocationFields] = useState<boolean>(
    device ? device.type_acquisition === "location" : true,
  )
  const [showGarantieFields, setShowGarantieFields] = useState<boolean>(
    device ? device.type_acquisition !== "location" : false,
  )

  useEffect(() => {
    setFormData(device || defaultFormData)
    setShowLocationFields(device ? device.type_acquisition === "location" : true)
    setShowGarantieFields(device ? device.type_acquisition !== "location" : false)
    fetchPatients()
  }, [device, mode])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get<ApiResponse<Patient[]>>("/api/patients/all", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success && response.data.data) {
        setPatients(response.data.data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (name === "type_acquisition") {
      const isLocation = value === "location"
      setShowLocationFields(isLocation)
      setShowGarantieFields(!isLocation)

      // Reset related fields when changing acquisition type
      if (isLocation) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          date_fin_garantie: null,
          duree_location: prev.duree_location || 1,
          est_sous_garantie: false,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          duree_location: null,
          date_fin_location: null,
          est_location_active: false,
        }))
      }
    } else if (name === "patient_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number.parseInt(value, 10) : null,
      }))
    } else if (name === "duree_location") {
      const durationValue = value ? Number.parseInt(value, 10) : null

      // Calculate end date based on duration
      let endDate = null
      if (durationValue && formData.date_acquisition) {
        const startDate = new Date(formData.date_acquisition)
        endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + durationValue)
        endDate = endDate.toISOString().split("T")[0]
      }

      setFormData((prev) => ({
        ...prev,
        [name]: durationValue,
        date_fin_location: endDate,
      }))
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else if (name === "date_acquisition" && showLocationFields && formData.duree_location) {
      // Recalculate end date when start date changes
      const startDate = new Date(value)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + formData.duree_location)

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        date_fin_location: endDate.toISOString().split("T")[0],
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
    await onSubmit(formData)
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={mode === "create" ? "Ajouter un dispositif médical" : "Modifier un dispositif médical"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informations de base */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Patient</label>
            <select
              name="patient_id"
              value={formData.patient_id || ""}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.code_patient} - {patient.prenom} {patient.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Désignation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation || ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Référence</label>
            <input
              type="text"
              name="reference"
              value={formData.reference || ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Numéro de série</label>
            <input
              type="text"
              name="numero_serie"
              value={formData.numero_serie || ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Type d'acquisition</label>
            <select
              name="type_acquisition"
              value={formData.type_acquisition || "location"}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="location">Location</option>
              <option value="achat_garantie">Achat avec garantie</option>
              <option value="achat_externe">Achat externe</option>
              <option value="achat_oxylife">Achat OxyLife</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date d'acquisition</label>
            <input
              type="date"
              name="date_acquisition"
              value={formData.date_acquisition ? formData.date_acquisition.split("T")[0] : ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="statut"
              value={formData.statut || "actif"}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="actif">Actif</option>
              <option value="en_maintenance">En maintenance</option>
              <option value="retiré">Retiré</option>
            </select>
          </div>

          {/* Champs spécifiques à la location */}
          {showLocationFields && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Durée de location (mois)</label>
                <input
                  type="number"
                  name="duree_location"
                  value={formData.duree_location || ""}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date de fin de location</label>
                <input
                  type="date"
                  name="date_fin_location"
                  value={formData.date_fin_location ? formData.date_fin_location.split("T")[0] : ""}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                />
                <p className="text-xs text-gray-500">Calculée automatiquement</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="est_location_active"
                    checked={formData.est_location_active || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Location active</span>
                </label>
              </div>
            </>
          )}

          {/* Champs spécifiques à l'achat */}
          {showGarantieFields && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date de fin de garantie</label>
                <input
                  type="date"
                  name="date_fin_garantie"
                  value={formData.date_fin_garantie ? formData.date_fin_garantie.split("T")[0] : ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="est_sous_garantie"
                    checked={formData.est_sous_garantie || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Sous garantie</span>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Annuler
          </button>

          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            {mode === "create" ? "Créer" : "Mettre à jour"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default DeviceForm
