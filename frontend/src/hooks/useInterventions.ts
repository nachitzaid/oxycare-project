// hooks/useInterventions.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

interface Intervention {
  id: number;
  patient_id: number;
  dispositif_id: number;
  technicien_id: number;
  type_intervention: string;
  planifiee: boolean;
  date_planifiee: string | null;
  date_reelle: string | null;
  temps_prevu: number | null;
  temps_reel: number | null;
  actions_effectuees: any;
  satisfaction_technicien: number | null;
  signature_patient: boolean;
  signature_responsable: boolean;
  commentaire: string | null;
  date_creation: string | null;
  patient?: any;
  dispositif?: any;
  technicien?: any;
}

interface InterventionFormData {
  patient_id: number;
  dispositif_id: number;
  date_intervention: string;
  type_intervention: string;
  technicien_id?: number;
  statut?: string;
  description?: string;
  notes?: string;
}

export const useInterventions = () => {
  const { user, isAdmin, isTechnician, isAuthenticated } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("Aucun token de rafraîchissement disponible");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/rafraichir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Échec du rafraîchissement du token");
      }

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        return data.access_token;
      }
      throw new Error("Token non reçu");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      throw error;
    }
  };

  const makeRequest = async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Non authentifié");
    }

    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> || {}),
    });

    const config: RequestInit = {
      method: options.method || "GET",
      headers,
      credentials: "include",
    };

    if (options.body) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    try {
      console.log("Envoi de la requête:", {
        url: `${API_BASE_URL}${url}`,
        method: config.method,
        headers: Object.fromEntries(headers.entries()),
        body: options.body,
      });

      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      if (response.status === 401) {
        console.log("Token expiré, tentative de rafraîchissement...");
        token = await refreshAccessToken();
        headers.set("Authorization", `Bearer ${token}`);
        
        console.log("Nouvelle tentative avec le token rafraîchi...");
        const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
          ...config,
          headers,
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          console.error("Échec après rafraîchissement:", errorData);
          throw new Error(errorData.message || "Échec de la requête après rafraîchissement du token");
        }

        return await retryResponse.json();
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur de réponse:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Réponse reçue:", data);
      return data;
    } catch (error) {
      console.error(`Erreur requête ${url}:`, error);
      throw error;
    }
  };

  const showMessage = useCallback((message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const fetchInterventions = useCallback(async (search = "") => {
    if (!isAuthenticated()) {
      setError("Vous devez être connecté pour voir les interventions");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (isTechnician() && user?.id) {
        params.append("technicien_id", user.id.toString());
      }
      if (search) params.append("recherche", search);

      const data = await makeRequest(`/interventions?${params.toString()}`);
      
      if (data.success && Array.isArray(data.data.items)) {
        setInterventions(data.data.items);
        showMessage(`${data.data.items.length} interventions trouvées`, "success");
      } else {
        throw new Error(data.message || "Erreur lors du chargement des interventions");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      showMessage(errorMessage, "error");
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isTechnician, user?.id, loading, showMessage]);

  const createIntervention = useCallback(async (interventionData: InterventionFormData) => {
    if (!isAuthenticated()) {
      setError("Vous devez être connecté pour créer une intervention");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Données reçues pour création:", interventionData);

      const formattedData = {
        patient_id: interventionData.patient_id,
        dispositif_id: interventionData.dispositif_id,
        technicien_id: interventionData.technicien_id || user?.id,
        type_intervention: interventionData.type_intervention,
        date_intervention: interventionData.date_intervention,
        description: interventionData.description || interventionData.notes || "",
        statut: "planifiée"
      };

      console.log("Données formatées pour l'API:", formattedData);

      const data = await makeRequest("/interventions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData)
      });

      console.log("Réponse de création:", data);

      if (data.success) {
        showMessage("Intervention créée avec succès", "success");
        await fetchInterventions();
        return data.data;
      } else {
        throw new Error(data.message || "Erreur lors de la création de l'intervention");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création";
      console.error("Erreur détaillée:", err);
      showMessage(errorMessage, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, fetchInterventions, showMessage]);

  useEffect(() => {
    let mounted = true;
    if (isInitialLoad && isAuthenticated() && mounted) {
      fetchInterventions().then(() => {
        if (mounted) {
          setIsInitialLoad(false);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [isInitialLoad, isAuthenticated, fetchInterventions]);

  return {
    interventions,
    loading,
    error,
    success,
    fetchInterventions,
    createIntervention,
    makeRequest,
    showMessage
  };
};