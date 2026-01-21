import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, Filter, Loader2, MapPin, Users } from 'lucide-react';
import { GoogleMapsProvider } from '../map/GoogleMapsProvider';
import { InteractiveMap } from '../map/InteractiveMap';
import { LocationSearch } from '../search/LocationSearch';
import { ZoneSubmissionForm } from '../zones/ZoneSubmissionForm';
import { usePowerStatus } from '@/hooks/usePowerStatus';
import { useZones, findNearestZone } from '@/hooks/useZones';
import { useAppStore } from '@/store/useAppStore';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  on: { label: 'Power ON', color: 'bg-success', textColor: 'text-success', emoji: '⚡' },
  off: { label: 'Power OFF', color: 'bg-danger', textColor: 'text-danger', emoji: '🔌' },
  recovering: { label: 'Recovering', color: 'bg-warning', textColor: 'text-warning-foreground', emoji: '⚠️' },
  unknown: { label: 'Unknown', color: 'bg-muted', textColor: 'text-muted-foreground', emoji: '❓' },
};

export const MapScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'on' | 'off' | 'recovering'>('all');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{
    name: string;
    zoneId?: string;
    status?: string;
    buddyCount?: number;
    confidence?: string;
  } | null>(null);

  const { zones, loading: zonesLoading, refetch: refetchZones } = useZones();
  const { allZonesStatus, loading: statusLoading } = usePowerStatus();
  const { addRecentSearch } = useAppStore();

  // Merge zones with status
  const zonesWithStatus = useMemo(() => {
    return zones.map(zone => {
      const status = allZonesStatus?.find(s => s.zone_id === zone.id);
      return {
        ...zone,
        powerStatus: status?.status || 'unknown',
        confidence: status?.confidence || 'low',
        buddyCount: status?.buddy_count || 0,
        lastUpdate: status?.updated_at,
      };
    });
  }, [zones, allZonesStatus]);

  // Filter zones
  const filteredZones = useMemo(() => {
    if (filter === 'all') return zonesWithStatus;
    return zonesWithStatus.filter(z => z.powerStatus === filter);
  }, [zonesWithStatus, filter]);

  const handlePlaceSelect = useCallback((place: { placeId: string; name: string; lat: number; lng: number }) => {
    setMapCenter({ lat: place.lat, lng: place.lng });
    
    // Find nearest zone
    const nearestZone = findNearestZone(place.lat, place.lng, zones);
    
    if (nearestZone) {
      setSelectedZone(nearestZone.id);
      const status = allZonesStatus?.find(s => s.zone_id === nearestZone.id);
      setSearchResult({
        name: place.name,
        zoneId: nearestZone.id,
        status: status?.status || 'unknown',
        buddyCount: status?.buddy_count || 0,
        confidence: status?.confidence || 'low',
      });
    } else {
      setSearchResult({
        name: place.name,
        status: 'unknown',
        buddyCount: 0,
        confidence: 'low',
      });
    }
  }, [zones, allZonesStatus]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
    const zone = zonesWithStatus.find(z => z.id === zoneId);
    if (zone) {
      setSearchResult({
        name: zone.display_name,
        zoneId: zone.id,
        status: zone.powerStatus,
        buddyCount: zone.buddyCount,
        confidence: zone.confidence,
      });
    }
  };

  const getLastUpdateText = (date?: string) => {
    if (!date) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const isLoading = zonesLoading || statusLoading;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search Bar - Uber style with fallback */}
      <GoogleMapsProvider>
        <LocationSearch
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search your area in Lagos..."
          className="mb-4"
        />
      </GoogleMapsProvider>

      {/* Search Result Card */}
      {searchResult && (
        <div className="card-nepa animate-scale-in">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
              searchResult.status === 'on' ? 'bg-success/10' :
              searchResult.status === 'off' ? 'bg-danger/10' :
              'bg-warning/10'
            )}>
              {statusConfig[searchResult.status as keyof typeof statusConfig]?.emoji || '❓'}
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg text-foreground">
                {searchResult.name}
              </h3>
              <p className={cn(
                'font-display font-semibold text-sm',
                searchResult.status === 'on' ? 'text-success' :
                searchResult.status === 'off' ? 'text-danger' :
                'text-warning-foreground'
              )}>
                {searchResult.status === 'on' ? 'Light dey! ⚡️' :
                 searchResult.status === 'off' ? 'NEPA don carry light 😩' :
                 searchResult.status === 'recovering' ? 'E dey come back small small...' :
                 'We no sabi status yet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {searchResult.buddyCount} buddies
            </span>
            <span>•</span>
            <span>Confidence: {searchResult.confidence}</span>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(['all', 'on', 'off', 'recovering'] as const).map((f) => (
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
            {f === 'all' ? 'All Areas' : 
             f === 'on' ? '⚡ Power ON' :
             f === 'off' ? '🔌 Power OFF' :
             '⚠️ Recovering'}
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <GoogleMapsProvider>
        <div className="h-64 rounded-2xl overflow-hidden border border-border">
          <InteractiveMap
            center={mapCenter}
            selectedZoneId={selectedZone}
            onZoneSelect={handleZoneSelect}
            className="h-full"
          />
        </div>
      </GoogleMapsProvider>

      {/* Zone List Header with Add Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            {isLoading ? 'Loading...' : `${filteredZones.length} Areas`}
          </h3>
          <ZoneSubmissionForm onSuccess={refetchZones} />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredZones.map((zone) => {
              const config = statusConfig[zone.powerStatus as keyof typeof statusConfig] || statusConfig.unknown;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleZoneSelect(zone.id)}
                  className={cn(
                    "w-full card-nepa flex items-center justify-between hover:shadow-soft transition-all cursor-pointer text-left",
                    selectedZone === zone.id && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                      zone.powerStatus === 'on' ? 'bg-success/10' : 
                      zone.powerStatus === 'off' ? 'bg-danger/10' : 
                      'bg-warning/10'
                    )}>
                      {config.emoji}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground">
                        {zone.display_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {zone.buddyCount} buddies • {getLastUpdateText(zone.lastUpdate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-display font-semibold',
                    zone.powerStatus === 'on' ? 'bg-success/10 text-success' :
                    zone.powerStatus === 'off' ? 'bg-danger/10 text-danger' :
                    'bg-warning/10 text-warning-foreground'
                  )}>
                    {config.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen;
