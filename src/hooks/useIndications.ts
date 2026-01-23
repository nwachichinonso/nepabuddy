import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Indication {
  id: string;
  user_id: string;
  location_id: string | null;
  location_string: string;
  status: boolean;
  created_at: string;
}

const DAILY_LIMIT = 5;

export const useIndications = () => {
  const [submitting, setSubmitting] = useState(false);
  const [todayIndications, setTodayIndications] = useState<Indication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayIndications = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('indications')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodayIndications((data as Indication[]) || []);
      return (data as Indication[]) || [];
    } catch (err) {
      console.error('Error fetching indications:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const submitIndication = useCallback(async (
    userId: string,
    locationString: string,
    status: boolean
  ) => {
    if (!locationString.trim()) {
      toast({
        title: "Location needed",
        description: "Abeg enter your location first!",
        variant: "destructive"
      });
      return false;
    }

    setSubmitting(true);
    try {
      // Check today's count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from('indications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      if (countError) throw countError;

      if ((count || 0) >= DAILY_LIMIT) {
        toast({
          title: "Daily limit reached! 🎉",
          description: "You don submit your 5 indications today. Well done!",
        });
        return false;
      }

      // Submit indication
      const { error } = await supabase
        .from('indications')
        .insert({
          user_id: userId,
          location_string: locationString.trim(),
          status,
        });

      if (error) throw error;

      // Update profile's daily count
      await supabase
        .from('profiles')
        .update({
          daily_indication_count: (count || 0) + 1,
          last_indication_date: new Date().toISOString().split('T')[0],
        })
        .eq('user_id', userId);

      toast({
        title: status ? "⚡ Light dey!" : "🔌 No light!",
        description: `Indication ${(count || 0) + 1}/${DAILY_LIMIT} submitted. ${DAILY_LIMIT - (count || 0) - 1} more to go!`,
      });

      await fetchTodayIndications(userId);
      return true;
    } catch (err) {
      console.error('Error submitting indication:', err);
      toast({
        title: "Error!",
        description: "E no work o! Try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchTodayIndications]);

  const canSubmitComplaint = (indicationCount: number) => {
    return indicationCount >= DAILY_LIMIT;
  };

  const getRemainingIndications = (indicationCount: number) => {
    return Math.max(0, DAILY_LIMIT - indicationCount);
  };

  return {
    submitIndication,
    submitting,
    fetchTodayIndications,
    todayIndications,
    loading,
    canSubmitComplaint,
    getRemainingIndications,
    DAILY_LIMIT,
  };
};
