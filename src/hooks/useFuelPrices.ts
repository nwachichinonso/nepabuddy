import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FuelPrice {
  id: string;
  fuel_type: 'petrol' | 'diesel';
  min_price: number;
  max_price: number;
  avg_price: number | null;
  updated_at: string;
}

const tips = [
  "Diesel don cost! Make we save light small small when e dey 😅",
  "Morning time na best time to run gen — fuel go last longer!",
  "LED bulbs save am well well — consider changing if you never!",
  "Inverter + solar combo dey work for plenty people now 🌞",
  "Turn off AC when you comot house — e go save fuel well well!",
  "Gen no need run 24/7 — use fan when weather cool small 🌬️",
];

export const useFuelPrices = () => {
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('fuel_prices')
        .select('*')
        .order('fuel_type');

      if (fetchError) throw fetchError;
      
      setPrices((data || []).map(item => ({
        ...item,
        fuel_type: item.fuel_type as 'petrol' | 'diesel'
      })));
    } catch (err) {
      console.error('Error fetching fuel prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fuel prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const petrolPrice = prices.find(p => p.fuel_type === 'petrol');
  const dieselPrice = prices.find(p => p.fuel_type === 'diesel');

  return {
    prices,
    petrolPrice,
    dieselPrice,
    tip,
    loading,
    error,
    refetch: fetchPrices
  };
};
