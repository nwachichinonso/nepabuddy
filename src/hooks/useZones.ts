import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Zone {
  id: string;
  name: string;
  display_name: string;
  geohash_prefix: string;
  latitude: number;
  longitude: number;
}

export const useZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('zones')
        .select('*')
        .order('display_name');

      if (fetchError) throw fetchError;
      setZones(data || []);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const findNearestZone = useCallback((lat: number, lng: number): Zone | null => {
    if (zones.length === 0) return null;

    let nearest: Zone | null = null;
    let minDistance = Infinity;

    zones.forEach(zone => {
      const distance = Math.sqrt(
        Math.pow(zone.latitude - lat, 2) + Math.pow(zone.longitude - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = zone;
      }
    });

    return nearest;
  }, [zones]);

  return {
    zones,
    loading,
    error,
    findNearestZone,
    refetch: fetchZones
  };
};
