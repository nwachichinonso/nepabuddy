import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentSearch {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  timestamp: number;
}

interface AppState {
  // Theme
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
  
  // Settings
  pidginMode: boolean;
  setPidginMode: (value: boolean) => void;
  monitoringEnabled: boolean;
  setMonitoringEnabled: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  
  // Location & Zone
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  recentSearches: RecentSearch[];
  addRecentSearch: (search: RecentSearch) => void;
  clearRecentSearches: () => void;
  
  // Device ID (anonymous)
  deviceHash: string;
  setDeviceHash: (hash: string) => void;
  clearDeviceData: () => void;
  
  // Admin mode
  adminMode: boolean;
  setAdminMode: (value: boolean) => void;
  mascotTaps: number;
  incrementMascotTaps: () => void;
  resetMascotTaps: () => void;
}

// Generate a random device hash
const generateDeviceHash = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      setDarkMode: (value) => {
        set({ darkMode: value });
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleDarkMode: () => {
        const newValue = !get().darkMode;
        get().setDarkMode(newValue);
      },
      
      // Settings
      pidginMode: true,
      setPidginMode: (value) => set({ pidginMode: value }),
      monitoringEnabled: true,
      setMonitoringEnabled: (value) => set({ monitoringEnabled: value }),
      notificationsEnabled: true,
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      
      // Location & Zone
      selectedZoneId: null,
      setSelectedZoneId: (id) => set({ selectedZoneId: id }),
      recentSearches: [],
      addRecentSearch: (search) => {
        const current = get().recentSearches;
        const filtered = current.filter(s => s.placeId !== search.placeId);
        const updated = [search, ...filtered].slice(0, 5); // Keep last 5
        set({ recentSearches: updated });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      // Device ID
      deviceHash: generateDeviceHash(),
      setDeviceHash: (hash) => set({ deviceHash: hash }),
      clearDeviceData: () => set({ 
        deviceHash: generateDeviceHash(),
        recentSearches: [],
        selectedZoneId: null,
      }),
      
      // Admin mode
      adminMode: false,
      setAdminMode: (value) => set({ adminMode: value }),
      mascotTaps: 0,
      incrementMascotTaps: () => {
        const taps = get().mascotTaps + 1;
        if (taps >= 7) {
          set({ adminMode: true, mascotTaps: 0 });
        } else {
          set({ mascotTaps: taps });
        }
      },
      resetMascotTaps: () => set({ mascotTaps: 0 }),
    }),
    {
      name: 'nepa-buddy-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        pidginMode: state.pidginMode,
        monitoringEnabled: state.monitoringEnabled,
        notificationsEnabled: state.notificationsEnabled,
        selectedZoneId: state.selectedZoneId,
        recentSearches: state.recentSearches,
        deviceHash: state.deviceHash,
        adminMode: state.adminMode,
      }),
    }
  )
);

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('nepa-buddy-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.darkMode) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // Ignore
    }
  }
}
