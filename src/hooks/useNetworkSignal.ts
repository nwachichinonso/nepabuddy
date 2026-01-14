import { useState, useEffect, useCallback } from 'react';

export interface NetworkSignalData {
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  isOnGrid: boolean; // Inferred from signal stability
  lastUpdated: Date;
}

// Extended navigator type for Network Information API
interface NetworkInformation extends EventTarget {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  onchange?: EventListener;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

const getSignalStrength = (effectiveType: string, rtt: number): NetworkSignalData['signalStrength'] => {
  if (!navigator.onLine) return 'offline';
  
  // Based on effective connection type and round-trip time
  if (effectiveType === '4g' && rtt < 100) return 'excellent';
  if (effectiveType === '4g' || (effectiveType === '3g' && rtt < 200)) return 'good';
  if (effectiveType === '3g' || (effectiveType === '2g' && rtt < 400)) return 'fair';
  return 'poor';
};

const inferGridStatus = (
  signalStrength: NetworkSignalData['signalStrength'],
  signalHistory: NetworkSignalData['signalStrength'][]
): boolean => {
  // If signal is consistently good/excellent, likely on-grid power
  // If signal fluctuates or is poor, may indicate backup power at cell towers
  
  if (signalStrength === 'offline') return false;
  if (signalStrength === 'excellent' || signalStrength === 'good') return true;
  
  // Check recent history for stability
  const recentSignals = signalHistory.slice(-5);
  const poorCount = recentSignals.filter(s => s === 'poor' || s === 'fair').length;
  
  // If more than half of recent readings are poor/fair, likely off-grid
  return poorCount < 3;
};

export const useNetworkSignal = () => {
  const [signalData, setSignalData] = useState<NetworkSignalData | null>(null);
  const [signalHistory, setSignalHistory] = useState<NetworkSignalData['signalStrength'][]>([]);
  const [isSupported, setIsSupported] = useState(false);

  const updateSignalData = useCallback(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      // Fallback for browsers without Network Information API
      const fallbackData: NetworkSignalData = {
        connectionType: 'unknown',
        effectiveType: navigator.onLine ? '4g' : 'offline',
        downlink: 0,
        rtt: 0,
        saveData: false,
        signalStrength: navigator.onLine ? 'good' : 'offline',
        isOnGrid: navigator.onLine,
        lastUpdated: new Date()
      };
      setSignalData(fallbackData);
      return;
    }

    const effectiveType = connection.effectiveType || '4g';
    const rtt = connection.rtt || 0;
    const strength = getSignalStrength(effectiveType, rtt);
    
    setSignalHistory(prev => {
      const newHistory = [...prev, strength].slice(-10);
      const isOnGrid = inferGridStatus(strength, newHistory);
      
      setSignalData({
        connectionType: connection.type || 'unknown',
        effectiveType,
        downlink: connection.downlink || 0,
        rtt,
        saveData: connection.saveData || false,
        signalStrength: strength,
        isOnGrid,
        lastUpdated: new Date()
      });
      
      return newHistory;
    });
  }, []);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    setIsSupported(!!connection);
    
    // Initial reading
    updateSignalData();
    
    // Listen for connection changes
    if (connection) {
      connection.addEventListener('change', updateSignalData);
    }
    
    // Also listen for online/offline events
    window.addEventListener('online', updateSignalData);
    window.addEventListener('offline', updateSignalData);
    
    // Poll every 30 seconds for continuous monitoring
    const interval = setInterval(updateSignalData, 30000);
    
    return () => {
      if (connection) {
        connection.removeEventListener('change', updateSignalData);
      }
      window.removeEventListener('online', updateSignalData);
      window.removeEventListener('offline', updateSignalData);
      clearInterval(interval);
    };
  }, [updateSignalData]);

  return {
    signalData,
    isSupported,
    refresh: updateSignalData
  };
};
