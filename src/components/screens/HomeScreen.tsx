import React from 'react';
import StatusCard from '../home/StatusCard';
import FeedbackButtons from '../home/FeedbackButtons';
import MiniMap from '../home/MiniMap';
import { PowerStatus } from '../home/StatusCard';

interface HomeScreenProps {
  currentStatus?: PowerStatus;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  currentStatus = 'on' 
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Status Card */}
      <StatusCard
        status={currentStatus}
        area="Lekki Phase 1"
        buddyCount={127}
        lastUpdate="1 min ago"
        confidence="high"
      />

      {/* Quick Feedback */}
      <FeedbackButtons />

      {/* Mini Map */}
      <MiniMap />

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
