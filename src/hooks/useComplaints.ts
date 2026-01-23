import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  user_id: string;
  location_id: string | null;
  location_string: string;
  complaint_text: string;
  status: string;
  created_at: string;
}

export const useComplaints = () => {
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  const submitComplaint = useCallback(async (
    userId: string,
    locationString: string,
    complaintText: string
  ) => {
    if (!locationString.trim()) {
      toast({
        title: "Location needed",
        description: "Abeg enter your location!",
        variant: "destructive"
      });
      return false;
    }

    if (!complaintText.trim()) {
      toast({
        title: "Complaint needed",
        description: "Wetin be the problem? Tell us!",
        variant: "destructive"
      });
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: userId,
          location_string: locationString.trim(),
          complaint_text: complaintText.trim(),
        });

      if (error) throw error;

      toast({
        title: "Complaint submitted! 📝",
        description: "We don receive your complaint. Thanks for reporting!",
      });

      return true;
    } catch (err) {
      console.error('Error submitting complaint:', err);
      toast({
        title: "Error!",
        description: "E no work o! Try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const fetchMyComplaints = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setComplaints((data as Complaint[]) || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocationComplaintCount = useCallback(async (locationString: string) => {
    try {
      // Get count of complaints in last week for similar locations
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count, error } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .ilike('location_string', `%${locationString}%`)
        .gte('created_at', oneWeekAgo.toISOString());

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('Error fetching complaint count:', err);
      return 0;
    }
  }, []);

  return {
    submitComplaint,
    submitting,
    fetchMyComplaints,
    complaints,
    loading,
    fetchLocationComplaintCount,
  };
};
