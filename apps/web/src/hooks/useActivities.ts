import { useState, useCallback } from 'react';
import { api } from '../utils/api.js';
import type { ActivityLog, PaginatedMeta } from '../types/index.js';

export function useActivities() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(
    async (params?: { range?: string; category?: string; page?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/activities', { params });
        setActivities(data.data as ActivityLog[]);
        setMeta(data.meta as PaginatedMeta);
      } catch (err: unknown) {
        setError('Failed to load activities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logActivity = useCallback(
    async (payload: {
      category: string;
      subtype: string;
      amount: number;
      unit: string;
      note?: string;
    }): Promise<ActivityLog | null> => {
      try {
        const { data } = await api.post('/activities', payload);
        const activity = data.data as ActivityLog;
        setActivities((prev) => [activity, ...prev]);
        return activity;
      } catch (err: unknown) {
        setError('Failed to log activity');
        console.error(err);
        return null;
      }
    },
    []
  );

  const deleteActivity = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err: unknown) {
      setError('Failed to delete activity');
      console.error(err);
      return false;
    }
  }, []);

  return { activities, meta, loading, error, fetchActivities, logActivity, deleteActivity };
}
