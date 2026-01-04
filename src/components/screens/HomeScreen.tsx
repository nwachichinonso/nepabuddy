import React, { useState, useEffect } from 'react';
import StatusCard from '../home/StatusCard';
import FeedbackButtons from '../home/FeedbackButtons';
import MiniMap from '../home/MiniMap';
import { usePowerStatus } from '@/hooks/usePowerStatus';
import { useUserLocation } from '@/hooks/useUserLocation';
import { usePWA } from '@/hooks/usePWA';
import { useChargingStatus } from '@/hooks/useChargingStatus';
import { useZones, findNearestZone } from '@/hooks/useZones';
import { useAppStore } from '@/store/useAppStore';
import { GoogleMapsProvider } from '../map/GoogleMapsProvider';
import { PlacesAutocomplete } from '../search/PlacesAutocomplete';
import { AdminPanel } from '../admin/AdminPanel';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import haptic from '@/utils/haptic';

export const HomeScreen: React.FC = () => {
  const { userZone, setManualZone } = useUserLocation();
  const { powerStatus, loading } = usePowerStatus(userZone?.id);
  const { isOnline } = usePWA();
  const { zones } = useZones();
  const { adminMode, setAdminMode } = useAppStore();
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    name: string;
    status: string;
    buddyCount: number;
    confidence: string;
  } | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  
  // Enable charging status monitoring
  useChargingStatus(userZone?.id, true);

  // Haptic feedback on status change
  useEffect(() => {
    if (powerStatus?.status && previousStatus && powerStatus.status !== previousStatus) {
      haptic.powerChange(powerStatus.status === 'on');
    }
    if (powerStatus?.status) {
      setPreviousStatus(powerStatus.status);
    }
  }, [powerStatus?.status, previousStatus]);

  // Show admin panel when admin mode is activated
  useEffect(() => {
    if (adminMode) {
      setShowAdminPanel(true);
    }
  }, [adminMode]);

  const getLastUpdate = () => {
    if (!powerStatus?.updated_at) return 'Just now';
    try {
      return formatDistanceToNow(new Date(powerStatus.updated_at), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const handlePlaceSelect = (place: { placeId: string; name: string; lat: number; lng: number }) => {
    const nearestZone = findNearestZone(place.lat, place.lng, zones);
    
    if (nearestZone) {
      // Update user's zone
      setManualZone(nearestZone.id);
      
      // Show search result feedback
      setSearchResult({
        name: place.name,
        status: powerStatus?.status || 'unknown',
        buddyCount: powerStatus?.buddy_count || 0,
        confidence: powerStatus?.confidence || 'low',
      });
      
      // Clear after 5 seconds
      setTimeout(() => setSearchResult(null), 5000);
      
      haptic.medium();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar - Uber style */}
      <GoogleMapsProvider>
        <PlacesAutocomplete
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search your area in Lagos..."
        />
      </GoogleMapsProvider>

      {/* Search Result Feedback */}
      {searchResult && (
        <div className={cn(
          "card-nepa animate-scale-in",
          searchResult.status === 'on' ? 'border-success/30 bg-success/5' :
          searchResult.status === 'off' ? 'border-danger/30 bg-danger/5' :
          'border-warning/30 bg-warning/5'
        )}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {searchResult.status === 'on' ? '⚡' :
               searchResult.status === 'off' ? '🔌' :
               '⚠️'}
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-display font-bold",
                searchResult.status === 'on' ? 'text-success' :
                searchResult.status === 'off' ? 'text-danger' :
                'text-warning-foreground'
              )}>
                {searchResult.status === 'on' ? 'Light dey! ⚡️' :
                 searchResult.status === 'off' ? 'NEPA don carry light 😩' :
                 'E dey recover small small...'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchResult.name}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {searchResult.buddyCount}
            </div>
          </div>
        </div>
      )}

      {/* Main Status Card */}
      <StatusCard
        status={powerStatus?.status || 'unknown'}
        area={userZone?.displayName || 'Lagos'}
        buddyCount={powerStatus?.buddy_count || 0}
        lastUpdate={getLastUpdate()}
        confidence={powerStatus?.confidence || 'low'}
        loading={loading}
        isOnline={isOnline}
      />

      {/* Quick Feedback */}
      <FeedbackButtons zoneId={userZone?.id} />

      {/* Mini Map */}
      <MiniMap highlightedZoneId={userZone?.id} />

      {/* Recent Alert Preview */}
      <div className="card-nepa space-y-3">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Latest Updates
        </h3>
        <div className="space-y-2">
          <AlertItem
            type="restored"
            area="Ikeja GRA"
            time="15 mins ago"
            message="Light don return! 🎉"
          />
          <AlertItem
            type="outage"
            area="Surulere"
            time="2 hrs ago"
            message="NEPA don carry light 😩"
          />
          <AlertItem
            type="info"
            area="V.I."
            time="4 hrs ago"
            message="Planned maintenance complete ✅"
          />
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </div>
  );
};

interface AlertItemProps {
  type: 'outage' | 'restored' | 'info';
  area: string;
  time: string;
  message: string;
}

const AlertItem: React.FC<AlertItemProps> = ({ type, area, time, message }) => {
  const typeStyles = {
    outage: 'bg-danger/10 border-danger/20',
    restored: 'bg-success/10 border-success/20',
    info: 'bg-muted border-border',
  };

  const typeIcons = {
    outage: '🔌',
    restored: '⚡',
    info: 'ℹ️',
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${typeStyles[type]}`}>
      <span className="text-lg">{typeIcons[type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-semibold text-sm text-foreground">
            {area}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{message}</p>
      </div>
    </div>
  );
};

export default HomeScreen;
