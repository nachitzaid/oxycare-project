"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import type { DispositifMedical, Patient, Accessoire, Consommable, ApiResponse } from "../../types"
import Modal from "../common/Modal"
import Spinner from "../common/Spinner"

interface DeviceDetailsProps {
  device: DispositifMedical | null
  onClose: () => void
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, onClose }) => {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [accessories, setAccessories] = useState<Accessoire[]>([])
  const [consumables, setConsumables] = useState<Consommable[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (device) {
      fetchDeviceDetails()
    }
  }, [device])

  const fetchDeviceDetails = async () => {
    if (!device) return

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch patient details
      const patientResponse = await axios.get<ApiResponse<Patient>>(`/api/patients/${device.patient_id}`, { headers })
      if (patientResponse.data.success && patientResponse.data.data) {
        setPatient(patientResponse.data.data)
      }

      // Fetch accessories
      const accessoriesResponse = await axios.get<ApiResponse<Accessoire[]>>(
        `/api/dispositifs/${device.id}/accessoires`,
        { headers },
      )
      if (accessoriesResponse.data.success && accessoriesResponse.data.data) {
        setAccessories(accessoriesResponse.data.data)
      }

      // Fetch consumables
      const consumablesResponse = await axios.get<ApiResponse<Consommable[]>>(
        `/api/dispositifs/${device.id}/consommables`,
        { headers },
      )
      if (consumablesResponse.data.success && consumablesResponse.data.data) {
        setConsumables(consumablesResponse.data.data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des détails"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!device) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getAcquisitionTypeLabel = (type: string) => {
    switch (type) {
      case "location":
        return "Location"
      case "achat_garantie":
        return "Achat avec garantie"
      case "achat_externe":
        return "Achat externe"
      case "achat_oxylife":
        return "Achat OxyLife"
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "actif":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Actif</span>
      case "en_maintenance":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">En maintenance</span>
      case "retiré":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Retiré</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Détails du dispositif: ${device.designation}`}>
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Informations du dispositif */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Informations du dispositif</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Référence</p>
                <p className="font-medium">{device.reference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Numéro de série</p>
                <p className="font-medium">{device.numero_serie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type d'acquisition</p>
                <p className="font-medium">{getAcquisitionTypeLabel(device.type_acquisition)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium">{getStatusBadge(device.statut)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'acquisition</p>
                <p className="font-medium">{formatDate(device.date_acquisition)}</p>
              </div>

              {device.type_acquisition === "location" ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Durée de location</p>
                    <p className="font-medium">{device.duree_location} mois</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de fin de location</p>
                    <p className="font-medium">{formatDate(device.date_fin_location)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location active</p>
                    <p className="font-medium">{device.est_location_active ? "Oui" : "Non"}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Date de fin de garantie</p>
                    <p className="font-medium">{formatDate(device.date_fin_garantie)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sous garantie</p>
                    <p className="font-medium">{device.est_sous_garantie ? "Oui" : "Non"}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Informations du patient */}
          {patient && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Patient associé</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Code patient</p>
                  <p className="font-medium">{patient.code_patient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {patient.prenom} {patient.nom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{patient.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ville</p>
                  <p className="font-medium">{patient.ville || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Accessoires */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Accessoires ({accessories.length})</h3>
            {accessories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">Désignation</th>
                      <th className="px-4 py-2 border">Référence</th>
                      <th className="px-4 py-2 border">N° Lot</th>
                      <th className="px-4 py-2 border">Date d'ajout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessories.map((accessory) => (
                      <tr key={accessory.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{accessory.designation}</td>
                        <td className="px-4 py-2 border">{accessory.reference}</td>
                        <td className="px-4 py-2 border">{accessory.numero_lot}</td>
                        <td className="px-4 py-2 border">{formatDate(accessory.date_creation)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucun accessoire associé</p>
            )}
          </div>

          {/* Consommables */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Consommables ({consumables.length})</h3>
            {consumables.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">Désignation</th>
                      <th className="px-4 py-2 border">Référence</th>
                      <th className="px-4 py-2 border">N° Lot</th>
                      <th className="px-4 py-2 border">Date de péremption</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumables.map((consumable) => (
                      <tr key={consumable.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{consumable.designation}</td>
                        <td className="px-4 py-2 border">{consumable.reference}</td>
                        <td className="px-4 py-2 border">{consumable.numero_lot}</td>
                        <td className="px-4 py-2 border">{formatDate(consumable.date_peremption)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucun consommable associé</p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
              Fermer
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default DeviceDetails
