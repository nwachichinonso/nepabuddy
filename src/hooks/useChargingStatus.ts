import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

const getDeviceHash = (): string => {
  let hash = localStorage.getItem('nepa-buddy-device-hash');
  if (!hash) {
    hash = 'dev_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nepa-buddy-device-hash', hash);
  }
  return hash;
};

export const useChargingStatus = (zoneId?: string, enabled = true) => {
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const lastReportedRef = useRef<boolean | null>(null);

  const reportChargingStatus = useCallback(async (charging: boolean) => {
    if (!zoneId || !enabled) return;
    
    // Avoid duplicate reports
    if (lastReportedRef.current === charging) return;
    lastReportedRef.current = charging;

    try {
      await supabase.from('device_reports').insert({
        zone_id: zoneId,
        device_hash: getDeviceHash(),
        is_charging: charging
      });
      console.log('Charging status reported:', charging);
    } catch (err) {
      console.error('Failed to report charging status:', err);
    }
  }, [zoneId, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const initBattery = async () => {
      if (!navigator.getBattery) {
        console.log('Battery API not supported');
        setIsSupported(false);
        return;
      }

      try {
        const battery = await navigator.getBattery();
        setIsSupported(true);
        setIsCharging(battery.charging);
        setBatteryLevel(battery.level);

        // Report initial status
        if (zoneId) {
          reportChargingStatus(battery.charging);
        }

        // Listen for charging changes
        const handleChargingChange = () => {
          const newCharging = battery.charging;
          setIsCharging(newCharging);
          
          if (zoneId) {
            reportChargingStatus(newCharging);
          }
        };

        const handleLevelChange = () => {
          setBatteryLevel(battery.level);
        };

        battery.addEventListener('chargingchange', handleChargingChange);
        battery.addEventListener('levelchange', handleLevelChange);

        return () => {
          battery.removeEventListener('chargingchange', handleChargingChange);
          battery.removeEventListener('levelchange', handleLevelChange);
        };
      } catch (err) {
        console.error('Battery API error:', err);
        setIsSupported(false);
      }
    };

    const cleanup = initBattery();
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, [zoneId, enabled, reportChargingStatus]);

  return {
    isCharging,
    batteryLevel,
    isSupported
  };
};
