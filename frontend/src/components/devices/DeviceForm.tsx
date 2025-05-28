import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Patient {
  id: number;
  code_patient: string;
  nom: string;
  prenom: string;
}

interface DispositifMedical {
  id?: number;
  patient_id: number | null;
  designation: string;
  reference: string;
  numero_serie: string;
  type_acquisition: string;
  date_acquisition: string;
  date_fin_garantie: string;
  duree_location: number | null;
  date_fin_location: string;
  statut: string;
}

interface DeviceFormProps {
  mode: 'create' | 'edit';
  device?: DispositifMedical | null;
  onSubmit: (deviceData: Partial<DispositifMedical>) => Promise<void>;
  onClose: () => void;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ mode, device, onSubmit, onClose }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DispositifMedical>>({
    patient_id: null,
    designation: '',
    reference: '',
    numero_serie: '',
    type_acquisition: 'achat_garantie',
    date_acquisition: '',
    date_fin_garantie: '',
    duree_location: null,
    date_fin_location: '',
    statut: 'actif'
  });

  useEffect(() => {
    fetchPatients();
    if (device && mode === 'edit') {
      setFormData({
        patient_id: device.patient_id,
        designation: device.designation,
        reference: device.reference,
        numero_serie: device.numero_serie,
        type_acquisition: device.type_acquisition,
        date_acquisition: device.date_acquisition || '',
        date_fin_garantie: device.date_fin_garantie || '',
        duree_location: device.duree_location,
        date_fin_location: device.date_fin_location || '',
        statut: device.statut
      });
    }
  }, [device, mode]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/debug/patients');
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        patient_id: formData.patient_id ? Number(formData.patient_id) : null,
        duree_location: formData.duree_location ? Number(formData.duree_location) : null
      };

      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null) {
          if (key !== 'patient_id' && key !== 'duree_location') {
            delete submitData[key];
          }
        }
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const typeAcquisitionOptions = [
    { value: 'location', label: 'Location' },
    { value: 'achat_garantie', label: 'Achat avec garantie' },
    { value: 'achat_externe', label: 'Achat externe' },
    { value: 'achat_oxylife', label: 'Achat Oxylife' }
  ];

  const statutOptions = [
    { value: 'actif', label: 'Actif' },
    { value: 'en_maintenance', label: 'En maintenance' },
    { value: 'retiré', label: 'Retiré' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'Nouveau Dispositif Médical' : 'Modifier le Dispositif'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient (optionnel)
            </label>
            <select
              name="patient_id"
              value={formData.patient_id || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucun patient assigné</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.code_patient} - {patient.prenom} {patient.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Désignation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Désignation *
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation || ''}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Concentrateur d'oxygène"
            />
          </div>

          {/* Référence et Numéro de série */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: CONC-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de série
              </label>
              <input
                type="text"
                name="numero_serie"
                value={formData.numero_serie || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: SN123456"
              />
            </div>
          </div>

          {/* Type d'acquisition et Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'acquisition *
              </label>
              <select
                name="type_acquisition"
                value={formData.type_acquisition || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                {typeAcquisitionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                name="statut"
                value={formData.statut || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                {statutOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'acquisition
              </label>
              <input
                type="date"
                name="date_acquisition"
                value={formData.date_acquisition || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin de garantie
              </label>
              <input
                type="date"
                name="date_fin_garantie"
                value={formData.date_fin_garantie || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Champs spécifiques à la location */}
          {formData.type_acquisition === 'location' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée de location (mois)
                </label>
                <input
                  type="number"
                  name="duree_location"
                  value={formData.duree_location || ''}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date fin de location
                </label>
                <input
                  type="date"
                  name="date_fin_location"
                  value={formData.date_fin_location || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'En cours...' : (mode === 'create' ? 'Créer' : 'Modifier')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceForm;