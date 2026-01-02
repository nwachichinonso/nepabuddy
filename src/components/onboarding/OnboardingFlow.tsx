import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import NepaBuddyMascot from '../mascot/NepaBuddyMascot';
import NepaButton from '../ui/NepaButton';
import { MapPin, Bell, Shield, Zap, Users, Download } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useZones } from '@/hooks/useZones';
import { usePWA } from '@/hooks/usePWA';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OnboardingStep {
  id: number;
  mascotMood: 'happy' | 'thinking' | 'celebrating';
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  action?: () => Promise<void> | void;
  showZoneSelect?: boolean;
  showInstall?: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  
  const { requestLocation, setManualZone, permissionStatus } = useUserLocation();
  const { zones, loading: zonesLoading } = useZones();
  const { isInstallable, installApp } = usePWA();

  const handleLocationRequest = async () => {
    setIsLoading(true);
    try {
      await requestLocation();
    } catch (err) {
      console.log('Location permission denied, user can select manually');
    }
    setIsLoading(false);
  };

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setManualZone(zoneId);
  };

  const handleInstall = async () => {
    if (isInstallable) {
      await installApp();
    }
  };

  const handleNotificationRequest = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 1,
      mascotMood: 'happy',
      icon: <Zap className="w-8 h-8" />,
      title: 'Ehen! Welcome my guy! 👋',
      description: 'I be NEPA Buddy — your Lagos light watchdog! I go quietly check when your phone dey charge so we fit tell everybody for estate/street when Disco do their thing 😏',
      buttonText: 'Make we start!',
    },
    {
      id: 2,
      mascotMood: 'thinking',
      icon: <Shield className="w-8 h-8" />,
      title: 'No wahala at all! 🔒',
      description: '100% anonymous! We no know your name, email, or anything personal. We only know say "one person dey charge for Lekki." That na all! Your privacy dey very safe with us.',
      buttonText: 'I trust you!',
    },
    {
      id: 3,
      mascotMood: 'thinking',
      icon: <MapPin className="w-8 h-8" />,
      title: 'Where you dey? 📍',
      description: 'We need small location permission to group people for same Lekki / Surulere / Mainland / Ikeja. No worry — we no save exact address, just the general area (~200m).',
      buttonText: permissionStatus === 'granted' ? 'Location set! Continue' : 'Allow Location',
      action: handleLocationRequest,
      showZoneSelect: true,
    },
    {
      id: 4,
      mascotMood: 'happy',
      icon: <Bell className="w-8 h-8" />,
      title: 'Stay Updated! 🔔',
      description: 'When light go or return, I go send you funny, warm message. No spam — only important power updates for your area!',
      buttonText: 'Allow Notifications',
      action: handleNotificationRequest,
    },
    {
      id: 5,
      mascotMood: 'celebrating',
      icon: <Users className="w-8 h-8" />,
      title: 'You don join the squad! 🎉',
      description: 'No matter how NEPA/Disco misbehave, we dey shine together! Thank you for being part of 127,000+ Lagosians watching power together. 🇳🇬⚡️',
      buttonText: "Let's go!",
      showInstall: true,
    },
  ];

  const step = steps[currentStep];

  const handleNext = async () => {
    if (step.action && !isLoading) {
      setIsLoading(true);
      try {
        await step.action();
      } catch (err) {
        console.log('Action failed, continuing anyway');
      }
      setIsLoading(false);
    }

    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Progress bar */}
      <div className="safe-top px-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  index <= currentStep ? 'w-8 bg-primary' : 'w-4 bg-muted'
                )}
              />
            ))}
          </div>
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground font-display hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 flex flex-col items-center justify-center px-6 transition-all duration-200 overflow-y-auto',
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        )}
      >
        {/* Icon badge */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
          {step.icon}
        </div>

        {/* Mascot */}
        <div className="mb-8">
          <NepaBuddyMascot mood={step.mascotMood} size="xl" />
        </div>

        {/* Text */}
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-2xl font-display font-bold text-foreground">
            {step.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Zone selector for location step */}
        {step.showZoneSelect && (
          <div className="w-full max-w-sm mt-6 space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Or select your area manually:
            </p>
            <Select value={selectedZoneId} onValueChange={handleZoneSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your area..." />
              </SelectTrigger>
              <SelectContent>
                {!zonesLoading && zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Install button for final step */}
        {step.showInstall && isInstallable && (
          <div className="mt-6">
            <NepaButton
              onClick={handleInstall}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Add to Home Screen
            </NepaButton>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 safe-bottom space-y-4">
        <NepaButton
          onClick={handleNext}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : step.buttonText}
        </NepaButton>

        {/* Step indicator text */}
        <p className="text-center text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 ankara-pattern opacity-5" />
      </div>
    </div>
  );
};

export default OnboardingFlow;
