import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PowerStatus } from '@/components/home/StatusCard';

export interface Zone {
  id: string;
  name: string;
  display_name: string;
  latitude: number;
  longitude: number;
}

export interface ZonePowerStatus {
  id: string;
  zone_id: string;
  status: PowerStatus;
  confidence: 'low' | 'medium' | 'high';
  buddy_count: number;
  plugged_count: number;
  unplugged_count: number;
  last_change_at: string;
  updated_at: string;
  zones?: Zone;
}

export const usePowerStatus = (zoneId?: string) => {
  const [powerStatus, setPowerStatus] = useState<ZonePowerStatus | null>(null);
  const [allZonesStatus, setAllZonesStatus] = useState<ZonePowerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPowerStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all zones with their power status
      const { data, error: fetchError } = await supabase
        .from('zone_power_status')
        .select(`
          *,
          zones (
            id,
            name,
            display_name,
            latitude,
            longitude
          )
        `);

      if (fetchError) throw fetchError;

      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as PowerStatus,
        confidence: item.confidence as 'low' | 'medium' | 'high'
      }));

      setAllZonesStatus(typedData);
      
      if (zoneId) {
        const currentZone = typedData.find(z => z.zone_id === zoneId);
        setPowerStatus(currentZone || null);
      } else if (typedData.length > 0) {
        // Default to first zone if no zone specified
        setPowerStatus(typedData[0]);
      }
    } catch (err) {
      console.error('Error fetching power status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch power status');
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  // Initial fetch
  useEffect(() => {
    fetchPowerStatus();
  }, [fetchPowerStatus]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('power-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'zone_power_status'
        },
        (payload) => {
          console.log('Power status change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as ZonePowerStatus;
            
            // Update all zones status
            setAllZonesStatus(prev => 
              prev.map(z => z.id === newData.id ? { ...z, ...newData } : z)
            );
            
            // Update current zone if it matches
            if (zoneId && newData.zone_id === zoneId) {
              setPowerStatus(prev => prev ? { ...prev, ...newData } : null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [zoneId]);

  return {
    powerStatus,
    allZonesStatus,
    loading,
    error,
    refetch: fetchPowerStatus
  };
};
