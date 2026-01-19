import React, { useEffect, useState } from 'react';
import { Download, FileText, Loader2, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePowerIssueReports } from '@/hooks/usePowerIssueReports';
import { useZones } from '@/hooks/useZones';
import { format } from 'date-fns';

export const ReportsExportPanel: React.FC = () => {
  const { fetchReports, reports, loading, exportReportsAsCSV } = usePowerIssueReports();
  const { zones } = useZones();
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');

  useEffect(() => {
    fetchReports(selectedZoneFilter === 'all' ? undefined : selectedZoneFilter);
  }, [fetchReports, selectedZoneFilter]);

  const getZoneName = (zoneId: string | null) => {
    if (!zoneId) return 'Unknown Location';
    const zone = zones.find(z => z.id === zoneId);
    return zone?.display_name || 'Unknown Zone';
  };

  const getProblemLabel = (type: string) => {
    const labels: Record<string, string> = {
      'no_power': 'No Power',
      'low_voltage': 'Low Voltage',
      'frequent_tripping': 'Frequent Tripping',
      'meter_issues': 'Meter Issues'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Power Issue Reports
        </CardTitle>
        <CardDescription>
          View and export reports for submission to DISCO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedZoneFilter} onValueChange={setSelectedZoneFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fetchReports(selectedZoneFilter === 'all' ? undefined : selectedZoneFilter)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold text-destructive">
              {reports.filter(r => !r.power_available).length}
            </p>
            <p className="text-xs text-muted-foreground">No Power</p>
          </div>
          <div className="p-2 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">
              {reports.filter(r => r.power_available).length}
            </p>
            <p className="text-xs text-muted-foreground">Power On</p>
          </div>
        </div>

        {/* Report List */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reports yet</p>
            </div>
          ) : (
            reports.slice(0, 20).map(report => (
              <div 
                key={report.id}
                className="p-3 rounded-lg border bg-card text-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium truncate flex-1">
                    {report.location_description}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    report.power_available 
                      ? 'bg-green-500/20 text-green-600' 
                      : 'bg-red-500/20 text-red-600'
                  }`}>
                    {report.power_available ? 'Light Dey' : 'No Light'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {report.problem_types.map(type => (
                    <span 
                      key={type}
                      className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {getProblemLabel(type)}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(report.reported_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Export Button */}
        <Button 
          className="w-full gap-2"
          onClick={() => exportReportsAsCSV(reports)}
          disabled={reports.length === 0}
        >
          <Download className="w-4 h-4" />
          Export to CSV ({reports.length} reports)
        </Button>
      </CardContent>
    </Card>
  );
};
