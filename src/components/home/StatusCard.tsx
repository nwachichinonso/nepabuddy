import React from 'react';
import { cn } from '@/lib/utils';
import NepaBuddyMascot, { MascotMood } from '../mascot/NepaBuddyMascot';
import { Zap, ZapOff, Clock, Users, MapPin } from 'lucide-react';

export type PowerStatus = 'on' | 'off' | 'unknown' | 'recovering';

interface StatusCardProps {
  status: PowerStatus;
  area: string;
  buddyCount: number;
  lastUpdate: string;
  confidence: 'low' | 'medium' | 'high';
}

const statusConfig = {
  on: {
    mood: 'celebrating' as MascotMood,
    title: 'Light dey! ⚡️',
    subtitle: 'UP NEPA!!!',
    bgClass: 'bg-success/5',
    borderClass: 'border-success/20',
    iconClass: 'text-success',
    Icon: Zap,
  },
  off: {
    mood: 'sad' as MascotMood,
    title: 'Light don go 😩',
    subtitle: 'NEPA/Disco don carry am...',
    bgClass: 'bg-danger/5',
    borderClass: 'border-danger/20',
    iconClass: 'text-danger',
    Icon: ZapOff,
  },
  unknown: {
    mood: 'waiting' as MascotMood,
    title: 'We dey wait...',
    subtitle: 'Gathering more buddies',
    bgClass: 'bg-warning/5',
    borderClass: 'border-warning/20',
    iconClass: 'text-warning-foreground',
    Icon: Clock,
  },
  recovering: {
    mood: 'thinking' as MascotMood,
    title: 'Small small... 👀',
    subtitle: 'Light dey show face!',
    bgClass: 'bg-accent/5',
    borderClass: 'border-accent/20',
    iconClass: 'text-accent',
    Icon: Zap,
  },
};

const confidenceEmojis = {
  low: '🤔',
  medium: '😊',
  high: '😎',
};

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  area,
  buddyCount,
  lastUpdate,
  confidence,
}) => {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'card-nepa relative overflow-hidden transition-all duration-500',
        config.bgClass,
        config.borderClass,
        'border-2'
      )}
    >
      {/* Ankara pattern overlay */}
      <div className="absolute inset-0 ankara-pattern opacity-30 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Mascot */}
        <div className="relative">
          <NepaBuddyMascot mood={config.mood} size="xl" />
          
          {/* Pulse ring for active status */}
          {status === 'on' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-4 border-success/30 animate-pulse-ring" />
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-bold text-foreground">
            {config.title}
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            {config.subtitle}
          </p>
        </div>

        {/* Area info */}
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full',
          config.bgClass,
          'border',
          config.borderClass
        )}>
          <MapPin className={cn('w-4 h-4', config.iconClass)} />
          <span className="font-display font-semibold">{area}</span>
          <config.Icon className={cn('w-4 h-4', config.iconClass)} />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{buddyCount} buddies</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <span>Confidence: {confidenceEmojis[confidence]}</span>
          </div>
          <span className="text-border">•</span>
          <span>{lastUpdate}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
