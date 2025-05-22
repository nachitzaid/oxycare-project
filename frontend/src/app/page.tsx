"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./contexts/AuthContext"
import Spinner from "@/components/common/Spinner"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      // Si l'utilisateur est authentifié, rediriger vers le tableau de bord
      if (isAuthenticated()) {
        router.push("/dashboard")
      } else {
        // Sinon, rediriger vers la page de connexion
        router.push("/login")
      }
    }
  }, [isAuthenticated, loading, router])

  // Afficher un spinner pendant le chargement
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Chargement de l'application...</p>
      </div>
    </div>
  )
}
