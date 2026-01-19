import React, { useState, useEffect } from 'react';
import { Zap, ZapOff, AlertTriangle, Gauge, Settings, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { usePowerIssueReports, ProblemType } from '@/hooks/usePowerIssueReports';
import { useZones } from '@/hooks/useZones';
import { cn } from '@/lib/utils';

interface PowerIssueReportFormProps {
  selectedZoneId?: string | null;
  onSuccess?: () => void;
}

const problemOptions: { id: ProblemType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'no_power',
    label: 'No Power',
    icon: <ZapOff className="w-5 h-5" />,
    description: 'Complete blackout in the area'
  },
  {
    id: 'low_voltage',
    label: 'Low Voltage',
    icon: <Gauge className="w-5 h-5" />,
    description: 'Power is on but weak/unstable'
  },
  {
    id: 'frequent_tripping',
    label: 'Frequent Tripping',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Power keeps going on and off'
  },
  {
    id: 'meter_issues',
    label: 'Meter Issues',
    icon: <Settings className="w-5 h-5" />,
    description: 'Problems with prepaid/postpaid meter'
  }
];

export const PowerIssueReportForm: React.FC<PowerIssueReportFormProps> = ({ 
  selectedZoneId,
  onSuccess 
}) => {
  const [selectedProblems, setSelectedProblems] = useState<ProblemType[]>([]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [powerAvailable, setPowerAvailable] = useState(false);
  const { submitReport, submitting } = usePowerIssueReports();
  const { zones } = useZones();

  // Pre-fill location if zone is selected
  useEffect(() => {
    if (selectedZoneId && zones.length > 0) {
      const zone = zones.find(z => z.id === selectedZoneId);
      if (zone && !location) {
        setLocation(zone.display_name);
      }
    }
  }, [selectedZoneId, zones, location]);

  const toggleProblem = (problemId: ProblemType) => {
    setSelectedProblems(prev => 
      prev.includes(problemId)
        ? prev.filter(p => p !== problemId)
        : [...prev, problemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitReport(
      selectedZoneId || null,
      location,
      selectedProblems,
      powerAvailable,
      notes
    );

    if (success) {
      // Reset form
      setSelectedProblems([]);
      setLocation('');
      setNotes('');
      setPowerAvailable(false);
      onSuccess?.();
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Report Power Problem
        </CardTitle>
        <CardDescription>
          Tell us about power issues in your area. We'll compile and forward to DISCO.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Your Location
            </Label>
            <Textarea
              id="location"
              placeholder="Enter your street, area, landmark... e.g., 'Ikeja Allen Avenue, near GTBank'"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="min-h-[60px] resize-none"
              maxLength={200}
            />
          </div>

          {/* Problem Types */}
          <div className="space-y-2">
            <Label>What's the problem?</Label>
            <div className="grid grid-cols-2 gap-2">
              {problemOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleProblem(option.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-left",
                    selectedProblems.includes(option.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/30 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    {option.icon}
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground w-full">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Power Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
            {powerAvailable ? (
                <Zap className="w-6 h-6 text-success" />
              ) : (
                <ZapOff className="w-6 h-6 text-destructive" />
              )}
              <div>
                <p className="font-medium">
                  {powerAvailable ? "Light Dey! ⚡" : "No Light 😔"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to toggle current power status
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={powerAvailable ? "default" : "outline"}
              size="sm"
              onClick={() => setPowerAvailable(!powerAvailable)}
              className={cn(
                powerAvailable && "bg-success hover:bg-success/90 text-success-foreground"
              )}
            >
              {powerAvailable ? "Light Dey" : "Light No Dey"}
            </Button>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any other details... e.g., 'Light don off since morning'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] resize-none"
              maxLength={500}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={submitting || selectedProblems.length === 0 || !location.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
