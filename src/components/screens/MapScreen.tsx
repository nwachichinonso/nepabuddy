import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, Filter, ZoomIn, ZoomOut, Locate } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  status: 'on' | 'off' | 'partial';
  buddyCount: number;
  lastUpdate: string;
}

const zones: Zone[] = [
  { id: 'ikeja-gra', name: 'Ikeja GRA', status: 'on', buddyCount: 45, lastUpdate: '2 mins ago' },
  { id: 'lekki-p1', name: 'Lekki Phase 1', status: 'on', buddyCount: 127, lastUpdate: '1 min ago' },
  { id: 'lekki-p2', name: 'Lekki Phase 2', status: 'partial', buddyCount: 82, lastUpdate: '5 mins ago' },
  { id: 'vi', name: 'Victoria Island', status: 'on', buddyCount: 156, lastUpdate: '3 mins ago' },
  { id: 'surulere', name: 'Surulere', status: 'off', buddyCount: 67, lastUpdate: '10 mins ago' },
  { id: 'yaba', name: 'Yaba', status: 'on', buddyCount: 94, lastUpdate: '4 mins ago' },
  { id: 'mainland', name: 'Lagos Mainland', status: 'off', buddyCount: 112, lastUpdate: '15 mins ago' },
  { id: 'ajah', name: 'Ajah', status: 'on', buddyCount: 78, lastUpdate: '6 mins ago' },
  { id: 'ikoyi', name: 'Ikoyi', status: 'on', buddyCount: 63, lastUpdate: '2 mins ago' },
  { id: 'festac', name: 'Festac Town', status: 'partial', buddyCount: 41, lastUpdate: '8 mins ago' },
];

const statusConfig = {
  on: { label: 'Power On', color: 'bg-success', textColor: 'text-success', emoji: '⚡' },
  off: { label: 'Power Off', color: 'bg-danger', textColor: 'text-danger', emoji: '🔌' },
  partial: { label: 'Partial', color: 'bg-warning', textColor: 'text-warning-foreground', emoji: '⚠️' },
};

export const MapScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'on' | 'off' | 'partial'>('all');

  const filteredZones = zones.filter((zone) => {
    const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || zone.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(['all', 'on', 'off', 'partial'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-display font-medium whitespace-nowrap transition-all',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f === 'all' ? 'All Areas' : statusConfig[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative bg-muted/30 rounded-2xl h-48 overflow-hidden border border-border">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl">🗺️</div>
            <p className="text-sm text-muted-foreground font-display">
              Interactive map coming soon!
            </p>
            <p className="text-xs text-muted-foreground">
              Premium feature 💎
            </p>
          </div>
        </div>
        
        {/* Map controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button className="p-2 bg-card rounded-lg border border-border shadow-sm hover:bg-muted transition-colors">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 bg-card rounded-lg border border-border shadow-sm hover:bg-muted transition-colors">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 bg-card rounded-lg border border-border shadow-sm hover:bg-muted transition-colors">
            <Locate className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Zone List */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          {filteredZones.length} Areas Found
        </h3>
        
        <div className="space-y-2">
          {filteredZones.map((zone) => {
            const config = statusConfig[zone.status];
            return (
              <div
                key={zone.id}
                className="card-nepa flex items-center justify-between hover:shadow-soft transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                    zone.status === 'on' ? 'bg-success/10' : zone.status === 'off' ? 'bg-danger/10' : 'bg-warning/10'
                  )}>
                    {config.emoji}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">
                      {zone.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {zone.buddyCount} buddies • {zone.lastUpdate}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  'px-3 py-1 rounded-full text-xs font-display font-semibold',
                  zone.status === 'on' ? 'bg-success/10 text-success' :
                  zone.status === 'off' ? 'bg-danger/10 text-danger' :
                  'bg-warning/10 text-warning-foreground'
                )}>
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
