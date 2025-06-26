"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DeviceForm from "./DeviceForm";
import DeviceDetails from "./DeviceDetails";
import Modal from "../common/Modal";
import type { DispositifMedical, Patient } from '@/types';

// Types
interface ApiResponse {
  success?: boolean;
  data?: any;
  message?: string;
  errors?: any;
}

const DeviceManagement = () => {
  const [devices, setDevices] = useState<DispositifMedical[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DispositifMedical[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DispositifMedical | null>(null);
  const [viewingDevice, setViewingDevice] = useState<DispositifMedical | null>(null);
  const [deletingDevice, setDeletingDevice] = useState<DispositifMedical | null>(null);

  const API_BASE_URL = "http://localhost:5000/api";

  // Generic API request function
  const makeRequest = async (url: string, options: any = {}) => {
    const token = localStorage.getItem("token");
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`Erreur requête ${url}:`, error);
      throw error;
    }
  };

  // Show success/error messages
  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Fetch devices
  const fetchDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await makeRequest("/dispositifs");
      if (data.success && Array.isArray(data.data.items)) {
        const cleanedDevices = data.data.items.map((device: any) => ({
          id: device.id,
          patient_id: device.patient_id || null,
          designation: device.designation || "N/A",
          reference: device.reference || "",
          numero_serie: device.numero_serie || "",
          type_acquisition: (['location', 'achat_garantie', 'achat_externe', 'achat_oxylife'].includes(device.type_acquisition)
            ? device.type_acquisition
            : 'achat_garantie') as 'location' | 'achat_garantie' | 'achat_externe' | 'achat_oxylife',
          date_acquisition: device.date_acquisition || null,
          date_fin_garantie: device.date_fin_garantie || null,
          duree_location: device.duree_location || null,
          date_fin_location: device.date_fin_location || null,
          statut: device.statut || "actif",
          est_sous_garantie: device.est_sous_garantie || false,
          est_location_active: device.est_location_active || false,
          patient: device.patient || null,
        }));

        setDevices(cleanedDevices);
        setFilteredDevices(cleanedDevices);
      } else {
        throw new Error(data.message || "Erreur lors du chargement des dispositifs");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors du chargement des dispositifs", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const data = await makeRequest("/debug/patients");
      console.log("Réponse API patients:", data); // Log pour débogage
      if (data.success && Array.isArray(data.patients)) {
        setPatients(data.patients);
      } else {
        console.error("Erreur lors du chargement des patients:", data.message);
        showMessage(data.message || "Erreur lors de la récupération des patients", "error");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
      showMessage("Erreur lors de la récupération des patients", "error");
    }
  };

  // Create device
  const handleCreateDevice = async (deviceData: Partial<import('@/types').DispositifMedical>) => {
    const allowedTypes = ['location', 'achat_garantie', 'achat_externe', 'achat_oxylife'];
    const safeDeviceData = {
      ...deviceData,
      type_acquisition: allowedTypes.includes(deviceData.type_acquisition as string)
        ? deviceData.type_acquisition
        : 'achat_garantie',
    } as Partial<import('@/types').DispositifMedical>;
    try {
      console.log("Données envoyées pour création:", safeDeviceData); // Log pour débogage
      const response = await makeRequest("/dispositifs", {
        method: "POST",
        body: JSON.stringify(safeDeviceData),
      });

      if (response.success) {
        showMessage("Dispositif créé avec succès", "success");
        setShowCreateModal(false);
        await fetchDevices();
      } else {
        throw new Error(response.message || "Erreur lors de la création");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la création du dispositif", "error");
    }
  };

  // Edit device
  const handleEditDevice = async (deviceData: Partial<import('@/types').DispositifMedical>) => {
    if (!editingDevice) return;
    const allowedTypes = ['location', 'achat_garantie', 'achat_externe', 'achat_oxylife'];
    const safeDeviceData = {
      ...deviceData,
      type_acquisition: allowedTypes.includes(deviceData.type_acquisition as string)
        ? deviceData.type_acquisition
        : 'achat_garantie',
    } as Partial<import('@/types').DispositifMedical>;
    try {
      console.log("Données envoyées pour modification:", safeDeviceData); // Log pour débogage
      const response = await makeRequest(`/dispositifs/${editingDevice.id}`, {
        method: "PUT",
        body: JSON.stringify(safeDeviceData),
      });

      if (response.success) {
        showMessage("Dispositif modifié avec succès", "success");
        setEditingDevice(null);
        await fetchDevices();
      } else {
        throw new Error(response.message || "Erreur lors de la modification");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la modification du dispositif", "error");
    }
  };

  // Delete device
  const handleDeleteDevice = async () => {
    if (!deletingDevice) return;

    try {
      const response = await makeRequest(`/dispositifs/${deletingDevice.id}`, {
        method: "DELETE",
      });

      if (response.success) {
        showMessage("Dispositif supprimé avec succès", "success");
        setDeletingDevice(null);
        await fetchDevices();
      } else {
        throw new Error(response.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Erreur lors de la suppression du dispositif", "error");
    }
  };

  // Filter devices
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevices(devices);
      return;
    }

    const filtered = devices.filter(
      (device) =>
        device.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.numero_serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.patient &&
          `${device.patient.prenom} ${device.patient.nom}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );

    setFilteredDevices(filtered);
  }, [searchTerm, devices]);

  // Initial data fetch
  useEffect(() => {
    fetchDevices();
    fetchPatients();
  }, []);

  const formatDate = (dateString: string | null) => {
    try {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return dateString || "N/A";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Dispositifs Médicaux</h1>
            <p className="text-gray-600 mt-1">
              {devices.length > 0 ? `${devices.length} dispositif(s) trouvé(s)` : "Chargement..."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchDevices} disabled={loading} variant="outline" className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Dispositif
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

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par désignation, référence, numéro de série ou patient..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement des dispositifs...</span>
          </div>
        </div>
      )}

      {/* Devices table */}
      {!loading && (
        <Card>
          <CardContent className="p-0">
            {filteredDevices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchTerm ? "Aucun résultat" : "Aucun dispositif"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? `Aucun dispositif trouvé pour "${searchTerm}"`
                    : "Aucun dispositif n'a été trouvé dans la base de données"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Désignation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Référence/Série
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type/Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDevices.map((device) => (
                      <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{device.designation}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{device.reference || "-"}</div>
                          <div className="text-sm text-gray-500">{device.numero_serie || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {device.patient ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {device.patient.prenom} {device.patient.nom}
                              </div>
                              <div className="text-sm text-gray-500">{device.patient.code_patient}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Non assigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{device.type_acquisition.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-500">{device.statut.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>Acquis: {formatDate(device.date_acquisition)}</div>
                          <div>
                            {device.type_acquisition === 'location'
                              ? `Fin location: ${formatDate(device.date_fin_location)}`
                              : `Garantie: ${formatDate(device.date_fin_garantie)}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setViewingDevice(device)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setEditingDevice(device)}
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingDevice(device)}
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
        <DeviceForm
          mode="create"
          device={null}
          onSubmit={handleCreateDevice}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingDevice && (
        <DeviceForm
          mode="edit"
          device={editingDevice}
          onSubmit={handleEditDevice}
          onClose={() => setEditingDevice(null)}
        />
      )}

      {viewingDevice && <DeviceDetails device={viewingDevice} onClose={() => setViewingDevice(null)} />}

      {deletingDevice && (
        <Modal isOpen={true} onClose={() => setDeletingDevice(null)} title="Confirmer la suppression">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Êtes-vous sûr de vouloir supprimer ce dispositif ?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {deletingDevice.designation} - {deletingDevice.reference || deletingDevice.numero_serie}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Cette action est irréversible et supprimera définitivement toutes les données associées à ce dispositif.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setDeletingDevice(null)} variant="outline">
                Annuler
              </Button>
              <Button onClick={handleDeleteDevice} variant="destructive">
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DeviceManagement;