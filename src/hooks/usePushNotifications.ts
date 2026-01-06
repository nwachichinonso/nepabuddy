import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

// VAPID public key - this should match the private key in edge function
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

interface PushSubscriptionData {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  zone_id?: string;
}

export const usePushNotifications = (zoneId?: string) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  const { deviceHash, notificationsEnabled } = useAppStore();
  const { toast } = useToast();

  // Check if push is supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check existing subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported) return;
      
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // Convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = useCallback((base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Push not supported",
        description: "Your browser no support push notifications o! 😢",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast({
          title: "Permission denied",
          description: "You need to allow notifications to receive power alerts!",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Extract keys
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');
      
      if (!p256dh || !auth) {
        throw new Error('Failed to get subscription keys');
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh_key: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
        auth_key: btoa(String.fromCharCode(...new Uint8Array(auth))),
        zone_id: zoneId,
      };

      // Save to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          device_hash: deviceHash,
          ...subscriptionData,
        }, {
          onConflict: 'device_hash,endpoint',
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Notifications enabled! 🔔",
        description: "You go hear when light come or go for your area!",
      });

      return true;
    } catch (error) {
      console.error('Push subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Something go wrong, try again later!",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, deviceHash, zoneId, toast, urlBase64ToUint8Array]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from Supabase
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('device_hash', deviceHash)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      toast({
        title: "Notifications disabled",
        description: "You no go receive power alerts again o!",
      });

      return true;
    } catch (error) {
      console.error('Push unsubscribe error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, deviceHash, toast]);

  // Update zone for subscription
  const updateZone = useCallback(async (newZoneId: string) => {
    if (!isSubscribed || !deviceHash) return;

    try {
      await supabase
        .from('push_subscriptions')
        .update({ zone_id: newZoneId, updated_at: new Date().toISOString() })
        .eq('device_hash', deviceHash);
    } catch (error) {
      console.error('Failed to update subscription zone:', error);
    }
  }, [isSubscribed, deviceHash]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    updateZone,
  };
};
