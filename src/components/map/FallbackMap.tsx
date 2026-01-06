import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Users } from 'lucide-react';
import { usePowerStatus } from '@/hooks/usePowerStatus';
import { useZones } from '@/hooks/useZones';

interface FallbackMapProps {
  selectedZoneId?: string | null;
  onZoneSelect?: (zoneId: string) => void;
  className?: string;
}

export const FallbackMap: React.FC<FallbackMapProps> = ({
  selectedZoneId,
  onZoneSelect,
  className,
}) => {
  const { zones } = useZones();
  const { allZonesStatus } = usePowerStatus();

  const zonesWithStatus = zones.map(zone => {
    const status = allZonesStatus?.find(s => s.zone_id === zone.id);
    return {
      ...zone,
      powerStatus: status?.status || 'unknown',
      confidence: status?.confidence || 'low',
      buddyCount: status?.buddy_count || 0,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on': return 'bg-success';
      case 'off': return 'bg-danger';
      case 'recovering': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  return (
    <div className={cn(
      "relative bg-muted/30 rounded-2xl overflow-hidden",
      className
    )}>
      {/* Stylized Lagos silhouette background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="text-[200px] font-black text-foreground">LAGOS</div>
      </div>

      {/* Zone grid */}
      <div className="relative p-4 grid grid-cols-3 gap-2 h-full">
        {zonesWithStatus.slice(0, 9).map((zone) => (
          <button
            key={zone.id}
            onClick={() => onZoneSelect?.(zone.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
              "border-2 hover:scale-105",
              selectedZoneId === zone.id 
                ? "border-primary bg-primary/10" 
                : "border-transparent bg-card/50 hover:bg-card"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mb-1",
              getStatusColor(zone.powerStatus)
            )}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-display font-semibold text-foreground text-center line-clamp-1">
              {zone.display_name.split(' ')[0]}
            </span>
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" />
              {zone.buddyCount}
            </span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute left-2 bottom-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-2">
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-foreground">ON</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-foreground">OFF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-foreground">Recovering</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackMap;
