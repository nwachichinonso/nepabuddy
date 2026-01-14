import React, { useState, useMemo } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface LagosArea {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

export const LAGOS_AREAS: LagosArea[] = [
  { id: 'lekki-phase-1', name: 'Lekki Phase 1', displayName: 'Lekki Phase 1', lat: 6.4378, lng: 3.4703 },
  { id: 'victoria-island', name: 'Victoria Island', displayName: 'Victoria Island', lat: 6.4281, lng: 3.4219 },
  { id: 'ikeja', name: 'Ikeja', displayName: 'Ikeja', lat: 6.6018, lng: 3.3515 },
  { id: 'ikeja-gra', name: 'Ikeja GRA', displayName: 'Ikeja GRA', lat: 6.5833, lng: 3.3500 },
  { id: 'surulere', name: 'Surulere', displayName: 'Surulere', lat: 6.5059, lng: 3.3509 },
  { id: 'yaba', name: 'Yaba', displayName: 'Yaba', lat: 6.5175, lng: 3.3753 },
  { id: 'ajah', name: 'Ajah', displayName: 'Ajah', lat: 6.4676, lng: 3.5668 },
  { id: 'festac', name: 'Festac Town', displayName: 'Festac Town', lat: 6.4656, lng: 3.2833 },
  { id: 'ikoyi', name: 'Ikoyi', displayName: 'Ikoyi', lat: 6.4505, lng: 3.4344 },
  { id: 'marina', name: 'Marina', displayName: 'Lagos Marina', lat: 6.4474, lng: 3.3903 },
  { id: 'maryland', name: 'Maryland', displayName: 'Maryland', lat: 6.5692, lng: 3.3631 },
  { id: 'ojodu', name: 'Ojodu Berger', displayName: 'Ojodu Berger', lat: 6.6333, lng: 3.3667 },
  { id: 'gbagada', name: 'Gbagada', displayName: 'Gbagada', lat: 6.5547, lng: 3.3883 },
  { id: 'magodo', name: 'Magodo', displayName: 'Magodo', lat: 6.6167, lng: 3.3833 },
  { id: 'apapa', name: 'Apapa', displayName: 'Apapa', lat: 6.4475, lng: 3.3592 },
  { id: 'oshodi', name: 'Oshodi', displayName: 'Oshodi', lat: 6.5548, lng: 3.3417 },
  { id: 'agege', name: 'Agege', displayName: 'Agege', lat: 6.6200, lng: 3.3200 },
  { id: 'mushin', name: 'Mushin', displayName: 'Mushin', lat: 6.5351, lng: 3.3486 },
  // Additional common areas/streets
  { id: 'admiralty-way', name: 'Admiralty Way', displayName: 'Admiralty Way, Lekki', lat: 6.4380, lng: 3.4710 },
  { id: 'eko-atlantic', name: 'Eko Atlantic', displayName: 'Eko Atlantic City', lat: 6.4150, lng: 3.4100 },
  { id: 'banana-island', name: 'Banana Island', displayName: 'Banana Island', lat: 6.4600, lng: 3.4400 },
  { id: 'oniru', name: 'Oniru', displayName: 'Oniru, VI', lat: 6.4350, lng: 3.4450 },
  { id: 'chevron', name: 'Chevron', displayName: 'Chevron, Lekki', lat: 6.4550, lng: 3.5100 },
  { id: 'sangotedo', name: 'Sangotedo', displayName: 'Sangotedo', lat: 6.4600, lng: 3.5400 },
  { id: 'ikate', name: 'Ikate', displayName: 'Ikate, Lekki', lat: 6.4450, lng: 3.4800 },
  { id: 'osapa', name: 'Osapa London', displayName: 'Osapa London', lat: 6.4500, lng: 3.5000 },
  { id: 'agungi', name: 'Agungi', displayName: 'Agungi, Lekki', lat: 6.4480, lng: 3.4950 },
  { id: 'jakande', name: 'Jakande', displayName: 'Jakande, Lekki', lat: 6.4400, lng: 3.4850 },
  { id: 'allen-avenue', name: 'Allen Avenue', displayName: 'Allen Avenue, Ikeja', lat: 6.5950, lng: 3.3480 },
  { id: 'opebi', name: 'Opebi', displayName: 'Opebi, Ikeja', lat: 6.5900, lng: 3.3600 },
  { id: 'oregun', name: 'Oregun', displayName: 'Oregun', lat: 6.5800, lng: 3.3700 },
  { id: 'anthony', name: 'Anthony', displayName: 'Anthony Village', lat: 6.5600, lng: 3.3700 },
  { id: 'ketu', name: 'Ketu', displayName: 'Ketu', lat: 6.5800, lng: 3.3900 },
  { id: 'ilupeju', name: 'Ilupeju', displayName: 'Ilupeju', lat: 6.5500, lng: 3.3550 },
  { id: 'omole', name: 'Omole Phase 1', displayName: 'Omole Phase 1', lat: 6.6100, lng: 3.3600 },
  { id: 'ogba', name: 'Ogba', displayName: 'Ogba', lat: 6.6000, lng: 3.3400 },
];

interface ManualZoneSelectorProps {
  onSelect: (area: LagosArea) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

export const ManualZoneSelector: React.FC<ManualZoneSelectorProps> = ({
  onSelect,
  placeholder = 'Type your address or area...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Filter areas based on input
  const filteredAreas = useMemo(() => {
    if (!inputValue.trim()) return LAGOS_AREAS.slice(0, 10); // Show first 10 when empty
    
    const searchTerms = inputValue.toLowerCase().split(' ').filter(Boolean);
    
    return LAGOS_AREAS.filter(area => {
      const areaText = `${area.name} ${area.displayName}`.toLowerCase();
      return searchTerms.every(term => areaText.includes(term));
    }).slice(0, 15);
  }, [inputValue]);

  const handleSelect = (area: LagosArea) => {
    setInputValue(area.displayName);
    setIsOpen(false);
    onSelect(area);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const clearInput = () => {
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay closing to allow click on option
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-card border-border"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown with suggestions */}
      {isOpen && (isFocused || filteredAreas.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredAreas.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border bg-muted/50">
                {inputValue ? `Matching "${inputValue}"` : 'Popular areas in Lagos'}
              </div>
              {filteredAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelect(area)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {area.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lagos, Nigeria
                    </p>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              <p>No matching area found</p>
              <p className="text-xs mt-1">Try a different name or select from suggestions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualZoneSelector;
