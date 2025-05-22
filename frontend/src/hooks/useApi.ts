// hooks/useApi.ts
import { useState, useCallback } from 'react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T = any>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const makeRequest = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = localStorage.getItem('token');
      
      const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      };

      if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
        config.body = JSON.stringify(options.body);
      }

      console.log(`Requête ${options.method || 'GET'} vers: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Réponse reçue:', data);
      
      setState({
        data,
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  }, []);

  const get = useCallback((endpoint: string, headers?: Record<string, string>) => {
    return makeRequest(endpoint, { method: 'GET', headers });
  }, [makeRequest]);

  const post = useCallback((endpoint: string, body?: any, headers?: Record<string, string>) => {
    return makeRequest(endpoint, { method: 'POST', body, headers });
  }, [makeRequest]);

  const put = useCallback((endpoint: string, body?: any, headers?: Record<string, string>) => {
    return makeRequest(endpoint, { method: 'PUT', body, headers });
  }, [makeRequest]);

  const del = useCallback((endpoint: string, headers?: Record<string, string>) => {
    return makeRequest(endpoint, { method: 'DELETE', headers });
  }, [makeRequest]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    reset,
  };
};

// Hook spécialisé pour les patients
export const usePatients = () => {
  const api = useApi();

  const fetchPatients = useCallback(async () => {
    try {
      // Essayer plusieurs endpoints
      try {
        return await api.get('/debug/patients');
      } catch (debugError) {
        console.log('Debug endpoint failed, trying main API...');
        return await api.get('/patients');
      }
    } catch (error) {
      console.error('All patient endpoints failed:', error);
      throw error;
    }
  }, [api]);

  const createPatient = useCallback(async (patientData: any) => {
    return await api.post('/patients', patientData);
  }, [api]);

  const updatePatient = useCallback(async (id: number, patientData: any) => {
    return await api.put(`/patients/${id}`, patientData);
  }, [api]);

  const deletePatient = useCallback(async (id: number) => {
    return await api.delete(`/patients/${id}`);
  }, [api]);

  return {
    ...api,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
};