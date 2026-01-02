import React from 'react';
import StatusCard from '../home/StatusCard';
import FeedbackButtons from '../home/FeedbackButtons';
import MiniMap from '../home/MiniMap';
import { PowerStatus } from '../home/StatusCard';
import { usePowerStatus } from '@/hooks/usePowerStatus';
import { useUserLocation } from '@/hooks/useUserLocation';
import { usePWA } from '@/hooks/usePWA';
import { useChargingStatus } from '@/hooks/useChargingStatus';
import { formatDistanceToNow } from 'date-fns';

interface HomeScreenProps {
  currentStatus?: PowerStatus;
}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { userZone } = useUserLocation();
  const { powerStatus, loading } = usePowerStatus(userZone?.id);
  const { isOnline } = usePWA();
  
  // Enable charging status monitoring
  useChargingStatus(userZone?.id, true);

  const getLastUpdate = () => {
    if (!powerStatus?.updated_at) return 'Just now';
    try {
      return formatDistanceToNow(new Date(powerStatus.updated_at), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Status Card */}
      <StatusCard
        status={powerStatus?.status || 'unknown'}
        area={userZone?.displayName || powerStatus?.zones?.display_name || 'Lagos'}
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
