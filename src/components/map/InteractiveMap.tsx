import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { ZoomIn, ZoomOut, Locate, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePowerStatus } from '@/hooks/usePowerStatus';
import { useZones } from '@/hooks/useZones';
import { FallbackMap } from './FallbackMap';

interface InteractiveMapProps {
  center?: { lat: number; lng: number };
  selectedZoneId?: string | null;
  onZoneSelect?: (zoneId: string) => void;
  className?: string;
}

const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const LAGOS_CENTER = { lat: 6.5244, lng: 3.3792 };

// Check if Google Maps is available
const isGoogleMapsAvailable = () => {
  return typeof google !== 'undefined' && typeof google.maps !== 'undefined';
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center = LAGOS_CENTER,
  selectedZoneId,
  onZoneSelect,
  className,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapsAvailable, setMapsAvailable] = useState(false);
  
  const { zones } = useZones();
  const { allZonesStatus } = usePowerStatus();

  // Check if Google Maps loaded
  useEffect(() => {
    const checkMaps = () => {
      if (isGoogleMapsAvailable()) {
        setMapsAvailable(true);
      }
    };
    checkMaps();
    // Also check after a short delay in case it's still loading
    const timer = setTimeout(checkMaps, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setMapsAvailable(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(14);
    }
  }, [map, center]);

  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) - 1);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map?.panTo(pos);
        map?.setZoom(15);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on': return '#008751'; // Nigerian green
      case 'off': return '#DC2626'; // Red
      case 'recovering': return '#FDD835'; // Gold
      default: return '#9CA3AF'; // Gray
    }
  };

  const getStatusOpacity = (confidence: string) => {
    switch (confidence) {
      case 'high': return 0.5;
      case 'medium': return 0.35;
      default: return 0.2;
    }
  };

  // Merge zones with their power status
  const zonesWithStatus = zones.map(zone => {
    const status = allZonesStatus?.find(s => s.zone_id === zone.id);
    return {
      ...zone,
      powerStatus: status?.status || 'unknown',
      confidence: status?.confidence || 'low',
      buddyCount: status?.buddy_count || 0,
      lastUpdate: status?.updated_at,
    };
  });

  // If Google Maps is not available, show fallback
  if (!mapsAvailable) {
    return (
      <FallbackMap
        selectedZoneId={selectedZoneId}
        onZoneSelect={onZoneSelect}
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        }}
      >
        {/* Zone pin markers */}
        {zonesWithStatus.map((zone) => (
          <React.Fragment key={zone.id}>
            {/* Pin marker with status color */}
            <Marker
              position={{ lat: Number(zone.latitude), lng: Number(zone.longitude) }}
              onClick={() => {
                setSelectedMarker(zone.id);
                onZoneSelect?.(zone.id);
              }}
              icon={{
                path: 'M12 0C7.31 0 3.5 3.81 3.5 8.5C3.5 14.88 12 24 12 24S20.5 14.88 20.5 8.5C20.5 3.81 16.69 0 12 0ZM12 11.5C10.34 11.5 9 10.16 9 8.5C9 6.84 10.34 5.5 12 5.5C13.66 5.5 15 6.84 15 8.5C15 10.16 13.66 11.5 12 11.5Z',
                fillColor: getStatusColor(zone.powerStatus),
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 1.5,
                scale: 1.5,
                anchor: new google.maps.Point(12, 24),
              }}
              title={`${zone.display_name} - ${zone.powerStatus}`}
            />

            {/* Info window */}
            {selectedMarker === zone.id && (
              <InfoWindow
                position={{ lat: Number(zone.latitude), lng: Number(zone.longitude) }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 min-w-[150px]">
                  <h4 className="font-bold text-sm mb-1">{zone.display_name}</h4>
                  <div className="space-y-1 text-xs">
                    <p className="flex items-center gap-1">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        zone.powerStatus === 'on' ? 'bg-green-500' :
                        zone.powerStatus === 'off' ? 'bg-red-500' :
                        'bg-yellow-500'
                      )} />
                      {zone.powerStatus === 'on' ? 'Power ON ⚡' :
                       zone.powerStatus === 'off' ? 'Power OFF 🔌' :
                       zone.powerStatus === 'recovering' ? 'Recovering ⚠️' :
                       'Unknown'}
                    </p>
                    <p className="text-gray-600">{zone.buddyCount} buddies active</p>
                    <p className="text-gray-500">Confidence: {zone.confidence}</p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>

      {/* Map controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2.5 bg-card rounded-xl border border-border shadow-soft hover:bg-muted transition-colors"
        >
          <ZoomIn className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 bg-card rounded-xl border border-border shadow-soft hover:bg-muted transition-colors"
        >
          <ZoomOut className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleLocate}
          disabled={isLocating}
          className="p-2.5 bg-card rounded-xl border border-border shadow-soft hover:bg-muted transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Locate className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute left-3 bottom-3 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-soft p-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-foreground">Power ON</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-foreground">Power OFF</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-foreground">Recovering</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
