import React, { forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, ZapOff, CheckCircle2, Loader2 } from 'lucide-react';
import { useIndications } from '@/hooks/useIndications';

interface IndicationFormProps {
  userId: string;
  location: string;
  todayCount: number;
  onSuccess: () => void;
}

export const IndicationForm = forwardRef<HTMLDivElement, IndicationFormProps>(({
  userId,
  location,
  todayCount,
  onSuccess,
}, ref) => {
  const { submitIndication, submitting, DAILY_LIMIT } = useIndications();
  
  const remaining = Math.max(0, DAILY_LIMIT - todayCount);
  const progress = (todayCount / DAILY_LIMIT) * 100;
  const isComplete = todayCount >= DAILY_LIMIT;

  const handleSubmit = async (status: boolean) => {
    const success = await submitIndication(userId, location, status);
    if (success) {
      onSuccess();
    }
  };

  if (isComplete) {
    return (
      <Card ref={ref} className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">
              Daily Indications Complete! 🎉
            </h3>
            <p className="text-sm text-green-600 dark:text-green-500">
              You don finish your 5 indications today. Well done!
              <br />
              Come back tomorrow to continue helping.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={ref}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Power Status Indication
        </CardTitle>
        <CardDescription>
          Submit your daily power status for your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="font-medium">{todayCount}/{DAILY_LIMIT}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {remaining} more indication{remaining !== 1 ? 's' : ''} needed to unlock complaints
          </p>
        </div>

        {/* Location Display */}
        {location ? (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Your location:</p>
            <p className="font-medium">{location}</p>
          </div>
        ) : (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive">
              ⚠️ Please enter your location above before submitting
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="default"
            className="h-20 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleSubmit(true)}
            disabled={submitting || !location}
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Zap className="w-6 h-6" />
                <span className="text-sm font-bold">Light Dey! ⚡</span>
              </div>
            )}
          </Button>
          
          <Button
            size="lg"
            variant="default"
            className="h-20 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => handleSubmit(false)}
            disabled={submitting || !location}
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ZapOff className="w-6 h-6" />
                <span className="text-sm font-bold">No Light! 🔌</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

IndicationForm.displayName = 'IndicationForm';
