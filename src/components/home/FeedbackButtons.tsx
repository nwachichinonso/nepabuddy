import React from 'react';
import { cn } from '@/lib/utils';
import { Zap, ZapOff, Fuel, Battery } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';

interface FeedbackOption {
  id: 'light_on' | 'light_off' | 'gen_mode' | 'inverter';
  label: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    id: 'light_on',
    label: 'Light dey!',
    icon: <Zap className="w-5 h-5" />,
    emoji: '⚡',
    description: 'My side light dey',
  },
  {
    id: 'light_off',
    label: 'Light don go',
    icon: <ZapOff className="w-5 h-5" />,
    emoji: '🔌',
    description: 'Here sef light don go',
  },
  {
    id: 'gen_mode',
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

interface FeedbackButtonsProps {
  zoneId?: string;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ zoneId }) => {
  const { submitFeedback, submitting, lastSubmittedType } = useFeedback(zoneId);

  const handleFeedback = async (option: FeedbackOption) => {
    await submitFeedback(option.id);
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
            disabled={submitting}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300',
              'hover:scale-[1.02] active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              lastSubmittedType === option.id
                ? 'border-primary bg-primary/10 shadow-soft'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              lastSubmittedType === option.id
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
