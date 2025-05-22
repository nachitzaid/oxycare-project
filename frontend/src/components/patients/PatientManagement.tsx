import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

// Types simplifiés
interface Patient {
  id: number;
  code_patient?: string;
  nom: string;
  prenom: string;
  cin?: string;
  date_naissance: string;
  telephone: string;
  email?: string;
  adresse?: string;
  ville?: string;
  mutuelle?: string;
  prescripteur_nom?: string;
  technicien_id?: number;
  date_creation: string;
  date_modification?: string;
}

interface ApiResponse {
  success?: boolean;
  data?: any;
  message?: string;
  count?: number;
  patients?: Patient[];
}

const PatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  // Configuration axios simple
  const API_BASE_URL = 'http://localhost:5000/api';
  
  const makeRequest = async (url: string, options: any = {}) => {
    const token = localStorage.getItem('token');
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  };

  // Fonction pour charger les patients
  const fetchPatients = async () => {
    console.log('=== Début fetchPatients ===');
    setLoading(true);
    setError(null);

    try {
      // Essayer d'abord l'endpoint de debug qui fonctionne
      console.log('Tentative avec /debug/patients...');
      let data;
      
      try {
        data = await makeRequest('/debug/patients');
        console.log('Réponse de /debug/patients:', data);
        
        if (data.patients && Array.isArray(data.patients)) {
          // Nettoyer et valider les données des patients
          const cleanedPatients = data.patients.map((patient: any) => ({
            id: patient.id,
            code_patient: patient.code_patient || `P${patient.id}`,
            nom: patient.nom || 'N/A',
            prenom: patient.prenom || 'N/A',
            cin: patient.cin || '',
            date_naissance: patient.date_naissance || '',
            telephone: patient.telephone || 'N/A',
            email: patient.email || '',
            adresse: patient.adresse || '',
            ville: patient.ville || '',
            mutuelle: patient.mutuelle || '',
            prescripteur_nom: patient.prescripteur_nom || '',
            technicien_id: patient.technicien_id || null,
            date_creation: patient.date_creation || new Date().toISOString(),
            date_modification: patient.date_modification || null
          }));
          
          console.log('Patients nettoyés:', cleanedPatients);
          setPatients(cleanedPatients);
          setFilteredPatients(cleanedPatients);
          console.log(`${cleanedPatients.length} patients chargés via debug`);
          return;
        }
      } catch (debugError) {
        console.log('Debug endpoint failed:', debugError);
      }

      // Essayer l'endpoint principal avec différentes approches
      console.log('Tentative avec /patients...');
      try {
        data = await makeRequest('/patients');
        console.log('Réponse complète de /patients:', JSON.stringify(data, null, 2));
        
        let patientList = [];
        
        if (data.success && data.data && data.data.items) {
          patientList = data.data.items;
        } else if (data.data && Array.isArray(data.data)) {
          patientList = data.data;
        } else if (Array.isArray(data)) {
          patientList = data;
        }
        
        if (patientList.length > 0) {
          // Nettoyer et valider les données des patients
          const cleanedPatients = patientList.map((patient: any) => {
            console.log('Patient brut:', patient);
            return {
              id: patient.id || 0,
              code_patient: patient.code_patient || `P${patient.id}`,
              nom: patient.nom || 'N/A',
              prenom: patient.prenom || 'N/A',
              cin: patient.cin || '',
              date_naissance: patient.date_naissance || '',
              telephone: patient.telephone || 'N/A',
              email: patient.email || '',
              adresse: patient.adresse || '',
              ville: patient.ville || '',
              mutuelle: patient.mutuelle || '',
              prescripteur_nom: patient.prescripteur_nom || '',
              technicien_id: patient.technicien_id || null,
              date_creation: patient.date_creation || new Date().toISOString(),
              date_modification: patient.date_modification || null
            };
          });
          
          console.log('Patients nettoyés via API:', cleanedPatients);
          setPatients(cleanedPatients);
          setFilteredPatients(cleanedPatients);
          console.log(`${cleanedPatients.length} patients chargés via API`);
          return;
        }
      } catch (apiError) {
        console.log('API endpoint failed:', apiError);
      }

      // Essayer sans authentification
      console.log('Tentative sans token...');
      try {
        const response = await fetch(`${API_BASE_URL}/debug/patients`);
        data = await response.json();
        console.log('Réponse sans auth:', data);
        
        if (data.patients && Array.isArray(data.patients)) {
          const cleanedPatients = data.patients.map((patient: any) => ({
            id: patient.id,
            code_patient: patient.code_patient || `P${patient.id}`,
            nom: patient.nom || 'N/A',
            prenom: patient.prenom || 'N/A',
            cin: patient.cin || '',
            date_naissance: patient.date_naissance || '',
            telephone: patient.telephone || 'N/A',
            email: patient.email || '',
            adresse: patient.adresse || '',
            ville: patient.ville || '',
            mutuelle: patient.mutuelle || '',
            prescripteur_nom: patient.prescripteur_nom || '',
            technicien_id: patient.technicien_id || null,
            date_creation: patient.date_creation || new Date().toISOString(),
            date_modification: patient.date_modification || null
          }));
          
          setPatients(cleanedPatients);
          setFilteredPatients(cleanedPatients);
          console.log(`${cleanedPatients.length} patients chargés sans auth`);
          return;
        }
      } catch (noAuthError) {
        console.log('No auth attempt failed:', noAuthError);
      }

      throw new Error('Aucun endpoint ne fonctionne');

    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des patients
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient => 
      patient.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.code_patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.telephone?.includes(searchTerm)
    );

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Chargement initial
  useEffect(() => {
    fetchPatients();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString || 'N/A';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-600 mt-1">
              {patients.length > 0 ? `${patients.length} patient(s) trouvé(s)` : 'Chargement...'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchPatients}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
              Nouveau Patient
            </button>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, prénom, CIN..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Messages d'état */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement des patients...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Erreur de chargement</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={fetchPatients}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Tableau des patients */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchTerm ? 'Aucun résultat' : 'Aucun patient'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `Aucun patient trouvé pour "${searchTerm}"`
                  : 'Aucun patient n\'a été trouvé dans la base de données'
                }
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
                      Email
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
                  {filteredPatients.map((patient, index) => {
                    // Debug: Log chaque patient pour voir les données
                    console.log(`Patient ${index}:`, patient);
                    
                    return (
                      <tr key={patient.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {patient.code_patient || `P${patient.id}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.prenom} {patient.nom}
                            </div>
                            {patient.email && (
                              <div className="text-sm text-gray-500">{patient.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.cin || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.telephone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.ville || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(patient.date_creation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Debug info - Plus détaillé */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <div className="space-y-1 text-gray-600">
            <div>Total patients: {patients.length}</div>
            <div>Filtered patients: {filteredPatients.length}</div>
            <div>Search term: "{searchTerm}"</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Error: {error || 'None'}</div>
            {patients.length > 0 && (
              <div className="mt-2">
                <div className="font-medium">Premier patient (exemple):</div>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(patients[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;