import React, { useState, useEffect } from 'react';
import { Search, MapPin, Zap, ZapOff, Loader2, X, Home, Building, Users, Clock, Info } from 'lucide-react';
import { useZones } from '@/hooks/useZones';
import { usePowerStatus } from '@/hooks/usePowerStatus';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import haptic from '@/utils/haptic';
import { Input } from '@/components/ui/input';

interface SavedLocation {
  id: string;
  name: string;
  label: string;
  zoneId: string;
}

export const AddressPowerCheck: React.FC = () => {
  const { zones, loading: zonesLoading } = useZones();
  const { allZonesStatus } = usePowerStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [checkedLocation, setCheckedLocation] = useState<{
    name: string;
    zoneName: string;
    zoneId: string;
    status: string;
    buddyCount: number;
    confidence: string;
    lastUpdate: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    const saved = localStorage.getItem('nepa-saved-locations');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter zones based on search query
  const filteredZones = zones?.filter(zone => 
    zone.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleZoneSelect = (zone: typeof zones[0]) => {
    setIsSearching(true);
    setShowDropdown(false);
    setSearchQuery(zone.display_name);
    haptic.light();

    // Find power status for this zone
    const zoneStatus = allZonesStatus?.find(s => s.zone_id === zone.id);
    
    setTimeout(() => {
      setCheckedLocation({
        name: zone.display_name,
        zoneName: zone.name,
        zoneId: zone.id,
        status: zoneStatus?.status || 'unknown',
        buddyCount: zoneStatus?.buddy_count || 0,
        confidence: zoneStatus?.confidence || 'low',
        lastUpdate: zoneStatus?.updated_at 
          ? formatDistanceToNow(new Date(zoneStatus.updated_at), { addSuffix: true })
          : 'Unknown',
      });
      setIsSearching(false);
      haptic.medium();
    }, 300);
  };

  const saveLocation = (label: string) => {
    if (!checkedLocation) return;
    
    // Remove existing location with same label
    const filtered = savedLocations.filter(l => l.label !== label);
    
    const newLocation: SavedLocation = {
      id: crypto.randomUUID(),
      name: checkedLocation.name,
      label,
      zoneId: checkedLocation.zoneId,
    };
    
    const updated = [...filtered, newLocation];
    setSavedLocations(updated);
    localStorage.setItem('nepa-saved-locations', JSON.stringify(updated));
    haptic.success();
  };

  const checkSavedLocation = (location: SavedLocation) => {
    if (!location.zoneId) return;
    
    const zoneStatus = allZonesStatus.find(z => z.zone_id === location.zoneId);
    const zone = zones.find(z => z.id === location.zoneId);
    
    setSearchQuery(location.name);
    setCheckedLocation({
      name: location.name,
      zoneName: zone?.name || location.label,
      zoneId: location.zoneId,
      status: zoneStatus?.status || 'unknown',
      buddyCount: zoneStatus?.buddy_count || 0,
      confidence: zoneStatus?.confidence || 'low',
      lastUpdate: zoneStatus?.updated_at 
        ? formatDistanceToNow(new Date(zoneStatus.updated_at), { addSuffix: true })
        : 'Unknown',
    });
    
    haptic.light();
  };

  const removeSavedLocation = (id: string) => {
    const updated = savedLocations.filter(l => l.id !== id);
    setSavedLocations(updated);
    localStorage.setItem('nepa-saved-locations', JSON.stringify(updated));
  };

  const clearResult = () => {
    setCheckedLocation(null);
    setSearchQuery('');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'on':
        return {
          icon: Zap,
          label: 'Power Available',
          pidgin: 'Light dey! ⚡️',
          bgClass: 'bg-success/10 border-success/30',
          textClass: 'text-success',
          iconBg: 'bg-success/20',
        };
      case 'off':
        return {
          icon: ZapOff,
          label: 'No Power',
          pidgin: 'NEPA don carry light 😩',
          bgClass: 'bg-danger/10 border-danger/30',
          textClass: 'text-danger',
          iconBg: 'bg-danger/20',
        };
      case 'recovering':
        return {
          icon: Zap,
          label: 'Recovering',
          pidgin: 'E dey come back small small... ⏳',
          bgClass: 'bg-warning/10 border-warning/30',
          textClass: 'text-warning-foreground',
          iconBg: 'bg-warning/20',
        };
      default:
        return {
          icon: Zap,
          label: 'Unknown',
          pidgin: 'We no sure for now 🤷',
          bgClass: 'bg-muted border-border',
          textClass: 'text-muted-foreground',
          iconBg: 'bg-muted',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Power status is crowd-sourced from users in each area. More active users = more accurate readings.
        </p>
      </div>

      {/* Search Input */}
      <div className="card-nepa">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Check Power at Any Location</h3>
        </div>
        
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Type your area (e.g., Lekki, Ikeja, Surulere)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(e.target.value.length > 0);
                if (e.target.value.length === 0) {
                  setCheckedLocation(null);
                }
              }}
              onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={clearResult}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && filteredZones.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredZones.slice(0, 10).map((zone) => {
                const zoneStatus = allZonesStatus?.find(s => s.zone_id === zone.id);
                const statusConfig = getStatusConfig(zoneStatus?.status || 'unknown');
                
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneSelect(zone)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{zone.display_name}</p>
                        <p className="text-xs text-muted-foreground">{zone.name}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
                      zoneStatus?.status === 'on' ? 'bg-success/10 text-success' :
                      zoneStatus?.status === 'off' ? 'bg-danger/10 text-danger' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {zoneStatus?.status === 'on' ? <Zap className="w-3 h-3" /> : 
                       zoneStatus?.status === 'off' ? <ZapOff className="w-3 h-3" /> : 
                       <Zap className="w-3 h-3" />}
                      <span>
                        {zoneStatus?.status === 'on' ? 'ON' : zoneStatus?.status === 'off' ? 'OFF' : '?'}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredZones.length > 10 && (
                <p className="px-4 py-2 text-xs text-muted-foreground text-center bg-muted/30">
                  +{filteredZones.length - 10} more areas
                </p>
              )}
            </div>
          )}

          {showDropdown && searchQuery.length > 0 && filteredZones.length === 0 && !zonesLoading && (
            <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">No areas found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try: Lekki, Ikeja, Victoria Island, Surulere</p>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Check if there's power at home while you're at work 🏠➡️🏢
        </p>
      </div>

      {/* Saved Locations Quick Access */}
      {savedLocations.length > 0 && !checkedLocation && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Quick Check</p>
          <div className="flex flex-wrap gap-2">
            {savedLocations.map((location) => {
              const zoneStatus = allZonesStatus?.find(s => s.zone_id === location.zoneId);
              const statusConfig = getStatusConfig(zoneStatus?.status || 'unknown');
              
              return (
                <button
                  key={location.id}
                  onClick={() => checkSavedLocation(location)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors group",
                    statusConfig.bgClass
                  )}
                >
                  {location.label === 'Home' ? (
                    <Home className="w-4 h-4 text-primary" />
                  ) : (
                    <Building className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">{location.label}</span>
                  <div className={cn("w-2 h-2 rounded-full", 
                    zoneStatus?.status === 'on' ? 'bg-success' :
                    zoneStatus?.status === 'off' ? 'bg-danger' : 'bg-muted-foreground'
                  )} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSavedLocation(location.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-danger" />
                  </button>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="card-nepa flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Checking power status...</span>
        </div>
      )}

      {/* Result Card */}
      {checkedLocation && !isSearching && (
        <div className={cn(
          "card-nepa border-2 animate-scale-in",
          getStatusConfig(checkedLocation.status).bgClass
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-3 rounded-xl",
                getStatusConfig(checkedLocation.status).iconBg
              )}>
                {React.createElement(getStatusConfig(checkedLocation.status).icon, {
                  className: cn("w-6 h-6", getStatusConfig(checkedLocation.status).textClass)
                })}
              </div>
              <div>
                <h4 className={cn(
                  "font-display font-bold text-lg",
                  getStatusConfig(checkedLocation.status).textClass
                )}>
                  {getStatusConfig(checkedLocation.status).pidgin}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {getStatusConfig(checkedLocation.status).label}
                </p>
              </div>
            </div>
            <button
              onClick={clearResult}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{checkedLocation.buddyCount}</p>
              <p className="text-[10px] text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <Zap className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-bold capitalize">{checkedLocation.confidence}</p>
              <p className="text-[10px] text-muted-foreground">Confidence</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-bold">{checkedLocation.lastUpdate}</p>
              <p className="text-[10px] text-muted-foreground">Updated</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{checkedLocation.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Zone: {checkedLocation.zoneName}
            </div>
          </div>

          {/* Save Location Buttons */}
          {checkedLocation.zoneId && (
            <div className="flex gap-2 pt-3 border-t border-border/50">
              <button
                onClick={() => saveLocation('Home')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  savedLocations.find(l => l.label === 'Home' && l.zoneId === checkedLocation.zoneId)
                    ? "bg-success/20 text-success"
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                )}
              >
                <Home className="w-4 h-4" />
                {savedLocations.find(l => l.label === 'Home' && l.zoneId === checkedLocation.zoneId) 
                  ? '✓ Saved as Home' 
                  : 'Save as Home'}
              </button>
              <button
                onClick={() => saveLocation('Office')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  savedLocations.find(l => l.label === 'Office' && l.zoneId === checkedLocation.zoneId)
                    ? "bg-success/20 text-success"
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                )}
              >
                <Building className="w-4 h-4" />
                {savedLocations.find(l => l.label === 'Office' && l.zoneId === checkedLocation.zoneId) 
                  ? '✓ Saved as Office' 
                  : 'Save as Office'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressPowerCheck;
