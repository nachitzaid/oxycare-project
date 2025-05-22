"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '../contexts/AuthContext';
import { toast } from "react-toastify"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, AlertCircle } from "lucide-react"
import axios from "@/lib/axios"

export default function Login() {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const { login, error } = useAuth()
  const router = useRouter()

  // Fonction pour tester la connexion au serveur
  const testServerConnection = async () => {
    try {
      const response = await axios.get('/health')
      setDebugInfo(`✅ Serveur accessible: ${response.data.message}`)
      toast.success("Serveur accessible")
    } catch (error: any) {
      console.error("Test de connexion échoué:", error)
      let errorMsg = "❌ Impossible de joindre le serveur"
      
      if (error.code === 'ECONNREFUSED') {
        errorMsg += " (Connexion refusée - serveur probablement arrêté)"
      } else if (error.response) {
        errorMsg += ` (Status: ${error.response.status})`
      } else if (error.request) {
        errorMsg += " (Pas de réponse)"
      }
      
      setDebugInfo(errorMsg)
      toast.error("Serveur inaccessible")
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo("🔄 Tentative de connexion...")

    try {
      console.log("Tentative de connexion avec:", { username, password: "***" })
      
      const success = await login(username, password)
      if (success) {
        setDebugInfo("✅ Connexion réussie")
        toast.success("Connexion réussie")
        router.push("/dashboard")
      } else {
        const errorMsg = error || "Identifiants incorrects"
        setDebugInfo(`❌ Échec: ${errorMsg}`)
        toast.error(errorMsg)
      }
    } catch (err: any) {
      console.error("Erreur lors de la connexion:", err)
      const errorMsg = "Une erreur est survenue lors de la connexion"
      setDebugInfo(`❌ Erreur: ${errorMsg}`)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4 sm:p-6 lg:p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">OxyCare</h1>
        </div>

        {/* Panel de debug */}
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Debug Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Button 
                onClick={testServerConnection} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Tester la connexion serveur
              </Button>
              {debugInfo && (
                <p className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                  {debugInfo}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                URL Backend: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Mot de passe oublié?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} OxyCare. Tous droits réservés.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}