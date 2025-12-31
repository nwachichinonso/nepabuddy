import React from 'react';
import { cn } from '@/lib/utils';

export interface NotificationData {
  id: string;
  type: 'outage' | 'restored' | 'grid-collapse' | 'maintenance' | 'partial' | 'waiting';
  title: string;
  body: string;
  timestamp: string;
}

const notificationExamples: NotificationData[] = [
  {
    id: '1',
    type: 'outage',
    title: 'Chai! Light don go again 😩🔌',
    body: 'Many buddies for Lekki Phase 1 just comot charger. NEPA/Disco don carry am! (High confidence) No vex, hold body small — gen fuel dey? We dey watch together 💪',
    timestamp: 'Just now',
  },
  {
    id: '2',
    type: 'restored',
    title: 'EHEN!!! UP NEPA!!! 🎉⚡️🇳🇬',
    body: 'Light don return for Lekki Phase 1! Everybody dey plug in — correct groove! 🕺🏾 Thank you for being part of the squad — na we dey make am happen!',
    timestamp: '2 mins ago',
  },
  {
    id: '3',
    type: 'grid-collapse',
    title: 'Chai! Grid don fall again! 😭',
    body: 'Sudden-sudden light loss everywhere — national wahala o! We dey wait TCN... Gen dey ready? We go update you as e dey happen.',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'maintenance',
    title: 'Heads up! Planned cut incoming ⚠️',
    body: 'Disco (Excel) talk say light go go small for maintenance tomorrow 8am-2pm for Ikeja area. Gen ready? We go shout when e return!',
    timestamp: '3 hours ago',
  },
  {
    id: '5',
    type: 'partial',
    title: 'Small small... light dey show face 👀',
    body: 'Some buddies for Victoria Island don see light! Still waiting for more people to confirm... fingers crossed! 🤞',
    timestamp: '5 mins ago',
  },
  {
    id: '6',
    type: 'waiting',
    title: 'Still gathering buddies... 🤔',
    body: 'We need more people for your area to confirm power status. Share NEPA Buddy with your neighbors make we get better data!',
    timestamp: '10 mins ago',
  },
];

const typeStyles = {
  outage: {
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    icon: '🔌',
  },
  restored: {
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: '⚡',
  },
  'grid-collapse': {
    bg: 'bg-danger/15',
    border: 'border-danger/30',
    icon: '😭',
  },
  maintenance: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: '⚠️',
  },
  partial: {
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    icon: '👀',
  },
  waiting: {
    bg: 'bg-muted',
    border: 'border-border',
    icon: '🤔',
  },
};

interface NotificationPreviewProps {
  showAll?: boolean;
}

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({ 
  showAll = false 
}) => {
  const notifications = showAll 
    ? notificationExamples 
    : notificationExamples.slice(0, 3);

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Notification Examples
      </h3>
      
      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const styles = typeStyles[notification.type];
          return (
            <div
              key={notification.id}
              className={cn(
                'p-4 rounded-2xl border-2 transition-all animate-fade-in',
                styles.bg,
                styles.border
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{styles.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-display font-bold text-foreground text-sm leading-snug">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {notification.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPreview;
