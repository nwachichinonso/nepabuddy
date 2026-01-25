import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Dashboard } from '@/components/simplified/Dashboard';
import HistoryScreen from '@/components/screens/HistoryScreen';
import PremiumScreen from '@/components/screens/PremiumScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import { Loader2, Home, Clock, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'premium', label: 'Premium', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SimplifiedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading NEPA Buddy... ⚡</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'history':
        return <HistoryScreen />;
      case 'premium':
        return <PremiumScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {renderScreen()}
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-50">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-xl transition-all duration-300',
                    isActive && 'bg-primary/10'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    isActive && 'font-semibold'
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-0.5 w-8 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SimplifiedApp;
