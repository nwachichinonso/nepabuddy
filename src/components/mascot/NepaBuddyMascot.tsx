import React from 'react';
import { cn } from '@/lib/utils';

export type MascotMood = 
  | 'happy' 
  | 'sad' 
  | 'waiting' 
  | 'celebrating' 
  | 'gen-mode' 
  | 'thinking'
  | 'sleeping';

interface NepaBuddyMascotProps {
  mood: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showAccessory?: boolean;
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 180,
  xl: 240,
};

export const NepaBuddyMascot: React.FC<NepaBuddyMascotProps> = ({
  mood,
  size = 'lg',
  className,
  showAccessory = true,
}) => {
  const pixelSize = sizeMap[size];
  
  const getMoodStyles = () => {
    switch (mood) {
      case 'happy':
        return 'animate-bulb-glow';
      case 'sad':
        return 'animate-sad-droop opacity-70';
      case 'waiting':
        return 'animate-float opacity-80';
      case 'celebrating':
        return 'animate-celebrate';
      case 'gen-mode':
        return 'animate-bulb-flicker';
      case 'thinking':
        return 'animate-wiggle';
      case 'sleeping':
        return 'opacity-50';
      default:
        return '';
    }
  };

  const getBulbColor = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return '#FDD835';
      case 'sad':
        return '#9CA3AF';
      case 'waiting':
      case 'thinking':
        return '#FBBF24';
      case 'gen-mode':
        return '#FB923C';
      case 'sleeping':
        return '#6B7280';
      default:
        return '#FDD835';
    }
  };

  const getGlowColor = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return '#FDD835';
      case 'gen-mode':
        return '#FB923C';
      default:
        return 'transparent';
    }
  };

  const renderFace = () => {
    switch (mood) {
      case 'happy':
        return (
          <>
            {/* Happy eyes */}
            <ellipse cx="35" cy="55" rx="6" ry="8" fill="#1F2937" />
            <ellipse cx="55" cy="55" rx="6" ry="8" fill="#1F2937" />
            <circle cx="37" cy="53" r="2" fill="white" />
            <circle cx="57" cy="53" r="2" fill="white" />
            {/* Happy smile */}
            <path d="M 32 68 Q 45 82 58 68" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Rosy cheeks */}
            <ellipse cx="28" cy="65" rx="5" ry="3" fill="#FCA5A5" opacity="0.6" />
            <ellipse cx="62" cy="65" rx="5" ry="3" fill="#FCA5A5" opacity="0.6" />
          </>
        );
      case 'sad':
        return (
          <>
            {/* Sad eyes */}
            <ellipse cx="35" cy="55" rx="5" ry="6" fill="#1F2937" />
            <ellipse cx="55" cy="55" rx="5" ry="6" fill="#1F2937" />
            {/* Tear */}
            <ellipse cx="62" cy="62" rx="3" ry="5" fill="#60A5FA" opacity="0.8" />
            {/* Sad mouth */}
            <path d="M 35 72 Q 45 65 55 72" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Worried eyebrows */}
            <path d="M 28 48 L 40 45" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
            <path d="M 62 48 L 50 45" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'waiting':
        return (
          <>
            {/* Sleepy/waiting eyes */}
            <path d="M 30 55 Q 35 52 40 55" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 50 55 Q 55 52 60 55" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Small O mouth */}
            <ellipse cx="45" cy="70" rx="4" ry="5" fill="#1F2937" />
          </>
        );
      case 'celebrating':
        return (
          <>
            {/* Excited eyes - stars! */}
            <path d="M 35 55 L 33 50 L 35 52 L 37 50 L 35 55 L 33 58 L 35 56 L 37 58 Z" fill="#1F2937" />
            <path d="M 55 55 L 53 50 L 55 52 L 57 50 L 55 55 L 53 58 L 55 56 L 57 58 Z" fill="#1F2937" />
            {/* Big smile */}
            <path d="M 30 65 Q 45 85 60 65" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Rosy cheeks */}
            <ellipse cx="26" cy="62" rx="6" ry="4" fill="#FCA5A5" opacity="0.7" />
            <ellipse cx="64" cy="62" rx="6" ry="4" fill="#FCA5A5" opacity="0.7" />
          </>
        );
      case 'gen-mode':
        return (
          <>
            {/* Determined eyes */}
            <ellipse cx="35" cy="55" rx="5" ry="6" fill="#1F2937" />
            <ellipse cx="55" cy="55" rx="5" ry="6" fill="#1F2937" />
            <circle cx="36" cy="53" r="1.5" fill="white" />
            <circle cx="56" cy="53" r="1.5" fill="white" />
            {/* Determined mouth */}
            <path d="M 35 70 L 55 70" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
            {/* Sweat drop */}
            <ellipse cx="68" cy="50" rx="3" ry="5" fill="#60A5FA" opacity="0.7" />
          </>
        );
      case 'thinking':
        return (
          <>
            {/* Curious eyes - one bigger */}
            <ellipse cx="35" cy="55" rx="5" ry="6" fill="#1F2937" />
            <ellipse cx="55" cy="53" rx="6" ry="7" fill="#1F2937" />
            <circle cx="36" cy="53" r="1.5" fill="white" />
            <circle cx="56" cy="51" r="2" fill="white" />
            {/* Hmm mouth */}
            <path d="M 38 70 Q 48 72 52 68" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'sleeping':
        return (
          <>
            {/* Closed eyes */}
            <path d="M 30 55 Q 35 58 40 55" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 50 55 Q 55 58 60 55" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Peaceful mouth */}
            <path d="M 40 68 Q 45 72 50 68" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Z's */}
            <text x="65" y="40" fontSize="10" fill="#1F2937" fontWeight="bold">z</text>
            <text x="72" y="32" fontSize="8" fill="#1F2937" fontWeight="bold">z</text>
            <text x="78" y="26" fontSize="6" fill="#1F2937" fontWeight="bold">z</text>
          </>
        );
      default:
        return null;
    }
  };

  const renderAccessory = () => {
    if (!showAccessory) return null;
    
    switch (mood) {
      case 'celebrating':
        return (
          <>
            {/* Party hat / Gele */}
            <path d="M 25 20 L 45 -5 L 65 20" fill="#008751" stroke="#FDD835" strokeWidth="2" />
            <circle cx="45" cy="-5" r="4" fill="#FDD835" />
          </>
        );
      case 'gen-mode':
        return (
          <>
            {/* Small generator icon */}
            <rect x="70" y="70" width="18" height="12" rx="2" fill="#4B5563" />
            <rect x="72" y="72" width="4" height="4" fill="#1F2937" />
            <path d="M 80 76 L 86 76" stroke="#9CA3AF" strokeWidth="1" />
            {/* Smoke */}
            <circle cx="75" cy="65" r="3" fill="#9CA3AF" opacity="0.6" />
            <circle cx="78" cy="60" r="2" fill="#9CA3AF" opacity="0.4" />
          </>
        );
      case 'happy':
        return (
          <>
            {/* Simple cap */}
            <ellipse cx="45" cy="15" rx="25" ry="8" fill="#008751" />
            <rect x="20" y="8" width="50" height="10" rx="5" fill="#008751" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn('relative inline-flex items-center justify-center', getMoodStyles(), className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 90 110"
        width={pixelSize}
        height={pixelSize * 1.2}
        className="drop-shadow-lg"
      >
        {/* Glow effect for happy/celebrating */}
        {(mood === 'happy' || mood === 'celebrating') && (
          <ellipse 
            cx="45" 
            cy="50" 
            rx="40" 
            ry="45" 
            fill={getGlowColor()} 
            opacity="0.2"
            className="animate-pulse"
          />
        )}
        
        {/* Bulb base/screw */}
        <rect x="32" y="85" width="26" height="20" rx="3" fill="#9CA3AF" />
        <rect x="35" y="87" width="20" height="3" fill="#6B7280" />
        <rect x="35" y="92" width="20" height="3" fill="#6B7280" />
        <rect x="35" y="97" width="20" height="3" fill="#6B7280" />
        
        {/* Main bulb shape */}
        <ellipse 
          cx="45" 
          cy="50" 
          rx="35" 
          ry="40" 
          fill={getBulbColor()}
          stroke="#F59E0B"
          strokeWidth="2"
        />
        
        {/* Bulb highlight */}
        <ellipse 
          cx="32" 
          cy="40" 
          rx="10" 
          ry="15" 
          fill="white" 
          opacity="0.4"
        />
        
        {/* Bulb neck */}
        <path 
          d="M 28 75 Q 28 85 32 85 L 58 85 Q 62 85 62 75 L 62 70 Q 45 80 28 70 Z" 
          fill={getBulbColor()}
          stroke="#F59E0B"
          strokeWidth="1"
        />
        
        {/* Face */}
        {renderFace()}
        
        {/* Accessory */}
        {renderAccessory()}
        
        {/* Arms for celebrating */}
        {mood === 'celebrating' && (
          <>
            <path d="M 5 55 Q 15 45 25 55" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 65 55 Q 75 45 85 55" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
      </svg>
      
      {/* Confetti for celebrating */}
      {mood === 'celebrating' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${10 + i * 12}%`,
                backgroundColor: ['#FDD835', '#008751', '#FB923C', '#60A5FA'][i % 4],
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NepaBuddyMascot;
