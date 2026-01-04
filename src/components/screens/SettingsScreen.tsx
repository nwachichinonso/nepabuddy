import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  MapPin, 
  Shield, 
  Moon, 
  Globe, 
  Battery, 
  Info, 
  ChevronRight,
  Smartphone,
  MessageSquare,
  Share2,
  Star,
  Trash2,
  Search,
  Loader2
} from 'lucide-react';
import NepaBuddyMascot from '../mascot/NepaBuddyMascot';
import { GoogleMapsProvider } from '../map/GoogleMapsProvider';
import { PlacesAutocomplete } from '../search/PlacesAutocomplete';
import { useAppStore } from '@/store/useAppStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useZones, findNearestZone } from '@/hooks/useZones';
import { useToast } from '@/hooks/use-toast';

export const SettingsScreen: React.FC = () => {
  const { toast } = useToast();
  const { userZone, setManualZone } = useUserLocation();
  const { zones } = useZones();
  const [showZoneSearch, setShowZoneSearch] = useState(false);
  
  const {
    darkMode,
    toggleDarkMode,
    pidginMode,
    setPidginMode,
    monitoringEnabled,
    setMonitoringEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    clearDeviceData,
    incrementMascotTaps,
  } = useAppStore();

  const handleZoneSelect = (place: { placeId: string; name: string; lat: number; lng: number }) => {
    const nearestZone = findNearestZone(place.lat, place.lng, zones);
    if (nearestZone) {
      setManualZone(nearestZone.id);
      setShowZoneSearch(false);
      toast({
        title: "Zone Updated! 📍",
        description: `Now tracking ${nearestZone.display_name}`,
      });
    }
  };

  const handleClearData = () => {
    clearDeviceData();
    toast({
      title: "Data Cleared! 🧹",
      description: "Your local data don delete. Fresh start!",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'NEPA Buddy - Lagos Power Tracker',
      text: 'We dey watch NEPA/Disco together! Know when light go, know when e return. Join your squad! ⚡️🇳🇬',
      url: 'https://nepabuddy.lovable.app',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link Copied! 📋",
        description: "Share am with your squad!",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Profile Card */}
      <div className="card-nepa flex items-center gap-4">
        <button onClick={incrementMascotTaps} className="shrink-0">
          <NepaBuddyMascot mood="happy" size="md" showAccessory={false} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-lg text-foreground">
            NEPA Buddy User
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {userZone?.displayName || 'Lagos'} • Free Plan
          </p>
          <button className="mt-2 text-xs text-primary font-display font-semibold">
            Upgrade to Premium →
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Monitoring */}
        <SettingsSection title="Monitoring">
          <SettingToggle
            icon={<Battery className="w-5 h-5" />}
            label="Power Monitoring"
            description="Track charging state in background"
            checked={monitoringEnabled}
            onChange={() => setMonitoringEnabled(!monitoringEnabled)}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingToggle
            icon={<Bell className="w-5 h-5" />}
            label="Push Notifications"
            description="Get alerts when power changes"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
          <SettingToggle
            icon={<MessageSquare className="w-5 h-5" />}
            label="Pidgin Mode"
            description="Full Naija-style notifications 😎"
            checked={pidginMode}
            onChange={() => setPidginMode(!pidginMode)}
          />
        </SettingsSection>

        {/* Location */}
        <SettingsSection title="Location">
          <button 
            onClick={() => setShowZoneSearch(!showZoneSearch)}
            className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground"><MapPin className="w-5 h-5" /></div>
              <div className="text-left">
                <p className="font-display font-medium text-foreground">Your Area</p>
                <p className="text-xs text-muted-foreground">Tap to search & change</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">{userZone?.displayName || 'Not set'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
          
          {showZoneSearch && (
            <div className="px-4 pb-4">
              <GoogleMapsProvider>
                <PlacesAutocomplete
                  onPlaceSelect={handleZoneSelect}
                  placeholder="Search your area..."
                />
              </GoogleMapsProvider>
            </div>
          )}

          <SettingLink
            icon={<Globe className="w-5 h-5" />}
            label="Accuracy Level"
            value="Estate (~200m)"
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingToggle
            icon={<Moon className="w-5 h-5" />}
            label="Dark Mode"
            description="Easy on the eyes at night"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
        </SettingsSection>

        {/* Data & Privacy */}
        <SettingsSection title="Data & Privacy">
          <button 
            onClick={handleClearData}
            className="flex items-center justify-between p-4 w-full hover:bg-danger/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-danger"><Trash2 className="w-5 h-5" /></div>
              <div className="text-left">
                <p className="font-display font-medium text-danger">Clear My Data</p>
                <p className="text-xs text-muted-foreground">Delete local device ID & searches</p>
              </div>
            </div>
          </button>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingLink
            icon={<Shield className="w-5 h-5" />}
            label="Privacy Policy"
          />
          <SettingLink
            icon={<Info className="w-5 h-5" />}
            label="About NEPA Buddy"
            value="v1.0.0"
          />
          <button 
            onClick={handleShare}
            className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground"><Share2 className="w-5 h-5" /></div>
              <p className="font-display font-medium text-foreground">Share with Friends</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <SettingLink
            icon={<Star className="w-5 h-5" />}
            label="Rate Us"
          />
        </SettingsSection>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 pt-4">
        <p className="text-xs text-muted-foreground">
          Made with ❤️ for Lagos, Nigeria
        </p>
        <p className="text-xs text-muted-foreground">
          © 2025 NEPA Buddy • No wahala, just light! ⚡️
        </p>
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide px-1">
      {title}
    </h3>
    <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
      {children}
    </div>
  </div>
);

interface SettingToggleProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  icon,
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="font-display font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    <button
      onClick={onChange}
      className={cn(
        'relative w-12 h-7 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <div
        className={cn(
          'absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  </div>
);

interface SettingLinkProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

const SettingLink: React.FC<SettingLinkProps> = ({ icon, label, value }) => (
  <button className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <p className="font-display font-medium text-foreground">{label}</p>
    </div>
    <div className="flex items-center gap-2 text-muted-foreground">
      {value && <span className="text-sm">{value}</span>}
      <ChevronRight className="w-4 h-4" />
    </div>
  </button>
);

export default SettingsScreen;
