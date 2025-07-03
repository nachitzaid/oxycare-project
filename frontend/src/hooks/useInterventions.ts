// hooks/useInterventions.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Intervention } from '@/types/intervention';

interface InterventionFormData {
  patient_id: number;
  dispositif_id: number;
  date_intervention: string;
  type_intervention: string;
  technicien_id?: number;
  statut?: string;
  description?: string;
  notes?: string;
  reglage?: {
    pmax?: number;
    pmin?: number;
    pramp?: number;
    hu?: number;
    re?: number;
    commentaire?: string;
  };
}

interface PaginationData {
  page_courante: string;
  elements_par_page: string;
  total: number;
  pages_totales: number;
  items: Intervention[];
}

interface ApiResponse {
  success: boolean;
  data?: PaginationData;
  message?: string;
}

export const useInterventions = () => {
  const { user, isAdmin, isTechnician, isAuthenticated } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: string;
    perPage: string;
    total: number;
    totalPages: number;
  }>({
    page: "1",
    perPage: "10",
    total: 0,
    totalPages: 0
  });
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
        credentials: "include",
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
      Accept: "application/json",
      ...(options.headers as Record<string, string> || {}),
    });

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include",
      mode: "cors",
    };

    if (options.body) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      console.log("Envoi de la requête:", {
        url: fullUrl,
        method: config.method,
        headers: Object.fromEntries(headers.entries()),
        body: options.body,
      });

      const response = await fetch(fullUrl, config);
      
      if (response.status === 401) {
        console.log("Token expiré, tentative de rafraîchissement...");
        token = await refreshAccessToken();
        headers.set("Authorization", `Bearer ${token}`);
        
        console.log("Nouvelle tentative avec le token rafraîchi...");
        const retryResponse = await fetch(fullUrl, {
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
      console.error("Erreur lors de la requête:", error);
      throw error;
    }
  };

  const makeRequestRef = useRef(makeRequest);

  const showMessage = useCallback((message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const fetchInterventions = useCallback(async (page = 1, perPage = 10, filters: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filters
      });

      if (isTechnician()) {
        params.append('technicien_id', user?.id?.toString() || '');
      }

      const response = await makeRequestRef.current(`/api/interventions?${params.toString()}`);
      if (response.success && response.data) {
        setInterventions(response.data.items);
        setPagination({
          page: response.data.page_courante,
          perPage: response.data.elements_par_page,
          total: response.data.total,
          totalPages: response.data.pages_totales
        });
      } else {
        throw new Error(response.message || "Erreur lors de la récupération des interventions");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des interventions:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  const changePage = useCallback((newPage: number) => {
    fetchInterventions(newPage, Number(pagination.perPage));
  }, [fetchInterventions, pagination.perPage]);

  const changePerPage = useCallback((newPerPage: number) => {
    fetchInterventions(Number(pagination.page), newPerPage);
  }, [fetchInterventions, pagination.page]);

  const createIntervention = async (data: InterventionFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await makeRequest("/api/interventions", {
        method: "POST",
        body: JSON.stringify(data)
      });
      if (response.success) {
        showMessage("Intervention créée avec succès", "success");
        return response.data;
      } else {
        throw new Error(response.message || "Erreur lors de la création de l'intervention");
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'intervention:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateIntervention = async (data: Intervention) => {
    setLoading(true);
    setError(null);
    try {
      // Vérification stricte des permissions pour les techniciens
      if (isTechnician()) {
        // Récupérer l'intervention originale pour vérifier le technicien_id
        const originalIntervention = interventions.find(i => i.id === data.id);
        if (!originalIntervention) {
          throw new Error("Intervention non trouvée");
        }
        
        // Vérifier que l'intervention est bien assignée au technicien connecté
        if (String(originalIntervention.technicien_id) !== String(user?.id)) {
          console.error("Tentative de modification non autorisée:", {
            interventionId: data.id,
            interventionTechnicienId: originalIntervention.technicien_id,
            userId: user?.id
          });
          throw new Error("Vous n'êtes pas autorisé à modifier cette intervention car elle est assignée à un autre technicien");
        }
      }

      const response = await makeRequest(`/api/interventions/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });

      if (response.success) {
        showMessage("Intervention mise à jour avec succès", "success");
        // Rafraîchir la liste des interventions
        await fetchInterventions(Number(pagination.page), Number(pagination.perPage));
        return response;
      } else {
        throw new Error(response.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteIntervention = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await makeRequest(`/api/interventions/${id}`, {
        method: "DELETE"
      });
      if (response.success) {
        showMessage("Intervention supprimée avec succès", "success");
        return response;
      } else {
        throw new Error(response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
    fetchInterventions();
    }
  }, [isAuthenticated, fetchInterventions]);

  // IMPORTANT :
  // Si vous utilisez les fonctions de ce hook dans un formulaire (ex: onSubmit),
  // pensez à toujours appeler e.preventDefault() dans votre handler pour éviter
  // le rechargement de la page lors des requêtes API ou du refresh token.

  return {
    interventions,
    loading,
    error,
    success,
    pagination,
    fetchInterventions,
    changePage,
    changePerPage,
    createIntervention,
    updateIntervention,
    deleteIntervention,
    showMessage,
    makeRequest
  };
}