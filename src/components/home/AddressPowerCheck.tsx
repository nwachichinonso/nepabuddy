import React, { useState } from 'react';
import { Search, MapPin, Zap, ZapOff, Loader2, X, Home, Building, Users } from 'lucide-react';
import { GoogleMapsProvider } from '../map/GoogleMapsProvider';
import { LocationSearch } from '../search/LocationSearch';
import { useZones, findNearestZone } from '@/hooks/useZones';
import { usePowerStatus } from '@/hooks/usePowerStatus';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import haptic from '@/utils/haptic';

interface SavedLocation {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
  zoneId?: string;
}

export const AddressPowerCheck: React.FC = () => {
  const { zones } = useZones();
  const { allZonesStatus } = usePowerStatus();
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

  const handlePlaceSelect = (place: { name: string; lat: number; lng: number; placeId?: string }) => {
    setIsSearching(true);
    haptic.light();

    // Find nearest zone to the searched address
    const nearestZone = findNearestZone(place.lat, place.lng, zones);
    
    if (nearestZone) {
      // Get power status for that zone
      const zoneStatus = allZonesStatus.find(z => z.zone_id === nearestZone.id);
      
      setCheckedLocation({
        name: place.name,
        zoneName: nearestZone.display_name,
        zoneId: nearestZone.id,
        status: zoneStatus?.status || 'unknown',
        buddyCount: zoneStatus?.buddy_count || 0,
        confidence: zoneStatus?.confidence || 'low',
        lastUpdate: zoneStatus?.updated_at 
          ? formatDistanceToNow(new Date(zoneStatus.updated_at), { addSuffix: true })
          : 'Unknown',
      });
      
      haptic.medium();
    } else {
      setCheckedLocation({
        name: place.name,
        zoneName: 'Unknown Area',
        zoneId: '',
        status: 'unknown',
        buddyCount: 0,
        confidence: 'low',
        lastUpdate: 'N/A',
      });
    }
    
    setIsSearching(false);
  };

  const saveLocation = (label: string) => {
    if (!checkedLocation) return;
    
    const newLocation: SavedLocation = {
      id: crypto.randomUUID(),
      name: checkedLocation.name,
      label,
      lat: 0, // We'd need to store these from the search
      lng: 0,
      zoneId: checkedLocation.zoneId,
    };
    
    const updated = [...savedLocations, newLocation];
    setSavedLocations(updated);
    localStorage.setItem('nepa-saved-locations', JSON.stringify(updated));
    haptic.success();
  };

  const checkSavedLocation = (location: SavedLocation) => {
    if (!location.zoneId) return;
    
    const zoneStatus = allZonesStatus.find(z => z.zone_id === location.zoneId);
    const zone = zones.find(z => z.id === location.zoneId);
    
    setCheckedLocation({
      name: location.name,
      zoneName: zone?.display_name || location.label,
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
      {/* Search Input */}
      <div className="card-nepa">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Check Power at Any Address</h3>
        </div>
        
        <GoogleMapsProvider>
          <LocationSearch
            onPlaceSelect={handlePlaceSelect}
            placeholder="Enter address (e.g., 12 Admiralty Way, Lekki)"
          />
        </GoogleMapsProvider>
        
        <p className="text-xs text-muted-foreground mt-2">
          Check if there's power at home while you're at work 🏠➡️🏢
        </p>
      </div>

      {/* Saved Locations Quick Access */}
      {savedLocations.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {savedLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => checkSavedLocation(location)}
              className="flex items-center gap-2 px-3 py-2 bg-card/50 border border-border rounded-full text-sm whitespace-nowrap hover:bg-accent transition-colors group"
            >
              {location.label === 'Home' ? (
                <Home className="w-4 h-4 text-primary" />
              ) : (
                <Building className="w-4 h-4 text-primary" />
              )}
              <span>{location.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSavedLocation(location.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-danger" />
              </button>
            </button>
          ))}
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

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{checkedLocation.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Zone: {checkedLocation.zoneName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {checkedLocation.buddyCount} buddies
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {checkedLocation.lastUpdate} • Confidence: {checkedLocation.confidence}
            </div>
          </div>

          {/* Save Location Buttons */}
          {checkedLocation.zoneId && !savedLocations.find(l => l.name === checkedLocation.name) && (
            <div className="flex gap-2 pt-3 border-t border-border/50">
              <button
                onClick={() => saveLocation('Home')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Save as Home
              </button>
              <button
                onClick={() => saveLocation('Office')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
              >
                <Building className="w-4 h-4" />
                Save as Office
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressPowerCheck;
