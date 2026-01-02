import { useState, useEffect, useCallback } from 'react';
import { useZones } from './useZones';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UserZone {
  id: string;
  name: string;
  displayName: string;
}

const STORAGE_KEY = 'nepa-buddy-user-zone';
const LOCATION_STORAGE_KEY = 'nepa-buddy-user-location';

export const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [userZone, setUserZone] = useState<UserZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unavailable'>('prompt');
  
  const { zones, findNearestZone } = useZones();

  // Load saved zone from localStorage
  useEffect(() => {
    const savedZone = localStorage.getItem(STORAGE_KEY);
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    
    if (savedZone) {
      try {
        setUserZone(JSON.parse(savedZone));
      } catch (e) {
        console.error('Failed to parse saved zone:', e);
      }
    }
    
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error('Failed to parse saved location:', e);
      }
    }
  }, []);

  // Check permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
        
        result.addEventListener('change', () => {
          setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
        });
      }).catch(() => {
        setPermissionStatus('unavailable');
      });
    } else if (!('geolocation' in navigator)) {
      setPermissionStatus('unavailable');
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation no dey supported for this browser');
      setPermissionStatus('unavailable');
      return;
    }

    setLoading(true);
    setError(null);

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          setLocation(newLocation);
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
          setPermissionStatus('granted');
          
          // Find nearest zone
          if (zones.length > 0) {
            const nearest = findNearestZone(newLocation.latitude, newLocation.longitude);
            if (nearest) {
              const zone: UserZone = {
                id: nearest.id,
                name: nearest.name,
                displayName: nearest.display_name
              };
              setUserZone(zone);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(zone));
            }
          }
          
          setLoading(false);
          resolve();
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(err.message);
          setLoading(false);
          
          if (err.code === 1) {
            setPermissionStatus('denied');
          }
          reject(err);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes cache
        }
      );
    });
  }, [zones, findNearestZone]);

  // Update zone when zones are loaded and we have location
  useEffect(() => {
    if (location && zones.length > 0 && !userZone) {
      const nearest = findNearestZone(location.latitude, location.longitude);
      if (nearest) {
        const zone: UserZone = {
          id: nearest.id,
          name: nearest.name,
          displayName: nearest.display_name
        };
        setUserZone(zone);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(zone));
      }
    }
  }, [location, zones, userZone, findNearestZone]);

  const setManualZone = useCallback((zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      const userZoneData: UserZone = {
        id: zone.id,
        name: zone.name,
        displayName: zone.display_name
      };
      setUserZone(userZoneData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userZoneData));
    }
  }, [zones]);

  const clearZone = useCallback(() => {
    setUserZone(null);
    setLocation(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  }, []);

  return {
    location,
    userZone,
    loading,
    error,
    permissionStatus,
    requestLocation,
    setManualZone,
    clearZone
  };
};
