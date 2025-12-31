import React from 'react';
import { cn } from '@/lib/utils';
import { Fuel, TrendingUp, TrendingDown, Minus, Droplet, Info } from 'lucide-react';

interface FuelPrice {
  type: 'petrol' | 'diesel';
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  lastUpdate: string;
}

const fuelPrices: FuelPrice[] = [
  {
    type: 'petrol',
    price: 780,
    unit: '₦/L',
    trend: 'stable',
    change: '±₦0',
    lastUpdate: 'Dec 31, 2025',
  },
  {
    type: 'diesel',
    price: 1050,
    unit: '₦/L',
    trend: 'up',
    change: '+₦50',
    lastUpdate: 'Dec 31, 2025',
  },
];

const tips = [
  "Diesel don cost! Make we save light small small when e dey 😅",
  "Morning time na best time to run gen — fuel go last longer!",
  "LED bulbs save am well well — consider changing if you never!",
  "Inverter + solar combo dey work for plenty people now 🌞",
];

export const FuelPriceCard: React.FC = () => {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Fuel Watch ⛽
        </h3>
        <span className="text-xs text-muted-foreground">Lagos prices</span>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-2 gap-3">
        {fuelPrices.map((fuel) => {
          const TrendIcon = fuel.trend === 'up' 
            ? TrendingUp 
            : fuel.trend === 'down' 
              ? TrendingDown 
              : Minus;
          
          const trendColor = fuel.trend === 'up' 
            ? 'text-danger' 
            : fuel.trend === 'down' 
              ? 'text-success' 
              : 'text-muted-foreground';

          return (
            <div
              key={fuel.type}
              className="card-nepa space-y-2"
            >
              <div className="flex items-center gap-2">
                {fuel.type === 'petrol' ? (
                  <Fuel className="w-4 h-4 text-accent" />
                ) : (
                  <Droplet className="w-4 h-4 text-nepa-indigo dark:text-muted-foreground" />
                )}
                <span className="text-xs font-display font-medium text-muted-foreground uppercase">
                  {fuel.type}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-display font-bold text-foreground">
                  ₦{fuel.price}
                </span>
                <span className="text-xs text-muted-foreground">/L</span>
              </div>

              <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
                <TrendIcon className="w-3 h-3" />
                <span>{fuel.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Gen Tip: </span>
          {randomTip}
        </p>
      </div>
    </div>
  );
};

export default FuelPriceCard;
