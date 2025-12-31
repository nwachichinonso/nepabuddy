import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, Clock, ExternalLink } from 'lucide-react';

interface Notice {
  id: string;
  type: 'maintenance' | 'info' | 'warning';
  source: string;
  title: string;
  description: string;
  datetime: string;
  areas?: string[];
}

const notices: Notice[] = [
  {
    id: '1',
    type: 'maintenance',
    source: 'Excel (Eko Disco)',
    title: 'Planned Maintenance Notice',
    description: 'Routine maintenance work will affect power supply in Ikeja West injection substation areas.',
    datetime: 'Jan 2, 2026 • 8:00 AM - 5:00 PM',
    areas: ['Ikeja GRA', 'Oregun', 'Alausa'],
  },
  {
    id: '2',
    type: 'info',
    source: 'TCN',
    title: 'Grid Stability Update',
    description: 'Vandalized transmission line between Oshogbo and Benin has been repaired. Full capacity restored.',
    datetime: 'Dec 30, 2025',
  },
  {
    id: '3',
    type: 'warning',
    source: 'IE Energy (Ikeja Electric)',
    title: 'Load Shedding Notice',
    description: 'Due to gas constraints, some areas may experience scheduled load shedding during peak hours.',
    datetime: 'Ongoing',
    areas: ['Lagos Mainland', 'Surulere', 'Yaba'],
  },
];

const typeStyles = {
  maintenance: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: <Clock className="w-4 h-4 text-warning-foreground" />,
    badge: 'bg-warning/20 text-warning-foreground',
  },
  info: {
    bg: 'bg-muted',
    border: 'border-border',
    icon: <Info className="w-4 h-4 text-muted-foreground" />,
    badge: 'bg-muted text-muted-foreground',
  },
  warning: {
    bg: 'bg-danger/5',
    border: 'border-danger/20',
    icon: <AlertTriangle className="w-4 h-4 text-danger" />,
    badge: 'bg-danger/20 text-danger',
  },
};

export const OfficialNotices: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Official Notices 📢
        </h3>
        <button className="text-xs text-primary font-display font-medium flex items-center gap-1">
          View all
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {notices.map((notice) => {
          const styles = typeStyles[notice.type];
          return (
            <div
              key={notice.id}
              className={cn(
                'p-4 rounded-2xl border',
                styles.bg,
                styles.border
              )}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-2">
                <div className="mt-0.5">{styles.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-display font-medium',
                      styles.badge
                    )}>
                      {notice.source}
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-foreground text-sm">
                    {notice.title}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                {notice.description}
              </p>

              {/* Areas */}
              {notice.areas && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {notice.areas.map((area) => (
                    <span
                      key={area}
                      className="px-2 py-0.5 rounded-md bg-background/50 text-xs text-muted-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              {/* Datetime */}
              <p className="text-xs text-muted-foreground">
                📅 {notice.datetime}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OfficialNotices;
