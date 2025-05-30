import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/rafraichir`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de rafraîchissement du token');
    }

    localStorage.setItem('access_token', data.access_token);
    return true;
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
  }
};

export const api = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    
    // Préparer les headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    // Ajouter le token d'authentification si nécessaire
    if (requiresAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Si le token est expiré, essayer de le rafraîchir
      if (response.status === 401 && requiresAuth) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          return this.request(endpoint, options);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'Une erreur est survenue');
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Erreur de connexion au serveur');
    }
  },

  // Méthodes utilitaires pour les requêtes courantes
  get<T>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put<T>(endpoint: string, data: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete<T>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
}; 