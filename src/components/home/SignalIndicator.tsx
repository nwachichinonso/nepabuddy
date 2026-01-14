import { Wifi, WifiOff, Radio, Zap, ZapOff } from 'lucide-react';
import { useNetworkSignal, NetworkSignalData } from '@/hooks/useNetworkSignal';
import { cn } from '@/lib/utils';

const signalConfig: Record<NetworkSignalData['signalStrength'], {
  label: string;
  color: string;
  bars: number;
  icon: typeof Wifi;
}> = {
  excellent: { label: 'Excellent', color: 'text-green-500', bars: 4, icon: Wifi },
  good: { label: 'Good', color: 'text-green-400', bars: 3, icon: Wifi },
  fair: { label: 'Fair', color: 'text-yellow-500', bars: 2, icon: Wifi },
  poor: { label: 'Poor', color: 'text-red-500', bars: 1, icon: Wifi },
  offline: { label: 'Offline', color: 'text-muted-foreground', bars: 0, icon: WifiOff }
};

export const SignalIndicator = () => {
  const { signalData, isSupported } = useNetworkSignal();

  if (!signalData) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Radio className="w-4 h-4 animate-pulse" />
        <span>Detecting signal...</span>
      </div>
    );
  }

  const config = signalConfig[signalData.signalStrength];
  const SignalIcon = config.icon;

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Network Signal</span>
        </div>
        {!isSupported && (
          <span className="text-xs text-muted-foreground">(Limited API)</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* Signal Strength */}
        <div className="flex items-center gap-3">
          <SignalIcon className={cn('w-5 h-5', config.color)} />
          
          {/* Signal Bars */}
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={cn(
                  'w-1.5 rounded-sm transition-all',
                  bar <= config.bars ? config.color.replace('text-', 'bg-') : 'bg-muted'
                )}
                style={{ height: `${bar * 25}%` }}
              />
            ))}
          </div>

          <div className="flex flex-col">
            <span className={cn('text-sm font-medium', config.color)}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {signalData.effectiveType.toUpperCase()} • {signalData.rtt}ms
            </span>
          </div>
        </div>

        {/* Grid Status */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
          signalData.isOnGrid 
            ? 'bg-green-500/10 text-green-500' 
            : 'bg-orange-500/10 text-orange-500'
        )}>
          {signalData.isOnGrid ? (
            <>
              <Zap className="w-4 h-4" />
              <span>On-Grid</span>
            </>
          ) : (
            <>
              <ZapOff className="w-4 h-4" />
              <span>Off-Grid</span>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {signalData.isOnGrid 
          ? 'Cell tower signal is stable – likely connected to main grid power'
          : 'Signal fluctuation detected – tower may be on backup power'
        }
      </p>
    </div>
  );
};
