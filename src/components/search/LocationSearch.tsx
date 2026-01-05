import React, { useState, useEffect } from 'react';
import PlacesAutocomplete from './PlacesAutocomplete';
import ManualZoneSelector, { LagosArea } from './ManualZoneSelector';
import { AlertCircle } from 'lucide-react';

interface LocationSearchProps {
  onPlaceSelect: (result: { name: string; lat: number; lng: number; placeId?: string }) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onPlaceSelect,
  placeholder = 'Search your area in Lagos...',
  className = '',
  autoFocus = false,
}) => {
  const [usesFallback, setUsesFallback] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  useEffect(() => {
    // Check if API key is missing or empty
    if (!apiKey || apiKey === '' || apiKey === 'undefined') {
      setUsesFallback(true);
    }
  }, [apiKey]);

  const handleManualSelect = (area: LagosArea) => {
    onPlaceSelect({
      name: area.displayName,
      lat: area.lat,
      lng: area.lng,
      placeId: area.id,
    });
  };

  if (usesFallback) {
    return (
      <div className={`space-y-2 ${className}`}>
        <ManualZoneSelector
          onSelect={handleManualSelect}
          placeholder={placeholder}
        />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>Using manual area selection</span>
        </div>
      </div>
    );
  }

  return (
    <PlacesAutocomplete
      onPlaceSelect={onPlaceSelect}
      placeholder={placeholder}
      className={className}
      autoFocus={autoFocus}
    />
  );
};

export default LocationSearch;
