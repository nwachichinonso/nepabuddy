import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Zap, ZapOff, RefreshCw, Loader2, MapPin, Clock } from 'lucide-react';
import { useLocationStatus } from '@/hooks/useLocationStatus';
import { useComplaints } from '@/hooks/useComplaints';

export const StatusDisplay: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { status, loading, searchLocationStatus, getStatusText, getConfidenceText } = useLocationStatus();
  const { fetchLocationComplaintCount } = useComplaints();
  const [complaintCount, setComplaintCount] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setHasSearched(true);
    await searchLocationStatus(searchTerm);
    const count = await fetchLocationComplaintCount(searchTerm);
    setComplaintCount(count);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const statusInfo = getStatusText(status);
  const confidenceText = getConfidenceText(status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Check Power Status 🔍
        </CardTitle>
        <CardDescription>
          Search any location to see wetin light dey do for that area 🏘️
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search location (e.g., Lekki, Ajah)"
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Results */}
        {hasSearched && !loading && (
          <div className="space-y-4">
            {status ? (
              <>
                {/* Status Card */}
                <div className={`p-4 rounded-lg border-2 ${
                  statusInfo.color === 'text-green-600' 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                    : statusInfo.color === 'text-red-600'
                    ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                    : statusInfo.color === 'text-yellow-600'
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900'
                    : 'bg-muted border-muted'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{statusInfo.emoji}</div>
                    <div>
                      <h3 className={`text-xl font-bold ${statusInfo.color}`}>
                        {statusInfo.text}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {status.location_string}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <Zap className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold">{status.on_count}</p>
                    <p className="text-xs text-muted-foreground">Light Dey! ⚡</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <ZapOff className="w-5 h-5 text-red-600 mx-auto mb-1" />
                    <p className="text-lg font-bold">{status.off_count}</p>
                    <p className="text-xs text-muted-foreground">No Light! 🌑</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <RefreshCw className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold">{status.total_reports}</p>
                    <p className="text-xs text-muted-foreground">Total Reports 📊</p>
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{confidenceText}</span>
                </div>

                {/* Complaints */}
                {complaintCount !== null && complaintCount > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      ⚠️😤 {complaintCount} wahala report{complaintCount !== 1 ? 's' : ''} for this area (last 7 days)
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🤔❓</div>
                <h3 className="font-medium">No data dey for here o!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Nobody don report for "{searchTerm}" yet.
                  <br />
                  Be the first person wey go submit indication! 🏆
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
