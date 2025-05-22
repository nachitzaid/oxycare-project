'use client';

import { useAuth } from '../contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Bienvenue, {user?.prenom || 'Utilisateur'} !</h2>
              <p className="text-gray-600">
                Vous êtes connecté en tant que <span className="font-medium capitalize">{user?.role || 'utilisateur'}</span>.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}