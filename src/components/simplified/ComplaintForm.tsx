import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lock, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { useComplaints } from '@/hooks/useComplaints';

interface ComplaintFormProps {
  userId: string;
  location: string;
  isLocked: boolean;
  remainingIndications: number;
  onSuccess?: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  userId,
  location,
  isLocked,
  remainingIndications,
  onSuccess,
}) => {
  const [complaintText, setComplaintText] = useState('');
  const { submitComplaint, submitting } = useComplaints();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitComplaint(userId, location, complaintText);
    if (success) {
      setComplaintText('');
      onSuccess?.();
    }
  };

  if (isLocked) {
    return (
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-5 h-5" />
            Wahala Report 🔒
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Finish your daily indications first make you fit yarn 😤
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-3">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              Submit {remainingIndications} more indication{remainingIndications !== 1 ? 's' : ''} 
              <br />before you fit talk your own! 🗣️
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Report Wahala! 📢
        </CardTitle>
        <CardDescription>
          Tell us wetin dey happen for your area 😤
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Display */}
          {location ? (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Wahala location 📍:</p>
              <p className="font-medium">{location}</p>
            </div>
          ) : (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                ⚠️ Please enter your location above
              </p>
            </div>
          )}

          {/* Complaint Types Hints */}
          <div className="flex flex-wrap gap-2">
            {['Transformer don blow 💥', 'Voltage too low ⬇️', 'Light dey trip trip 🔄', 'Meter wahala 🔢'].map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => setComplaintText((prev) => prev ? `${prev}, ${hint}` : hint)}
                className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-muted/80 transition-colors"
              >
                + {hint}
              </button>
            ))}
          </div>

          {/* Complaint Text */}
          <Textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Yarn wetin dey happen... (e.g., No light for 3 days, transformer don blow, voltage too low) 💬"
            rows={4}
            disabled={submitting}
            maxLength={500}
          />
          
          <p className="text-xs text-muted-foreground text-right">
            {complaintText.length}/500 characters
          </p>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting || !location || !complaintText.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                E dey submit...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Wahala 📢
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
