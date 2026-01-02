import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, Clock, ExternalLink, Zap, CheckCircle } from 'lucide-react';
import { useOfficialNotices, OfficialNotice } from '@/hooks/useOfficialNotices';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const typeStyles: Record<OfficialNotice['notice_type'], {
  bg: string;
  border: string;
  icon: React.ReactNode;
  badge: string;
}> = {
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
  grid_collapse: {
    bg: 'bg-danger/5',
    border: 'border-danger/20',
    icon: <AlertTriangle className="w-4 h-4 text-danger" />,
    badge: 'bg-danger/20 text-danger',
  },
  restoration: {
    bg: 'bg-success/5',
    border: 'border-success/20',
    icon: <CheckCircle className="w-4 h-4 text-success" />,
    badge: 'bg-success/20 text-success',
  },
};

export const OfficialNotices: React.FC = () => {
  const { notices, loading } = useOfficialNotices();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Official Notices 📢
          </h3>
        </div>
        <div className="card-nepa text-center py-8">
          <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No active notices</p>
          <p className="text-sm text-muted-foreground">All systems dey normal! ⚡</p>
        </div>
      </div>
    );
  }

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
        {notices.slice(0, 3).map((notice) => {
          const styles = typeStyles[notice.notice_type] || typeStyles.info;
          const timeAgo = formatDistanceToNow(new Date(notice.created_at), { addSuffix: true });
          
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
                {notice.content}
              </p>

              {/* Areas */}
              {notice.affected_zones && notice.affected_zones.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {notice.affected_zones.map((area) => (
                    <span
                      key={area}
                      className="px-2 py-0.5 rounded-md bg-background/50 text-xs text-muted-foreground capitalize"
                    >
                      {area.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Datetime */}
              <p className="text-xs text-muted-foreground">
                📅 {timeAgo}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OfficialNotices;
