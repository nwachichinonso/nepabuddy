import React from 'react';
import { cn } from '@/lib/utils';
import { usePowerStatus, ZonePowerStatus } from '@/hooks/usePowerStatus';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors = {
  on: { bg: 'fill-success/30', stroke: 'stroke-success', dot: 'bg-success' },
  off: { bg: 'fill-danger/30', stroke: 'stroke-danger', dot: 'bg-danger' },
  recovering: { bg: 'fill-warning/30', stroke: 'stroke-warning', dot: 'bg-warning' },
  unknown: { bg: 'fill-muted/30', stroke: 'stroke-muted-foreground', dot: 'bg-muted-foreground' },
};

// Lagos zone positions for the mini map (approximate relative positions)
const zonePositions: Record<string, { x: number; y: number; width: number; height: number }> = {
  ikeja: { x: 30, y: 12, width: 18, height: 15 },
  ikeja_phase1: { x: 25, y: 28, width: 16, height: 12 },
  lekki_phase1: { x: 60, y: 50, width: 18, height: 15 },
  lekki_phase2: { x: 75, y: 58, width: 16, height: 14 },
  victoria_island: { x: 38, y: 58, width: 18, height: 12 },
  surulere: { x: 18, y: 42, width: 16, height: 14 },
  yaba: { x: 28, y: 38, width: 14, height: 12 },
  mainland: { x: 8, y: 28, width: 18, height: 18 },
  ajah: { x: 78, y: 70, width: 16, height: 15 },
  ikoyi: { x: 45, y: 48, width: 14, height: 10 },
  festac: { x: 5, y: 48, width: 15, height: 14 },
  oshodi: { x: 35, y: 25, width: 14, height: 12 },
  agege: { x: 25, y: 5, width: 16, height: 12 },
  apapa: { x: 15, y: 55, width: 14, height: 12 },
  magodo: { x: 48, y: 15, width: 15, height: 12 },
};

interface MiniMapProps {
  onZoneClick?: (zoneId: string) => void;
  highlightedZoneId?: string;
}

export const MiniMap: React.FC<MiniMapProps> = ({ onZoneClick, highlightedZoneId }) => {
  const { allZonesStatus, loading } = usePowerStatus();

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const getZoneStatus = (zoneName: string): ZonePowerStatus['status'] => {
    const zone = allZonesStatus.find(z => z.zones?.name === zoneName);
    return zone?.status || 'unknown';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Lagos Power Map
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">On</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-muted-foreground">Off</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Recovering</span>
          </div>
        </div>
      </div>
      
      <div className="relative bg-muted/50 rounded-2xl p-4 overflow-hidden border border-border">
        {/* Map background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <svg
          viewBox="0 0 100 100"
          className="w-full h-40 relative z-10"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Water/Lagos Lagoon */}
          <ellipse cx="50" cy="75" rx="45" ry="12" className="fill-blue-200/30 dark:fill-blue-900/30" />
          
          {/* Zones */}
          {Object.entries(zonePositions).map(([zoneName, pos]) => {
            const status = getZoneStatus(zoneName);
            const colors = statusColors[status];
            const zoneData = allZonesStatus.find(z => z.zones?.name === zoneName);
            const isHighlighted = zoneData?.zone_id === highlightedZoneId;
            
            return (
              <g 
                key={zoneName} 
                className={cn(
                  'cursor-pointer transition-all',
                  onZoneClick ? 'hover:opacity-80' : ''
                )}
                onClick={() => zoneData && onZoneClick?.(zoneData.zone_id)}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.width}
                  height={pos.height}
                  rx="2"
                  className={cn(
                    colors.bg, 
                    colors.stroke, 
                    'stroke-[1.5]',
                    isHighlighted && 'stroke-[3] stroke-primary'
                  )}
                />
                <text
                  x={pos.x + pos.width / 2}
                  y={pos.y + pos.height / 2 + 1}
                  textAnchor="middle"
                  className="fill-foreground text-[3px] font-display font-medium pointer-events-none"
                >
                  {zoneData?.zones?.display_name?.split(' ')[0] || zoneName}
                </text>
                {/* Pulse for areas with power */}
                {status === 'on' && (
                  <circle
                    cx={pos.x + pos.width / 2}
                    cy={pos.y + 2}
                    r="1.5"
                    className="fill-success animate-pulse"
                  />
                )}
                {/* Buddy count indicator */}
                {zoneData && zoneData.buddy_count > 0 && (
                  <text
                    x={pos.x + pos.width - 2}
                    y={pos.y + pos.height - 1}
                    textAnchor="end"
                    className="fill-muted-foreground text-[2px] font-display pointer-events-none"
                  >
                    {zoneData.buddy_count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Overlay text */}
        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-xs text-muted-foreground">
          <span>🇳🇬 Lagos, Nigeria</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;
