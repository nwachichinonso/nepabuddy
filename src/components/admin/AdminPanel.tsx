import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  ZapOff, 
  RefreshCw, 
  X,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useZones } from '@/hooks/useZones';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { ReportsExportPanel } from '@/components/reports/ReportsExportPanel';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [showReports, setShowReports] = useState(false);
  const { zones } = useZones();
  const { setAdminMode } = useAppStore();
  const { toast } = useToast();

  if (!isOpen) return null;

  const simulateStatusChange = async (status: 'on' | 'off' | 'recovering') => {
    if (!selectedZone) {
      toast({
        title: "Select Zone First!",
        description: "Pick a zone before simulating",
        variant: "destructive",
      });
      return;
    }

    setLoading(status);
    try {
      // Update zone_power_status
      const { error } = await supabase
        .from('zone_power_status')
        .update({
          status,
          confidence: 'high',
          updated_at: new Date().toISOString(),
          last_change_at: new Date().toISOString(),
        })
        .eq('zone_id', selectedZone);

      if (error) throw error;

      toast({
        title: "Simulation Complete! 🔧",
        description: `Zone status changed to ${status.toUpperCase()}`,
      });
    } catch (err) {
      console.error('Simulation error:', err);
      toast({
        title: "Error!",
        description: "Failed to simulate status change",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const exitAdminMode = () => {
    setAdminMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-card animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                Admin Mode 🔧
              </h2>
              <p className="text-xs text-muted-foreground">
                For testing only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Zone Selector */}
        <div className="mb-6">
          <label className="block text-sm font-display font-medium text-foreground mb-2">
            Select Zone
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Choose a zone...</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-display font-medium text-muted-foreground">
            Simulate Status Change:
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => simulateStatusChange('on')}
              disabled={!!loading}
              className={cn(
                "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                "bg-success/10 border-success/30 hover:bg-success/20",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading === 'on' ? (
                <Loader2 className="w-6 h-6 text-success animate-spin" />
              ) : (
                <Zap className="w-6 h-6 text-success" />
              )}
              <span className="text-xs font-display font-medium text-success">
                Power ON
              </span>
            </button>

            <button
              onClick={() => simulateStatusChange('off')}
              disabled={!!loading}
              className={cn(
                "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                "bg-danger/10 border-danger/30 hover:bg-danger/20",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading === 'off' ? (
                <Loader2 className="w-6 h-6 text-danger animate-spin" />
              ) : (
                <ZapOff className="w-6 h-6 text-danger" />
              )}
              <span className="text-xs font-display font-medium text-danger">
                Power OFF
              </span>
            </button>

            <button
              onClick={() => simulateStatusChange('recovering')}
              disabled={!!loading}
              className={cn(
                "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                "bg-warning/10 border-warning/30 hover:bg-warning/20",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading === 'recovering' ? (
                <Loader2 className="w-6 h-6 text-warning-foreground animate-spin" />
              ) : (
                <RefreshCw className="w-6 h-6 text-warning-foreground" />
              )}
              <span className="text-xs font-display font-medium text-warning-foreground">
                Recovering
              </span>
            </button>
          </div>
        </div>

        {/* Reports Section Toggle */}
        <button
          onClick={() => setShowReports(!showReports)}
          className="w-full mt-4 py-3 bg-primary/10 text-primary rounded-xl font-display font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {showReports ? 'Hide Reports' : 'View Power Issue Reports'}
        </button>

        {/* Reports Export Panel */}
        {showReports && (
          <div className="mt-4 max-h-[300px] overflow-y-auto">
            <ReportsExportPanel />
          </div>
        )}

        {/* Exit Button */}
        <button
          onClick={exitAdminMode}
          className="w-full mt-4 py-3 bg-muted text-muted-foreground rounded-xl font-display font-medium hover:bg-muted/80 transition-colors"
        >
          Exit Admin Mode
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
