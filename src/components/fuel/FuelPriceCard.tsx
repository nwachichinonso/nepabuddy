import React from 'react';
import { cn } from '@/lib/utils';
import { Fuel, TrendingUp, TrendingDown, Minus, Droplet, Info, Clock } from 'lucide-react';
import { useFuelPrices } from '@/hooks/useFuelPrices';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export const FuelPriceCard: React.FC = () => {
  const { petrolPrice, dieselPrice, tip, loading } = useFuelPrices();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  const formatPrice = (price: { min_price: number; max_price: number; avg_price: number | null }) => {
    if (price.min_price === price.max_price) {
      return `₦${price.min_price}`;
    }
    return `₦${price.min_price} - ₦${price.max_price}`;
  };

  const getLastUpdated = (updatedAt: string) => {
    try {
      return formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Fuel Watch ⛽
        </h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Lagos prices
        </span>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Petrol */}
        <div className="card-nepa space-y-2">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-accent" />
            <span className="text-xs font-display font-medium text-muted-foreground uppercase">
              Petrol (PMS)
            </span>
          </div>
          
          {petrolPrice ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-display font-bold text-foreground">
                  {formatPrice(petrolPrice)}
                </span>
                <span className="text-xs text-muted-foreground">/L</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="w-3 h-3" />
                <span>Stable</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Updated {getLastUpdated(petrolPrice.updated_at)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
        </div>

        {/* Diesel */}
        <div className="card-nepa space-y-2">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-nepa-indigo dark:text-muted-foreground" />
            <span className="text-xs font-display font-medium text-muted-foreground uppercase">
              Diesel (AGO)
            </span>
          </div>
          
          {dieselPrice ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-display font-bold text-foreground">
                  {formatPrice(dieselPrice)}
                </span>
                <span className="text-xs text-muted-foreground">/L</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-danger">
                <TrendingUp className="w-3 h-3" />
                <span>High</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Updated {getLastUpdated(dieselPrice.updated_at)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Gen Tip: </span>
          {tip}
        </p>
      </div>
    </div>
  );
};

export default FuelPriceCard;
