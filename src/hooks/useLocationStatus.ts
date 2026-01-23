import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationStatus {
  id: string;
  location_string: string;
  normalized_string: string;
  on_count: number;
  off_count: number;
  total_reports: number;
  confidence: number;
  last_updated: string;
}

export const useLocationStatus = () => {
  const [status, setStatus] = useState<LocationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentLocations, setRecentLocations] = useState<LocationStatus[]>([]);

  const searchLocationStatus = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setStatus(null);
      return null;
    }

    setLoading(true);
    try {
      // Normalize the search term for matching
      const normalized = searchTerm.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
      
      // Search for matching locations
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .or(`normalized_string.ilike.%${normalized}%,location_string.ilike.%${searchTerm}%`)
        .order('total_reports', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setStatus(data[0] as LocationStatus);
        return data[0] as LocationStatus;
      } else {
        setStatus(null);
        return null;
      }
    } catch (err) {
      console.error('Error searching location status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentLocations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentLocations((data as LocationStatus[]) || []);
    } catch (err) {
      console.error('Error fetching recent locations:', err);
    }
  }, []);

  const getStatusText = (status: LocationStatus | null): { text: string; emoji: string; color: string } => {
    if (!status) {
      return { text: 'No data available', emoji: '❓', color: 'text-muted-foreground' };
    }

    const total = status.on_count + status.off_count;
    if (total === 0) {
      return { text: 'No data available', emoji: '❓', color: 'text-muted-foreground' };
    }

    const onRatio = status.on_count / total;
    
    if (onRatio >= 0.7) {
      return { text: 'Power is ON', emoji: '⚡', color: 'text-green-600' };
    } else if (onRatio <= 0.3) {
      return { text: 'Power is OFF', emoji: '🔌', color: 'text-red-600' };
    } else {
      return { text: 'Recovering', emoji: '🔄', color: 'text-yellow-600' };
    }
  };

  const getConfidenceText = (status: LocationStatus | null): string => {
    if (!status || status.total_reports === 0) {
      return 'No reports yet';
    }

    // Check recent reports (last 10 minutes simulation)
    const lastUpdated = new Date(status.last_updated);
    const minutesAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);

    if (minutesAgo > 60) {
      return `Based on ${status.total_reports} reports (last update: ${minutesAgo > 1440 ? Math.floor(minutesAgo / 1440) + ' days' : Math.floor(minutesAgo / 60) + ' hours'} ago)`;
    }

    return `Based on ${status.total_reports} reports (updated ${minutesAgo} min ago)`;
  };

  return {
    status,
    loading,
    searchLocationStatus,
    recentLocations,
    fetchRecentLocations,
    getStatusText,
    getConfidenceText,
  };
};
