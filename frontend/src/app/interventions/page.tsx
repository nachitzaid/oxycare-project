"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"
import InterventionManagement from "@/components/interventions/InterventionManagement"
import { useRouter } from "next/navigation"
import Spinner from "@/components/common/Spinner"

export default function InterventionsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    if (!loading && !isAuthenticated() && isClient) {
      router.push("/login?redirect=/interventions")
    }
  }, [isAuthenticated, loading, router, isClient])

  // Afficher un spinner pendant le chargement ou si on n'est pas côté client
  if (loading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher (la redirection se fera via useEffect)
  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <InterventionManagement />
        </main>
      </div>
    </div>
  )
}
