import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/connexion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nom_utilisateur: username, mot_de_passe: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      setTokens(data.access_token, data.refresh_token);
      setState({
        user: data.utilisateur,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
      }));
      return false;
    }
  }, [setTokens]);

  const logout = useCallback(() => {
    clearTokens();
    setState({
      user: null,
      loading: false,
      error: null,
    });
    router.push('/login');
  }, [clearTokens, router]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
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
      clearTokens();
      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Session expirée',
      });
      return false;
    }
  }, [clearTokens]);

  const checkAuth = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profil`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setState({
          user,
          loading: false,
          error: null,
        });
      } else if (response.status === 401) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          setState({
            user: null,
            loading: false,
            error: 'Session expirée',
          });
        }
      } else {
        throw new Error('Erreur de vérification du profil');
      }
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de vérification',
      });
    }
  }, [refreshToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = useCallback(() => {
    return !!state.user;
  }, [state.user]);

  const isAdmin = useCallback(() => {
    return state.user?.role === 'admin';
  }, [state.user]);

  const isTechnician = useCallback(() => {
    return state.user?.role === 'technicien';
  }, [state.user]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isTechnician,
  };
}; 