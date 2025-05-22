"use client"

import { useAuth } from "@/contexts/AuthContext"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"
import DeviceManagement from "@/components/devices/DeviceManagement"

export default function DevicesPage() {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <DeviceManagement />
        </main>
      </div>
    </div>
  )
}
