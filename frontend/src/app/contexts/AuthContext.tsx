"use client"

import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import type { User, LoginResponse } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  isTechnician: () => boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
          setLoading(false)
          return
        }

          try {
          const response = await axios.get("/api/auth/profil")
          const userData = response.data
            
            // Vérification supplémentaire des données utilisateur
            if (!userData.id || !userData.nom_utilisateur || !userData.role) {
              throw new Error("Données utilisateur incomplètes")
            }

            setUser(userData)
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
          } catch (error) {
          console.error("Erreur lors du chargement du profil:", error)
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error)
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== "undefined") {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [])

  const clearError = () => {
    setError(null)
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Validation des entrées
      if (!username.trim() || !password.trim()) {
        throw new Error("Nom d'utilisateur et mot de passe requis")
      }

      const response = await axios.post<LoginResponse>("/api/auth/connexion", {
        nom_utilisateur: username,
        mot_de_passe: password,
      })

      console.log("Réponse de connexion:", response.data);

      const { utilisateur, access_token, refresh_token } = response.data

      if (!utilisateur || !access_token || !refresh_token) {
        throw new Error("Données d'authentification invalides")
      }

      // Vérification supplémentaire des données reçues
      if (!utilisateur.id || !utilisateur.nom_utilisateur || !utilisateur.role) {
        throw new Error("Données utilisateur incomplètes")
      }

      console.log("Données utilisateur validées:", utilisateur);

      // Stockage sécurisé
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      localStorage.setItem("user", JSON.stringify(utilisateur))

      setUser(utilisateur)
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

      return true
    } catch (err: any) {
      console.error("Erreur de connexion:", err)
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Échec de la connexion. Veuillez vérifier vos identifiants."
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
      setUser(null)
      delete axios.defaults.headers.common["Authorization"]
      router.push("/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const isAuthenticated = (): boolean => {
    if (!user || !localStorage.getItem("access_token")) return false
    
    // Vérification supplémentaire des données utilisateur
    return !!user.id && !!user.nom_utilisateur && !!user.role
  }

  const isAdmin = (): boolean => {
    return isAuthenticated() && user?.role === "admin"
  }

  const isTechnician = (): boolean => {
    console.log("Vérification du rôle technicien:", {
      user,
      role: user?.role,
      isAuthenticated: isAuthenticated(),
      loading
    });
    return isAuthenticated() && user?.role === "technicien"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isTechnician,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext