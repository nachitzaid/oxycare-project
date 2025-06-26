'use client';

import { useAuth } from '../contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, Package, UserCheck, Calendar, TrendingUp, Activity, Clock, AlertCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard = ({ title, value, icon: Icon, color, change, changeType }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <Icon className="w-8 h-8" style={{ color }} />
    </div>
  </div>
);

interface InterventionStats {
  total: number;
  en_cours: number;
  terminees: number;
  en_retard: number;
  par_mois: Array<{ mois: string; nombre: number }>;
  par_statut: Record<string, number>;
}

interface TechnicianStats {
  interventions: InterventionStats;
}

interface Patient {
  date_creation?: string;
  ville?: string;
  dispositifs?: any[];
}

interface PatientStats {
  total: number;
  nouveaux_ce_mois: number;
  avec_dispositifs: number;
  par_mois: Array<{ mois: string; nombre: number }>;
  par_ville: Array<{ ville: string; nombre: number }>;
}

interface DispositifStats {
  total_dispositifs: number;
  dispositifs_sous_garantie: number;
  repartition_statuts: Record<string, number>;
  repartition_types_acquisition: Record<string, number>;
  top_designations: Array<{ designation: string; count: number }>;
  moyenne_dispositifs_par_patient: number;
  nb_patients_avec_dispositifs: number;
}

interface AdminStats {
  patients: PatientStats;
  dispositifs: DispositifStats;
}

// Composant AdminStatistics (copié du code original, légèrement modifié)
const AdminStatistics = () => {
  const [stats, setStats] = useState<AdminStats>({
    patients: {
      total: 0,
      nouveaux_ce_mois: 0,
      avec_dispositifs: 0,
      par_mois: [],
      par_ville: []
    },
    dispositifs: {
      total_dispositifs: 0,
      dispositifs_sous_garantie: 0,
      repartition_statuts: {},
      repartition_types_acquisition: {},
      top_designations: [],
      moyenne_dispositifs_par_patient: 0,
      nb_patients_avec_dispositifs: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Couleurs pour les graphiques
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques des patients
      const patientsResponse = await fetch('http://localhost:5000/api/debug/patients');
      const patientsData = await patientsResponse.json();
      
      // Récupérer les statistiques des dispositifs
      const dispositivesResponse = await fetch('http://localhost:5000/api/dispositifs/statistiques');
      const dispositivesData = await dispositivesResponse.json();
      
      if (patientsData.success && dispositivesData.success) {
        // Traitement des données patients
        const patients: Patient[] = patientsData.patients || [];
        const patientsParMois = processPatientsByMonth(patients);
        const patientsParVille = processPatientsByCity(patients);
        const nouveauxCeMois = countNewPatientsThisMonth(patients);
        const avecDispositifs = patients.filter((p) => Array.isArray(p.dispositifs) && p.dispositifs.length > 0).length;
        
        setStats({
          patients: {
            total: patients.length,
            nouveaux_ce_mois: nouveauxCeMois,
            avec_dispositifs: avecDispositifs,
            par_mois: patientsParMois,
            par_ville: patientsParVille
          },
          dispositifs: dispositivesData.data
        });
      }
      
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const processPatientsByMonth = (patients: Patient[]) => {
    const monthCounts: Record<string, number> = {};
    const now = new Date();
    
    // Initialiser les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      monthCounts[key] = 0;
    }
    
    patients.forEach(patient => {
      if (patient.date_creation) {
        const date = new Date(patient.date_creation);
        const key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (monthCounts.hasOwnProperty(key)) {
          monthCounts[key]++;
        }
      }
    });
    
    return Object.entries(monthCounts).map(([mois, nombre]) => ({ mois, nombre }));
  };

  const processPatientsByCity = (patients: Patient[]) => {
    const cityCounts: Record<string, number> = {};
    
    patients.forEach(patient => {
      const ville = patient.ville || 'Non spécifiée';
      cityCounts[ville] = (cityCounts[ville] || 0) + 1;
    });
    
    return Object.entries(cityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([ville, nombre]) => ({ ville, nombre }));
  };

  const countNewPatientsThisMonth = (patients: Patient[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return patients.filter(patient => {
      if (!patient.date_creation) return false;
      const creationDate = new Date(patient.date_creation);
      return creationDate >= startOfMonth;
    }).length;
  };

  // Préparer les données pour les graphiques
  const statutsData = Object.entries(stats.dispositifs.repartition_statuts || {})
    .map(([statut, count]) => ({ name: statut, value: count }));

  const typesAcquisitionData = Object.entries(stats.dispositifs.repartition_types_acquisition || {})
    .map(([type, count]) => ({ name: type, value: count }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchStatistics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.patients.total}
          icon={Users}
          color="#3B82F6"
          change={`+${stats.patients.nouveaux_ce_mois} ce mois`}
          changeType="increase"
        />
        <StatCard
          title="Total Dispositifs"
          value={stats.dispositifs.total_dispositifs}
          icon={Package}
          color="#10B981"
        />
        <StatCard
          title="Sous Garantie"
          value={stats.dispositifs.dispositifs_sous_garantie}
          icon={UserCheck}
          color="#F59E0B"
        />
        <StatCard
          title="Moyenne/Patient"
          value={stats.dispositifs.moyenne_dispositifs_par_patient}
          icon={Activity}
          color="#8B5CF6"
        />
      </div>

      {/* Graphiques en ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des patients par mois */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Patients (6 derniers mois)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.patients.par_mois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="nombre" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par statut des dispositifs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statuts des Dispositifs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statutsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statutsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients par ville */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patients par Ville</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.patients.par_ville} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="ville" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="nombre" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Types d'acquisition */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Types d'Acquisition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typesAcquisitionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typesAcquisitionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top des désignations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 des Dispositifs les Plus Utilisés</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.dispositifs.top_designations}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="designation" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">Patients avec Dispositifs</h4>
          <p className="text-2xl font-bold text-blue-600">{stats.patients.avec_dispositifs}</p>
          <p className="text-sm text-gray-600">
            {((stats.patients.avec_dispositifs / stats.patients.total) * 100).toFixed(1)}% du total
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">Patients Équipés</h4>
          <p className="text-2xl font-bold text-green-600">{stats.dispositifs.nb_patients_avec_dispositifs}</p>
          <p className="text-sm text-gray-600">Patients ayant au moins un dispositif</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">Nouveaux ce Mois</h4>
          <p className="text-2xl font-bold text-purple-600">{stats.patients.nouveaux_ce_mois}</p>
          <p className="text-sm text-gray-600">Patients enregistrés ce mois</p>
        </div>
      </div>

      {/* Bouton de rafraîchissement */}
      <div className="text-center">
        <button
          onClick={fetchStatistics}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center mx-auto"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Actualiser les Statistiques
        </button>
      </div>
    </div>
  );
};

// Composant TechnicianStatistics
const TechnicianStatistics = () => {
  const [stats, setStats] = useState<TechnicianStats>({
    interventions: {
      total: 0,
      en_cours: 0,
      terminees: 0,
      en_retard: 0,
      par_mois: [],
      par_statut: {}
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Couleurs pour les graphiques
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques des interventions
      const response = await fetch('http://localhost:5000/api/interventions/statistiques/technicien');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
      
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchStatistics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const statutsData = Object.entries(stats.interventions.par_statut || {})
    .map(([statut, count]) => ({ name: statut, value: count }));

  return (
    <div className="space-y-8">
      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Interventions"
          value={stats.interventions.total}
          icon={Activity}
          color="#3B82F6"
        />
        <StatCard
          title="En Cours"
          value={stats.interventions.en_cours}
          icon={Clock}
          color="#10B981"
        />
        <StatCard
          title="Terminées"
          value={stats.interventions.terminees}
          icon={UserCheck}
          color="#F59E0B"
        />
        <StatCard
          title="En Retard"
          value={stats.interventions.en_retard}
          icon={AlertCircle}
          color="#EF4444"
        />
      </div>

      {/* Graphiques en ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des interventions par mois */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Interventions (6 derniers mois)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.interventions.par_mois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="nombre" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par statut des interventions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statuts des Interventions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statutsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statutsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bouton de rafraîchissement */}
      <div className="text-center">
        <button
          onClick={fetchStatistics}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center mx-auto"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Actualiser les Statistiques
        </button>
      </div>
    </div>
  );
};

// Composant Dashboard principal intégré
export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('welcome');

  const tabs = [
    { id: 'welcome', label: 'Accueil', icon: Users },
    { id: 'statistics', label: 'Statistiques', icon: TrendingUp }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Tableau de bord</h1>
              
              {/* Navigation par onglets */}
              <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Contenu basé sur l'onglet actif */}
            {activeTab === 'welcome' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Bienvenue, {user?.prenom || 'Utilisateur'} !</h2>
                <p className="text-gray-600 mb-4">
                  Vous êtes connecté en tant que <span className="font-medium capitalize">{user?.role || 'utilisateur'}</span>.
                </p>
                <div className="mt-6">
                  <p className="text-gray-600 mb-2">Accès rapide :</p>
                  <button
                    onClick={() => setActiveTab('statistics')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Voir les Statistiques
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'statistics' && (
              user?.role === 'technicien' ? <TechnicianStatistics /> : <AdminStatistics />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}