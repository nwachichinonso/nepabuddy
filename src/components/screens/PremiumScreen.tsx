import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import NepaBuddyMascot from '../mascot/NepaBuddyMascot';
import NepaButton from '../ui/NepaButton';
import { Check, Sparkles, Map, Clock, Fuel, TrendingUp, Heart, Crown } from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Priority Alerts',
    description: 'Know before your WhatsApp group! First to get power updates.',
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: 'Full Lagos Map',
    description: 'See which estates dey shine vs dark in real-time.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Outage History',
    description: 'Track light hours per area — fight that estimated billing!',
  },
  {
    icon: <Fuel className="w-5 h-5" />,
    title: 'Fuel Tracker',
    description: 'Petrol & diesel prices + smart gen tips to save money.',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Predictions',
    description: 'Coming soon: Know when Monday morning wahala go happen!',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Support Naija',
    description: 'Help keep the free version alive for everybody!',
  },
];

interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  savings?: string;
  popular?: boolean;
}

const plans: PlanOption[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₦1,500',
    period: '/month',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₦12,000',
    period: '/year',
    savings: 'Save ₦6,000 + 1 month free!',
    popular: true,
  },
];

export const PremiumScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Hero Section */}
      <div className="relative text-center py-6 px-4 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/10 overflow-hidden">
        {/* Ankara pattern */}
        <div className="absolute inset-0 ankara-pattern opacity-20" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 rounded-full">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm text-primary">Premium</span>
          </div>
          
          <NepaBuddyMascot mood="celebrating" size="lg" />
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Upgrade to Premium! 💎
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Get priority alerts, full Lagos map, and help keep NEPA Buddy free for everybody!
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          What You Get
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:shadow-soft transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Choose Your Plan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'relative p-4 rounded-2xl border-2 text-left transition-all',
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-display font-semibold rounded-full">
                  Best Value
                </span>
              )}
              
              <div className="space-y-1">
                <p className="font-display font-medium text-muted-foreground text-sm">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                {plan.savings && (
                  <p className="text-xs text-success font-medium">
                    {plan.savings}
                  </p>
                )}
              </div>

              {/* Checkmark */}
              {selectedPlan === plan.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="space-y-3">
        <NepaButton className="w-full" size="lg">
          <Crown className="w-5 h-5" />
          Subscribe Now
        </NepaButton>
        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime • 7-day free trial • Secure payment
        </p>
      </div>

      {/* Social Proof */}
      <div className="text-center py-4 px-4 rounded-2xl bg-muted/50 space-y-2">
        <div className="flex justify-center -space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs border-2 border-background"
            >
              😊
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">2,847 Lagosians</span> upgraded this month!
        </p>
      </div>
    </div>
  );
};

export default PremiumScreen;
