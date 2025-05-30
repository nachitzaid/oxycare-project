"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Patient {
  id: number;
  code_patient: string;
  nom: string;
  prenom: string;
}

interface DispositifMedical {
  id: number;
  patient_id: number | null;
  designation: string;
  reference: string;
  numero_serie: string;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  role: string;
}

interface Intervention {
  id?: number;
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
}

interface InterventionFormProps {
  mode: "create" | "edit";
  intervention?: Intervention | null;
  onSubmit: (interventionData: Partial<Intervention>) => Promise<void>;
  onClose: () => void;
}

const InterventionForm: React.FC<InterventionFormProps> = ({ mode, intervention, onSubmit, onClose }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [patientDevices, setPatientDevices] = useState<DispositifMedical[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDevices, setFetchingDevices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Intervention>>({
    patient_id: undefined,
    dispositif_id: undefined,
    technicien_id: undefined,
    type_intervention: "installation",
    planifiee: true,
    date_planifiee: "",
    date_reelle: "",
    temps_prevu: 60,
    temps_reel: null,
    actions_effectuees: "",
    satisfaction_technicien: null,
    signature_patient: false,
    signature_responsable: false,
    commentaire: "",
  });

  const API_BASE_URL = "http://localhost:5000/api";

  const makeRequest = async (url: string, options: any = {}) => {
    const token = localStorage.getItem("token");
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && url !== "/debug/patients" && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await response.text();
          console.error(`Réponse non-JSON reçue pour ${url}:`, text);
          errorMessage = `Erreur serveur: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur requête ${url}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReferenceData();
    if (intervention && mode === "edit") {
      setFormData({
        patient_id: intervention.patient_id,
        dispositif_id: intervention.dispositif_id,
        technicien_id: intervention.technicien_id,
        type_intervention: intervention.type_intervention,
        planifiee: intervention.planifiee,
        date_planifiee: intervention.date_planifiee
          ? intervention.date_planifiee.slice(0, 16)
          : "",
        date_reelle: intervention.date_reelle ? intervention.date_reelle.slice(0, 16) : "",
        temps_prevu: intervention.temps_prevu,
        temps_reel: intervention.temps_reel,
        actions_effectuees: intervention.actions_effectuees || "",
        satisfaction_technicien: intervention.satisfaction_technicien,
        signature_patient: intervention.signature_patient,
        signature_responsable: intervention.signature_responsable,
        commentaire: intervention.commentaire || "",
      });
      if (intervention.patient_id) {
        fetchPatientDevices(intervention.patient_id);
      }
    }
  }, [intervention, mode]);

  const fetchReferenceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger les patients en premier (prioritaire)
      const patientsData = await makeRequest("/debug/patients");
      
      if (patientsData.success && Array.isArray(patientsData.patients)) {
        const cleanedPatients: Patient[] = patientsData.patients.map((patient: any) => ({
          id: patient.id,
          code_patient: patient.code_patient || `P${patient.id}`,
          nom: patient.nom || "N/A",
          prenom: patient.prenom || "N/A",
        }));
        setPatients(cleanedPatients);
      } else {
        throw new Error(patientsData.message || "Erreur lors de la récupération des patients");
      }
  
      // Charger les techniciens avec gestion d'erreur séparée
      try {
        const techniciansData = await makeRequest("/utilisateurs/techniciens");
        
        if (techniciansData.success && Array.isArray(techniciansData.data)) {
          const cleanedTechnicians: User[] = techniciansData.data.map((tech: any) => ({
            id: tech.id,
            nom: tech.nom || "N/A",
            prenom: tech.prenom || "N/A",
            role: tech.role || "technicien",
          }));
          setTechnicians(cleanedTechnicians);
        } else {
          console.warn("Impossible de charger les techniciens:", techniciansData.message);
          setTechnicians([]);
          setError("Attention: Les techniciens n'ont pas pu être chargés. Vérifiez l'endpoint /api/utilisateurs");
        }
      } catch (techError) {
        console.error("Erreur lors du chargement des techniciens:", techError);
        setTechnicians([]);
        setError("Attention: Les techniciens n'ont pas pu être chargés. L'endpoint /api/utilisateurs semble avoir un problème.");
      }
  
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de la récupération des données";
      setError(errorMessage);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchPatientDevices = async (patientId: number) => {
    if (!patientId) {
      setPatientDevices([]);
      return;
    }
    setFetchingDevices(true);
    setError(null);
    try {
      const data = await makeRequest(`/dispositifs?patient_id=${patientId}`);
      if (data.success && Array.isArray(data.data.items)) {
        const cleanedDevices: DispositifMedical[] = data.data.items.map((device: any) => ({
          id: device.id,
          patient_id: device.patient_id,
          designation: device.designation || "N/A",
          reference: device.reference || "",
          numero_serie: device.numero_serie || "",
        }));
        setPatientDevices(cleanedDevices);
        if (formData.dispositif_id) {
          const deviceExists = cleanedDevices.some((d) => d.id === formData.dispositif_id);
          if (!deviceExists) {
            setFormData((prev) => ({ ...prev, dispositif_id: undefined }));
          }
        }
      } else {
        throw new Error(data.message || "Erreur lors de la récupération des dispositifs");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de la récupération des dispositifs";
      setError(errorMessage);
      setPatientDevices([]);
    } finally {
      setFetchingDevices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation des champs requis
      if (!formData.patient_id) {
        throw new Error("Le patient est requis");
      }
      if (!formData.dispositif_id) {
        throw new Error("Le dispositif est requis");
      }
      if (!formData.date_planifiee) {
        throw new Error("La date d'intervention est requise");
      }
      if (!formData.type_intervention) {
        throw new Error("Le type d'intervention est requis");
      }

      const submitData = {
        ...formData,
        patient_id: Number(formData.patient_id),
        dispositif_id: Number(formData.dispositif_id),
        technicien_id: formData.technicien_id ? Number(formData.technicien_id) : undefined,
        temps_prevu: formData.temps_prevu ? Number(formData.temps_prevu) : null,
        temps_reel: formData.temps_reel ? Number(formData.temps_reel) : null,
        satisfaction_technicien: formData.satisfaction_technicien
          ? Number(formData.satisfaction_technicien)
          : null,
        date_planifiee: formData.date_planifiee
          ? new Date(formData.date_planifiee).toISOString()
          : null,
        date_reelle: formData.date_reelle
          ? new Date(formData.date_reelle).toISOString()
          : null,
      };

      console.log("Données soumises:", submitData);
      await onSubmit(submitData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la soumission";
      setError(errorMessage);
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          type === "number"
            ? value
              ? Number(value)
              : null
            : type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : value,
      };
      if (name === "patient_id") {
        fetchPatientDevices(Number(value) || 0);
        newData.dispositif_id = undefined;
      }
      return newData;
    });
  };

  const typeInterventionOptions = [
    { value: "installation", label: "Installation" },
    { value: "controle", label: "Contrôle" },
    { value: "entretien", label: "Entretien" },
    { value: "changement_filtre", label: "Changement de filtre" },
  ];

  const satisfactionOptions = [
    { value: 1, label: "1 - Très insatisfait" },
    { value: 2, label: "2 - Insatisfait" },
    { value: 3, label: "3 - Neutre" },
    { value: 4, label: "4 - Satisfait" },
    { value: 5, label: "5 - Très satisfait" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {mode === "create" ? "Nouvelle Intervention" : "Modifier l'Intervention"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
            Chargement des données...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select
              name="patient_id"
              value={formData.patient_id ?? ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading || fetchingDevices}
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.code_patient} - {patient.prenom} {patient.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispositif * {fetchingDevices && <span className="animate-pulse">...</span>}
            </label>
            <select
              name="dispositif_id"
              value={formData.dispositif_id ?? ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading || fetchingDevices || !formData.patient_id || patientDevices.length === 0}
              required
            >
              <option value="">
                {formData.patient_id
                  ? patientDevices.length === 0
                    ? "Aucun dispositif disponible"
                    : "Sélectionner un dispositif"
                  : "Sélectionner un patient d'abord"}
              </option>
              {patientDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.designation} ({device.reference})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technicien *</label>
            <select
              name="technicien_id"
              value={formData.technicien_id ?? ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              <option value="">Sélectionner un technicien</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.prenom} {tech.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'intervention *
            </label>
            <select
              name="type_intervention"
              value={formData.type_intervention || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              {typeInterventionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intervention planifiée
            </label>
            <input
              type="checkbox"
              name="planifiee"
              checked={formData.planifiee ?? true}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date et heure prévues *
            </label>
            <input
              type="datetime-local"
              name="date_planifiee"
              value={formData.date_planifiee || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durée prévue (minutes)
            </label>
            <input
              type="number"
              name="temps_prevu"
              value={formData.temps_prevu ?? ""}
              onChange={handleChange}
              min="15"
              step="15"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actions effectuées
            </label>
            <textarea
              name="actions_effectuees"
              value={formData.actions_effectuees || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Décrivez les actions effectuées..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              name="commentaire"
              value={formData.commentaire || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Commentaires sur l'intervention..."
              disabled={loading}
            />
          </div>

          {!formData.planifiee && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date et heure réelles
                </label>
                <input
                  type="datetime-local"
                  name="date_reelle"
                  value={formData.date_reelle || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée réelle (minutes)
                </label>
                <input
                  type="number"
                  name="temps_reel"
                  value={formData.temps_reel ?? ""}
                  onChange={handleChange}
                  min="15"
                  step="15"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satisfaction technicien
                </label>
                <select
                  name="satisfaction_technicien"
                  value={formData.satisfaction_technicien ?? ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Sélectionner une note</option>
                  {satisfactionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature patient
                </label>
                <input
                  type="checkbox"
                  name="signature_patient"
                  checked={formData.signature_patient ?? false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature responsable
                </label>
                <input
                  type="checkbox"
                  name="signature_responsable"
                  checked={formData.signature_responsable ?? false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || fetchingDevices}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "En cours..." : mode === "create" ? "Créer" : "Modifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterventionForm;