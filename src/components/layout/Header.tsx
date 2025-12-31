import React from 'react';
import { Bell, Menu } from 'lucide-react';
import NepaBuddyMascot from '../mascot/NepaBuddyMascot';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 safe-top">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <NepaBuddyMascot mood="happy" size="sm" showAccessory={false} />
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                NEPA Buddy
              </h1>
              <p className="text-xs text-muted-foreground">
                We dey watch together ⚡
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>
            <button 
              onClick={onMenuClick}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
