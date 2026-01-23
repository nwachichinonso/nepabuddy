import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Save, X } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSaveButton?: boolean;
  onSave?: () => void;
  disabled?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your location (e.g., Sangotedo, Monastery Road)",
  showSaveButton = false,
  onSave,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={disabled}
        />
        {localValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {showSaveButton && localValue && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSave}
          className="w-full"
          disabled={disabled}
        >
          <Save className="w-4 h-4 mr-2" />
          Save as my default location
        </Button>
      )}
    </div>
  );
};
