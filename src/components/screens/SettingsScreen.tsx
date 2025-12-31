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
  Star
} from 'lucide-react';
import NepaBuddyMascot from '../mascot/NepaBuddyMascot';

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'link';
  value?: boolean | string;
}

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    monitoring: true,
    notifications: true,
    darkMode: false,
    pidginMode: true,
    batteryOptimization: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Profile Card */}
      <div className="card-nepa flex items-center gap-4">
        <NepaBuddyMascot mood="happy" size="md" showAccessory={false} />
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg text-foreground">
            NEPA Buddy User
          </h3>
          <p className="text-sm text-muted-foreground">
            Lekki Phase 1 • Free Plan
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
            checked={settings.monitoring}
            onChange={() => toggleSetting('monitoring')}
          />
          <SettingToggle
            icon={<Smartphone className="w-5 h-5" />}
            label="Battery Optimization"
            description="Ultra-low battery usage mode"
            checked={settings.batteryOptimization}
            onChange={() => toggleSetting('batteryOptimization')}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingToggle
            icon={<Bell className="w-5 h-5" />}
            label="Push Notifications"
            description="Get alerts when power changes"
            checked={settings.notifications}
            onChange={() => toggleSetting('notifications')}
          />
          <SettingToggle
            icon={<MessageSquare className="w-5 h-5" />}
            label="Pidgin Mode"
            description="Full Naija-style notifications 😎"
            checked={settings.pidginMode}
            onChange={() => toggleSetting('pidginMode')}
          />
        </SettingsSection>

        {/* Location */}
        <SettingsSection title="Location">
          <SettingLink
            icon={<MapPin className="w-5 h-5" />}
            label="Your Area"
            value="Lekki Phase 1"
          />
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
            checked={settings.darkMode}
            onChange={() => toggleSetting('darkMode')}
          />
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
          <SettingLink
            icon={<Share2 className="w-5 h-5" />}
            label="Share with Friends"
          />
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
