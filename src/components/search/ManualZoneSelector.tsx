import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
];

interface ManualZoneSelectorProps {
  onSelect: (area: LagosArea) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

export const ManualZoneSelector: React.FC<ManualZoneSelectorProps> = ({
  onSelect,
  placeholder = 'Select your area...',
  className = '',
  value,
}) => {
  const handleValueChange = (areaId: string) => {
    const selectedArea = LAGOS_AREAS.find(a => a.id === areaId);
    if (selectedArea) {
      onSelect(selectedArea);
    }
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className={`w-full bg-card border-border ${className}`}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {LAGOS_AREAS.map((area) => (
          <SelectItem key={area.id} value={area.id}>
            {area.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ManualZoneSelector;
