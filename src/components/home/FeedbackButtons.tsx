import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Zap, ZapOff, Fuel, Battery } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    id: 'light-on',
    label: 'Light dey!',
    icon: <Zap className="w-5 h-5" />,
    emoji: '⚡',
    description: 'My side light dey',
  },
  {
    id: 'light-off',
    label: 'Light don go',
    icon: <ZapOff className="w-5 h-5" />,
    emoji: '🔌',
    description: 'Here sef light don go',
  },
  {
    id: 'gen-mode',
    label: 'Gen dey save me',
    icon: <Fuel className="w-5 h-5" />,
    emoji: '⛽',
    description: 'Running gen small',
  },
  {
    id: 'inverter',
    label: 'Inverter mode',
    icon: <Battery className="w-5 h-5" />,
    emoji: '🔋',
    description: "I'm on inverter",
  },
];

export const FeedbackButtons: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleFeedback = (option: FeedbackOption) => {
    setSelectedId(option.id);
    
    const messages = {
      'light-on': "Nice one! We don add your update. Na so we dey shine together! ⚡",
      'light-off': "Noted o! We go update the squad. Hold body! 💪",
      'gen-mode': "Gen gang! 💨 Fuel price no be beans sha... we dey with you!",
      'inverter': "Smart choice! Battery backup gang 🔋 We see you!",
    };

    toast({
      title: `${option.emoji} Feedback received!`,
      description: messages[option.id as keyof typeof messages],
    });

    // Reset after animation
    setTimeout(() => setSelectedId(null), 2000);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Quick Feedback
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {feedbackOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleFeedback(option)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300',
              'hover:scale-[1.02] active:scale-95',
              selectedId === option.id
                ? 'border-primary bg-primary/10 shadow-soft'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              selectedId === option.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {option.icon}
            </div>
            <span className="font-display font-medium text-sm text-foreground">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedbackButtons;
