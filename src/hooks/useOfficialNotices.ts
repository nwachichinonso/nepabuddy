import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OfficialNotice {
  id: string;
  source: string;
  title: string;
  content: string;
  notice_type: 'maintenance' | 'grid_collapse' | 'restoration' | 'info';
  affected_zones: string[] | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  is_active: boolean;
  created_at: string;
}

export const useOfficialNotices = () => {
  const [notices, setNotices] = useState<OfficialNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('official_notices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      
      setNotices((data || []).map(item => ({
        ...item,
        notice_type: item.notice_type as OfficialNotice['notice_type']
      })));
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('notices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'official_notices'
        },
        () => {
          // Refetch on any change
          fetchNotices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotices]);

  return {
    notices,
    loading,
    error,
    refetch: fetchNotices
  };
};
