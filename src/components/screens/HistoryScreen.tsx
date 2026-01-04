import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, Clock, Zap, ZapOff, Download, Loader2 } from 'lucide-react';
import { useOutageHistory } from '@/hooks/useOutageHistory';
import { useUserLocation } from '@/hooks/useUserLocation';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const funnyPidginCaptions = [
  "Chai! This one long pass exam 😩",
  "Monday morning wahala as usual 🙃",
  "Gen don drink all my fuel money 💸",
  "NEPA no get chill at all 😤",
  "We go survive am! 💪",
  "At least e short - small wins 😅",
  "Thank God say e don come back! 🙏",
  "Inverter don carry the load today 🔋",
  "I blame the transformer 🔌",
  "Grid collapse special delivery 😭",
  "Weekend without AC? Na wa o! 🥵",
  "Phone battery entered red zone 📱",
  "Candlelight dinner no be choice 🕯️",
  "Generator mechanics go feast this month 💰",
];

export const HistoryScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '14d' | '30d'>('7d');
  const { userZone } = useUserLocation();
  const { history, loading, error } = useOutageHistory(userZone?.id);
  const { toast } = useToast();

  const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '14d' ? 14 : 30;

  // Filter history by period
  const filteredHistory = useMemo(() => {
    if (!history) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    return history.filter(h => new Date(h.started_at) >= cutoff);
  }, [history, periodDays]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredHistory.length) {
      return {
        totalOutages: 0,
        avgDuration: '0m',
        longestOutage: '0m',
        lightHours: '100%',
      };
    }

    const totalOutages = filteredHistory.length;
    const durations = filteredHistory
      .filter(h => h.duration_minutes)
      .map(h => h.duration_minutes || 0);
    
    const avgMins = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const maxMins = durations.length ? Math.max(...durations) : 0;
    
    const totalOutageMinutes = durations.reduce((a, b) => a + b, 0);
    const totalMinutes = periodDays * 24 * 60;
    const lightPercentage = Math.round(((totalMinutes - totalOutageMinutes) / totalMinutes) * 100);

    const formatDuration = (mins: number) => {
      if (mins < 60) return `${mins}m`;
      const hours = Math.floor(mins / 60);
      const remaining = mins % 60;
      return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
    };

    return {
      totalOutages,
      avgDuration: formatDuration(avgMins),
      longestOutage: formatDuration(maxMins),
      lightHours: `${lightPercentage}%`,
    };
  }, [filteredHistory, periodDays]);

  const handleExport = () => {
    const exportData = {
      zone: userZone?.displayName || 'Unknown',
      period: selectedPeriod,
      exportedAt: new Date().toISOString(),
      stats,
      history: filteredHistory.map(h => ({
        started: h.started_at,
        ended: h.ended_at,
        duration_minutes: h.duration_minutes,
        buddy_count: h.buddy_count,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nepa-buddy-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported! 📊",
      description: "Take am show DISCO for billing fight! 💪",
    });
  };

  const getRandomCaption = (index: number) => {
    return funnyPidginCaptions[index % funnyPidginCaptions.length];
  };

  const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = differenceInMinutes(now, date);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return formatDistanceToNow(date, { addSuffix: true });
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(['7d', '14d', '30d'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-display font-medium transition-all',
              selectedPeriod === period
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {period === '7d' ? '7 Days' : period === '14d' ? '14 Days' : '30 Days'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Outages"
          value={stats.totalOutages.toString()}
          icon={<ZapOff className="w-4 h-4" />}
          trend="down"
          trendLabel="Track your wahala"
        />
        <StatCard
          label="Avg Duration"
          value={stats.avgDuration}
          icon={<Clock className="w-4 h-4" />}
          trend="down"
          trendLabel="Per outage"
        />
        <StatCard
          label="Longest Outage"
          value={stats.longestOutage}
          icon={<TrendingDown className="w-4 h-4" />}
          trend="neutral"
          trendLabel="Maximum wahala 😭"
        />
        <StatCard
          label="Light Hours"
          value={stats.lightHours}
          icon={<Zap className="w-4 h-4" />}
          trend="up"
          trendLabel="Uptime percentage"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Recent Events
          </h3>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1 text-xs text-primary font-display font-medium hover:underline"
          >
            <Download className="w-3 h-3" />
            Export Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Error loading history 😢</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-muted-foreground font-display">
              No outages for {userZone?.displayName || 'your area'}! EHEN!
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

            <div className="space-y-4">
              {filteredHistory.map((event, index) => {
                const isRestored = !!event.ended_at;
                return (
                  <div 
                    key={event.id} 
                    className="relative flex gap-4 animate-fade-in" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      isRestored ? 'bg-success/20' : 'bg-danger/20'
                    )}>
                      {isRestored ? (
                        <Zap className="w-5 h-5 text-success" />
                      ) : (
                        <ZapOff className="w-5 h-5 text-danger" />
                      )}
                    </div>

                    {/* Event card */}
                    <div className={cn(
                      'flex-1 card-nepa border',
                      isRestored ? 'border-success/20' : 'border-danger/20'
                    )}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-display font-semibold text-foreground">
                            {event.zones?.display_name || 'Unknown Area'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatEventTime(event.started_at)}
                          </p>
                        </div>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-display font-medium',
                          isRestored 
                            ? 'bg-success/10 text-success' 
                            : 'bg-danger/10 text-danger'
                        )}>
                          {isRestored ? 'Restored' : 'Ongoing'}
                        </span>
                      </div>

                      {event.duration_minutes && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="w-3 h-3" />
                          <span>Duration: {event.duration_minutes}m</span>
                          <span className="text-border">•</span>
                          <span>{event.buddy_count} buddies</span>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground italic">
                        "{event.funny_caption || getRandomCaption(index)}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  trendLabel: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendLabel }) => {
  return (
    <div className="card-nepa space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-display uppercase tracking-wide">
          {label}
        </span>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <div className="flex items-center gap-1">
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3 text-danger" />}
        <span className="text-xs text-muted-foreground">{trendLabel}</span>
      </div>
    </div>
  );
};

export default HistoryScreen;
