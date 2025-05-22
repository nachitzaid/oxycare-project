"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from "react-icons/fa"
import type { DispositifMedical, PaginatedResponse, ApiResponse } from "../../types"
import DeviceForm from "./DeviceForm"
import DeviceDetails from "./DeviceDetails"
import ConfirmDialog from "../common/ConfirmDialog"
import Pagination from "../common/Pagination"
import Spinner from "../common/Spinner"

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<DispositifMedical[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedDevice, setSelectedDevice] = useState<DispositifMedical | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create")
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

  const fetchDevices = async (page = 1, search = "") => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get<ApiResponse<PaginatedResponse<DispositifMedical>>>(
        `/api/dispositifs?page=${page}&recherche=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success && response.data.data) {
        setDevices(response.data.data.items)
        setTotalPages(response.data.data.pages_totales)
        setCurrentPage(response.data.data.page_courante)
      } else {
        throw new Error(response.data.message || "Erreur lors du chargement des dispositifs")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des dispositifs"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices(currentPage, searchTerm)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchDevices(1, searchTerm)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const openCreateModal = () => {
    setSelectedDevice(null)
    setModalMode("create")
    setShowModal(true)
  }

  const openEditModal = (device: DispositifMedical) => {
    setSelectedDevice(device)
    setModalMode("edit")
    setShowModal(true)
  }

  const openViewModal = (device: DispositifMedical) => {
    setSelectedDevice(device)
    setModalMode("view")
    setShowModal(true)
  }

  const openDeleteConfirm = (device: DispositifMedical) => {
    setSelectedDevice(device)
    setShowConfirmDelete(true)
  }

  const handleDelete = async () => {
    if (!selectedDevice) return

    try {
      const token = localStorage.getItem("token")
      const response = await axios.delete<ApiResponse>(`/api/dispositifs/${selectedDevice.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        toast.success("Dispositif supprimé avec succès")
        fetchDevices(currentPage, searchTerm)
      } else {
        throw new Error(response.data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression"
      toast.error(message)
    } finally {
      setShowConfirmDelete(false)
    }
  }

  const handleFormSubmit = async (deviceData: Partial<DispositifMedical>) => {
    try {
      const token = localStorage.getItem("token")
      let response

      if (modalMode === "create") {
        response = await axios.post<ApiResponse>("/api/dispositifs", deviceData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        response = await axios.put<ApiResponse>(`/api/dispositifs/${selectedDevice?.id}`, deviceData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      if (response.data.success) {
        toast.success(modalMode === "create" ? "Dispositif créé avec succès" : "Dispositif mis à jour avec succès")
        setShowModal(false)
        fetchDevices(currentPage, searchTerm)
      } else {
        throw new Error(response.data.message || "Erreur lors de l'opération")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'opération"
      toast.error(message)
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Dispositifs Médicaux</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Nouveau Dispositif
        </button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par désignation, référence ou numéro de série..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            <FaSearch className="mr-2" /> Rechercher
          </button>
        </form>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Désignation</th>
                  <th className="px-4 py-2 border">Référence</th>
                  <th className="px-4 py-2 border">N° Série</th>
                  <th className="px-4 py-2 border">Type d'acquisition</th>
                  <th className="px-4 py-2 border">Statut</th>
                  <th className="px-4 py-2 border">Garantie</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.length > 0 ? (
                  devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{device.designation}</td>
                      <td className="px-4 py-2 border">{device.reference}</td>
                      <td className="px-4 py-2 border">{device.numero_serie}</td>
                      <td className="px-4 py-2 border capitalize">{device.type_acquisition.replace(/_/g, " ")}</td>
                      <td className="px-4 py-2 border">{getStatusBadge(device.statut)}</td>
                      <td className="px-4 py-2 border">
                        {device.est_sous_garantie ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => openViewModal(device)}
                            className="bg-green-600 hover:bg-green-700 text-white p-1 rounded"
                            title="Voir"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => openEditModal(device)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white p-1 rounded"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(device)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-2 text-center">
                      Aucun dispositif trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {showModal &&
        (modalMode === "view" ? (
          <DeviceDetails device={selectedDevice} onClose={() => setShowModal(false)} />
        ) : (
          <DeviceForm
            mode={modalMode}
            device={selectedDevice}
            onSubmit={handleFormSubmit}
            onClose={() => setShowModal(false)}
          />
        ))}

      {showConfirmDelete && selectedDevice && (
        <ConfirmDialog
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer le dispositif ${selectedDevice.designation} (${selectedDevice.reference}) ?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  )
}

export default DeviceManagement
