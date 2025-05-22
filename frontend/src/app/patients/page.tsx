"use client"

import { useAuth } from '../contexts/AuthContext';
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"
import PatientManagement from "@/components/patients/PatientManagement"

export default function PatientsPage() {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <PatientManagement />
        </main>
      </div>
    </div>
  )
}
