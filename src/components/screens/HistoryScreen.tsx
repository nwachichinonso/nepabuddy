import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, Clock, Zap, ZapOff } from 'lucide-react';

interface OutageEvent {
  id: string;
  type: 'outage' | 'restored';
  area: string;
  startTime: string;
  duration?: string;
  buddyCount: number;
  funnyCaption: string;
}

const historyData: OutageEvent[] = [
  {
    id: '1',
    type: 'restored',
    area: 'Lekki Phase 1',
    startTime: 'Today, 2:45 PM',
    duration: '4 hrs 20 mins',
    buddyCount: 127,
    funnyCaption: 'That long? Thank God say e don come back! 🙏',
  },
  {
    id: '2',
    type: 'outage',
    area: 'Ikeja GRA',
    startTime: 'Today, 10:30 AM',
    duration: '2 hrs 15 mins',
    buddyCount: 89,
    funnyCaption: 'Monday morning wahala as usual 😩',
  },
  {
    id: '3',
    type: 'restored',
    area: 'Victoria Island',
    startTime: 'Yesterday, 8:00 PM',
    duration: '45 mins',
    buddyCount: 156,
    funnyCaption: 'Short and sweet! Gen no even warm up 😅',
  },
  {
    id: '4',
    type: 'outage',
    area: 'Surulere',
    startTime: 'Yesterday, 3:15 PM',
    duration: '6 hrs 30 mins',
    buddyCount: 67,
    funnyCaption: 'Fuel don finish for gen by this time 💸',
  },
  {
    id: '5',
    type: 'restored',
    area: 'Yaba',
    startTime: '2 days ago, 11:45 AM',
    duration: '1 hr 50 mins',
    buddyCount: 94,
    funnyCaption: 'Not bad at all. We move! 💪',
  },
  {
    id: '6',
    type: 'outage',
    area: 'Lagos Mainland',
    startTime: '3 days ago, 7:00 AM',
    duration: '12 hrs!',
    buddyCount: 112,
    funnyCaption: 'National grid wahala 😭 Longest day ever!',
  },
];

export const HistoryScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '14d' | '30d'>('7d');

  // Mock stats
  const stats = {
    totalOutages: 8,
    avgDuration: '3h 25m',
    longestOutage: '12 hrs',
    lightHours: '68%',
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
          trendLabel="-2 from last week"
        />
        <StatCard
          label="Avg Duration"
          value={stats.avgDuration}
          icon={<Clock className="w-4 h-4" />}
          trend="down"
          trendLabel="Getting better!"
        />
        <StatCard
          label="Longest Outage"
          value={stats.longestOutage}
          icon={<TrendingDown className="w-4 h-4" />}
          trend="neutral"
          trendLabel="Grid collapse day 😭"
        />
        <StatCard
          label="Light Hours"
          value={stats.lightHours}
          icon={<Zap className="w-4 h-4" />}
          trend="up"
          trendLabel="+5% improvement!"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Recent Events
          </h3>
          <button className="flex items-center gap-1 text-xs text-primary font-display font-medium">
            <Calendar className="w-3 h-3" />
            Export
          </button>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

          <div className="space-y-4">
            {historyData.map((event, index) => (
              <div key={event.id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Timeline dot */}
                <div className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                  event.type === 'restored' ? 'bg-success/20' : 'bg-danger/20'
                )}>
                  {event.type === 'restored' ? (
                    <Zap className="w-5 h-5 text-success" />
                  ) : (
                    <ZapOff className="w-5 h-5 text-danger" />
                  )}
                </div>

                {/* Event card */}
                <div className={cn(
                  'flex-1 card-nepa',
                  event.type === 'restored' ? 'border-success/20' : 'border-danger/20',
                  'border'
                )}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-display font-semibold text-foreground">
                        {event.area}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {event.startTime}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-display font-medium',
                      event.type === 'restored' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-danger/10 text-danger'
                    )}>
                      {event.type === 'restored' ? 'Restored' : 'Outage'}
                    </span>
                  </div>

                  {event.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="w-3 h-3" />
                      <span>Duration: {event.duration}</span>
                      <span className="text-border">•</span>
                      <span>{event.buddyCount} buddies</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground italic">
                    "{event.funnyCaption}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
