import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoginResponse } from '@/types';
import axiosInstance from '@/lib/axios';
import axios from 'axios';

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
      const response = await axiosInstance.post('/auth/connexion', {
        nom_utilisateur: username,
        mot_de_passe: password
      });

      console.log("Données de connexion reçues:", response.data);

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      setState({
        user: response.data.utilisateur,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
      }));
      return false;
    }
  }, []);

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

      const response = await axiosInstance.post('/auth/rafraichir', null, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      localStorage.setItem('access_token', response.data.access_token);
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
      const response = await axiosInstance.get('/auth/profil');

        setState({
        user: response.data,
          loading: false,
          error: null,
        });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          setState({
            user: null,
            loading: false,
            error: 'Session expirée',
          });
        }
      } else {
      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de vérification',
      });
      }
    }
  }, [refreshToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = useCallback(() => {
    return !!state.user && !state.loading;
  }, [state.user, state.loading]);

  const isAdmin = useCallback(() => {
    return state.user?.role === 'admin' && !state.loading;
  }, [state.user, state.loading]);

  const isTechnician = useCallback(() => {
    console.log("Vérification du rôle technicien:", {
      user: state.user,
      role: state.user?.role,
      loading: state.loading
    });
    return state.user?.role === 'technicien' && !state.loading;
  }, [state.user, state.loading]);

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