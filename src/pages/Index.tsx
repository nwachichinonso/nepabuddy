import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import HomeScreen from '@/components/screens/HomeScreen';
import MapScreen from '@/components/screens/MapScreen';
import HistoryScreen from '@/components/screens/HistoryScreen';
import PremiumScreen from '@/components/screens/PremiumScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import FuelPriceCard from '@/components/fuel/FuelPriceCard';
import OfficialNotices from '@/components/notices/OfficialNotices';
import { PowerStatus } from '@/components/home/StatusCard';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PowerStatus>('on');

  // Check if user has completed onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('nepa-buddy-onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('nepa-buddy-onboarded', 'true');
    setShowOnboarding(false);
  };

  // Demo: cycle through statuses
  useEffect(() => {
    const statuses: PowerStatus[] = ['on', 'off', 'recovering', 'unknown'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % statuses.length;
      setCurrentStatus(statuses[index]);
    }, 10000); // Change every 10 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <HomeScreen currentStatus={currentStatus} />
            <FuelPriceCard />
            <OfficialNotices />
          </div>
        );
      case 'map':
        return <MapScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'premium':
        return <PremiumScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen currentStatus={currentStatus} />;
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-lg mx-auto px-4 py-4 pb-28">
        {renderScreen()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
