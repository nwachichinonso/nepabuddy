import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: {
    placeId: string;
    name: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = "Search your area in Lagos...",
  className,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  
  const { recentSearches, addRecentSearch } = useAppStore();

  // Initialize Google Places services
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    autocompleteService.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'ng' },
        // Lagos bounds
        locationBias: {
          center: { lat: 6.5244, lng: 3.3792 },
          radius: 50000, // 50km radius around Lagos
        },
        types: ['geocode', 'establishment'],
      },
      (results, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results.slice(0, 5));
        } else {
          setPredictions([]);
        }
      }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchPredictions(value);
    }, 300);
  };

  const handleSelectPrediction = useCallback((prediction: Prediction) => {
    if (!placesService.current) return;

    setIsLoading(true);
    
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address', 'name'],
      },
      (place, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const result = {
            placeId: prediction.place_id,
            name: prediction.structured_formatting.main_text,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          
          // Add to recent searches
          addRecentSearch({
            ...result,
            timestamp: Date.now(),
          });
          
          onPlaceSelect(result);
          setQuery(prediction.structured_formatting.main_text);
          setShowDropdown(false);
        }
      }
    );
  }, [onPlaceSelect, addRecentSearch]);

  const handleSelectRecent = (search: typeof recentSearches[0]) => {
    onPlaceSelect({
      placeId: search.placeId,
      name: search.name,
      lat: search.lat,
      lng: search.lng,
    });
    setQuery(search.name);
    setShowDropdown(false);
  };

  const clearQuery = () => {
    setQuery('');
    setPredictions([]);
    inputRef.current?.focus();
  };

  const showRecent = query.length === 0 && recentSearches.length > 0;
  const showPredictions = predictions.length > 0;
  const shouldShowDropdown = showDropdown && isFocused && (showRecent || showPredictions || isLoading);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => {
            // Delay to allow click on dropdown
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full pl-12 pr-10 py-4 bg-card border-2 border-border rounded-2xl",
            "font-body text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200",
            isFocused && "border-primary shadow-soft"
          )}
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-card overflow-hidden z-50 animate-fade-in">
          {/* Loading state */}
          {isLoading && predictions.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {/* Recent searches */}
          {showRecent && !isLoading && (
            <>
              <div className="px-4 py-2 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide bg-muted/50">
                Recent Searches
              </div>
              {recentSearches.map((search) => (
                <button
                  key={search.placeId}
                  onClick={() => handleSelectRecent(search)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-body text-foreground truncate">{search.name}</span>
                </button>
              ))}
            </>
          )}

          {/* Predictions */}
          {showPredictions && !isLoading && (
            <>
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handleSelectPrediction(prediction)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display font-medium text-foreground truncate">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* No results */}
          {query.length >= 2 && !isLoading && predictions.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No areas found. Try "Lekki" or "Ikeja"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
