import React, { useState } from 'react';
import { MapPin, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Generate a simple geohash prefix from coordinates
function generateGeohash(lat: number, lon: number): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let hash = '';
  let minLat = -90, maxLat = 90;
  let minLon = -180, maxLon = 180;
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (hash.length < 6) {
    if (isEven) {
      const midLon = (minLon + maxLon) / 2;
      if (lon > midLon) {
        ch |= 1 << (4 - bit);
        minLon = midLon;
      } else {
        maxLon = midLon;
      }
    } else {
      const midLat = (minLat + maxLat) / 2;
      if (lat > midLat) {
        ch |= 1 << (4 - bit);
        minLat = midLat;
      } else {
        maxLat = midLat;
      }
    }
    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      hash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

// Convert name to a clean zone name
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

interface ZoneSubmissionFormProps {
  onSuccess?: () => void;
}

export const ZoneSubmissionForm: React.FC<ZoneSubmissionFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { deviceHash } = useAppStore();

  const resetForm = () => {
    setDisplayName('');
    setLatitude('');
    setLongitude('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setIsLocating(false);
        toast.success('Location captured!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Could not get your location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Please enter an area name');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid coordinates or use current location');
      return;
    }

    // Validate Lagos area bounds
    if (lat < 6.0 || lat > 7.0 || lng < 2.5 || lng > 4.5) {
      toast.error('Location must be within Lagos area');
      return;
    }

    setIsSubmitting(true);

    try {
      const zoneName = sanitizeName(displayName);
      const geohash = generateGeohash(lat, lng);

      // Check for duplicates
      const { data: existing } = await supabase
        .from('zones')
        .select('id')
        .eq('name', zoneName)
        .maybeSingle();

      if (existing) {
        toast.error('This area already exists in our database');
        setIsSubmitting(false);
        return;
      }

      // Insert new zone
      const { data: newZone, error } = await supabase
        .from('zones')
        .insert({
          name: zoneName,
          display_name: displayName.trim(),
          latitude: lat,
          longitude: lng,
          geohash_prefix: geohash,
          source: 'user',
          submitted_at: new Date().toISOString(),
          submitted_by: deviceHash || 'anonymous',
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial power status entry
      if (newZone) {
        await supabase.from('zone_power_status').insert({
          zone_id: newZone.id,
          status: 'unknown',
          confidence: 'low',
          buddy_count: 0,
          plugged_count: 0,
          unplugged_count: 0,
        });
      }

      toast.success('Area added successfully! 🎉');
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting zone:', error);
      toast.error('Failed to add area. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Area
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Add New Area
          </DialogTitle>
          <DialogDescription>
            Can't find your area? Add it to help others track power in your neighborhood.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Area/Neighborhood Name</Label>
            <Input
              id="displayName"
              placeholder="e.g., Magodo Phase 2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="6.5244"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="3.3792"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2"
            onClick={useCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Use My Current Location
              </>
            )}
          </Button>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add Area
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ZoneSubmissionForm;
