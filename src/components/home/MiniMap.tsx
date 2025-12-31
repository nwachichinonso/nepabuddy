import React from 'react';
import { cn } from '@/lib/utils';

interface Zone {
  id: string;
  name: string;
  status: 'on' | 'off' | 'partial';
  x: number;
  y: number;
  width: number;
  height: number;
}

const lagosZones: Zone[] = [
  { id: 'ikeja', name: 'Ikeja', status: 'on', x: 30, y: 15, width: 25, height: 20 },
  { id: 'lekki', name: 'Lekki', status: 'on', x: 55, y: 50, width: 35, height: 25 },
  { id: 'vi', name: 'V.I.', status: 'partial', x: 35, y: 55, width: 20, height: 15 },
  { id: 'surulere', name: 'Surulere', status: 'off', x: 15, y: 40, width: 20, height: 18 },
  { id: 'yaba', name: 'Yaba', status: 'on', x: 25, y: 35, width: 18, height: 15 },
  { id: 'mainland', name: 'Mainland', status: 'off', x: 5, y: 25, width: 25, height: 25 },
  { id: 'ajah', name: 'Ajah', status: 'on', x: 75, y: 65, width: 20, height: 20 },
  { id: 'ikoyi', name: 'Ikoyi', status: 'on', x: 40, y: 45, width: 18, height: 12 },
];

const statusColors = {
  on: { bg: 'fill-success/30', stroke: 'stroke-success', dot: 'bg-success' },
  off: { bg: 'fill-danger/30', stroke: 'stroke-danger', dot: 'bg-danger' },
  partial: { bg: 'fill-warning/30', stroke: 'stroke-warning', dot: 'bg-warning' },
};

export const MiniMap: React.FC = () => {
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
            <span className="text-muted-foreground">Partial</span>
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
          className="w-full h-32 relative z-10"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Water/Lagos Lagoon */}
          <ellipse cx="45" cy="70" rx="40" ry="15" className="fill-blue-200/30 dark:fill-blue-900/30" />
          
          {/* Zones */}
          {lagosZones.map((zone) => {
            const colors = statusColors[zone.status];
            return (
              <g key={zone.id} className="cursor-pointer transition-all hover:opacity-80">
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="3"
                  className={cn(colors.bg, colors.stroke, 'stroke-2')}
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 + 1}
                  textAnchor="middle"
                  className="fill-foreground text-[4px] font-display font-medium"
                >
                  {zone.name}
                </text>
                {/* Pulse for areas with power */}
                {zone.status === 'on' && (
                  <circle
                    cx={zone.x + zone.width / 2}
                    cy={zone.y + 3}
                    r="1.5"
                    className="fill-success animate-pulse"
                  />
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
