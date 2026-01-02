import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OutageEvent {
  id: string;
  zone_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  buddy_count: number;
  funny_caption: string | null;
  created_at: string;
  zones?: {
    id: string;
    name: string;
    display_name: string;
  };
}

const funnyOutageCaptions = [
  "That Monday morning wahala 😩",
  "NEPA no send anybody message 💀",
  "Gen don save the day again 💨",
  "We take style survive am 💪",
  "Diesel price no gree us rest 😭",
  "The usual Lagos vibes 🏙️",
  "Inverter gang came through 🔋",
  "Candlelight dinner no be by force 🕯️",
];

export const useOutageHistory = (zoneId?: string, limit = 20) => {
  const [history, setHistory] = useState<OutageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('outage_history')
        .select(`
          *,
          zones (
            id,
            name,
            display_name
          )
        `)
        .order('started_at', { ascending: false })
        .limit(limit);
      
      if (zoneId) {
        query = query.eq('zone_id', zoneId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Add funny captions to events without one
      const historyWithCaptions = (data || []).map(event => ({
        ...event,
        funny_caption: event.funny_caption || 
          funnyOutageCaptions[Math.floor(Math.random() * funnyOutageCaptions.length)]
      }));
      
      setHistory(historyWithCaptions);
    } catch (err) {
      console.error('Error fetching outage history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [zoneId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return 'Ongoing...';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min${mins !== 1 ? 's' : ''}`;
    if (mins === 0) return `${hours} hr${hours !== 1 ? 's' : ''}`;
    return `${hours} hr${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
  };

  return {
    history,
    loading,
    error,
    formatDuration,
    refetch: fetchHistory
  };
};
