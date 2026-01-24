import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Zap, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIndications } from '@/hooks/useIndications';
import { LocationInput } from './LocationInput';
import { IndicationForm } from './IndicationForm';
import { ComplaintForm } from './ComplaintForm';
import { StatusDisplay } from './StatusDisplay';
import { toast } from '@/hooks/use-toast';

export const Dashboard: React.FC = () => {
  const { user, profile, signOut, updateDefaultLocation, refreshProfile } = useAuth();
  const { fetchTodayIndications, todayIndications, getRemainingIndications, canSubmitComplaint, DAILY_LIMIT } = useIndications();
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (profile?.default_location) {
      setLocation(profile.default_location);
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchTodayIndications(user.id);
    }
  }, [user, fetchTodayIndications]);

  const todayCount = todayIndications.length;
  const remaining = getRemainingIndications(todayCount);
  const canComplain = canSubmitComplaint(todayCount);

  const handleSaveLocation = async () => {
    if (location.trim()) {
      const { error } = await updateDefaultLocation(location.trim());
      if (!error) {
        toast({
          title: "Location saved! 📍",
          description: "Your default location don save.",
        });
      }
    }
  };

  const handleIndicationSuccess = () => {
    if (user) {
      fetchTodayIndications(user.id);
      refreshProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "See you next time! 👋",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-lg">NEPA Buddy 💡</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {profile?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs font-medium text-primary">
                {todayCount}/{DAILY_LIMIT} today
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {todayCount === 0 ? 'Good morning! ☀️' : todayCount >= DAILY_LIMIT ? 'Omo, you try! 🎉🏆' : 'Continue the hustle! 💪'}
          </h1>
          <p className="text-muted-foreground">
            {todayCount === 0 
              ? 'Abeg start your daily power status indications 🔌' 
              : todayCount >= DAILY_LIMIT 
              ? 'You don finish your daily task! Come back tomorrow, champion! 🌟' 
              : `${remaining} more indication${remaining !== 1 ? 's' : ''} remain before you fit complain ⚡`}
          </p>
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Location 📍</label>
          <LocationInput
            value={location}
            onChange={setLocation}
            showSaveButton={location !== profile?.default_location && !!location}
            onSave={handleSaveLocation}
          />
        </div>

        {/* Indication Form */}
        <IndicationForm
          userId={user.id}
          location={location}
          todayCount={todayCount}
          onSuccess={handleIndicationSuccess}
        />

        {/* Status Check */}
        <StatusDisplay />

        {/* Complaint Form */}
        <ComplaintForm
          userId={user.id}
          location={location}
          isLocked={!canComplain}
          remainingIndications={remaining}
          onSuccess={handleIndicationSuccess}
        />

        {/* Today's Indications */}
        {todayIndications.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Your indications today 📋
            </h3>
            <div className="space-y-2">
              {todayIndications.map((ind) => (
                <div
                  key={ind.id}
                  className={`p-3 rounded-lg flex items-center gap-3 ${
                    ind.status 
                      ? 'bg-green-50 dark:bg-green-950/20' 
                      : 'bg-red-50 dark:bg-red-950/20'
                  }`}
                >
                  <span className="text-xl">{ind.status ? '⚡' : '🔌'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {ind.status ? 'Light Dey' : 'No Light'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ind.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
