import { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { AxiosError } from 'axios';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<T>(url);
      setData(response.data);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [url, options.immediate]);

  return { data, loading, error, refetch: fetchData };
}

export function useApiMutation<T, D = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    method: 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: D
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api[method]<T>(url, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Made with Bob
