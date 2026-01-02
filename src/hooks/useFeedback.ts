import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type FeedbackType = 'light_on' | 'light_off' | 'gen_mode' | 'inverter';

const getDeviceHash = (): string => {
  let hash = localStorage.getItem('nepa-buddy-device-hash');
  if (!hash) {
    hash = 'dev_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nepa-buddy-device-hash', hash);
  }
  return hash;
};

const feedbackMessages: Record<FeedbackType, { title: string; description: string }> = {
  light_on: {
    title: "⚡ Feedback received!",
    description: "Nice one! We don add your update. Na so we dey shine together! Confidence increased! 📈"
  },
  light_off: {
    title: "🔌 Feedback received!",
    description: "Noted o! We go update the squad. Hold body! Confidence increased! 📈"
  },
  gen_mode: {
    title: "⛽ Feedback received!",
    description: "Gen gang! 💨 Fuel price no be beans sha... we dey with you!"
  },
  inverter: {
    title: "🔋 Feedback received!",
    description: "Smart choice! Battery backup gang — We see you!"
  }
};

export const useFeedback = (zoneId?: string) => {
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedType, setLastSubmittedType] = useState<FeedbackType | null>(null);

  const submitFeedback = useCallback(async (feedbackType: FeedbackType) => {
    if (!zoneId) {
      toast({
        title: "Location needed",
        description: "Abeg set your area first so we fit update the right zone!",
        variant: "destructive"
      });
      return false;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          zone_id: zoneId,
          feedback_type: feedbackType,
          device_hash: getDeviceHash()
        });

      if (error) throw error;

      // Also submit as a device report for status calculation
      if (feedbackType === 'light_on' || feedbackType === 'light_off') {
        await supabase
          .from('device_reports')
          .insert({
            zone_id: zoneId,
            device_hash: getDeviceHash(),
            is_charging: feedbackType === 'light_on'
          });
      }

      const message = feedbackMessages[feedbackType];
      toast({
        title: message.title,
        description: message.description
      });

      setLastSubmittedType(feedbackType);
      
      // Reset after animation
      setTimeout(() => setLastSubmittedType(null), 2000);
      
      return true;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast({
        title: "Error!",
        description: "E no work o! Try again small small.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [zoneId]);

  return {
    submitFeedback,
    submitting,
    lastSubmittedType
  };
};
