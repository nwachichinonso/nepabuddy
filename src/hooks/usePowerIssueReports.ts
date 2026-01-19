import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type ProblemType = 'no_power' | 'low_voltage' | 'frequent_tripping' | 'meter_issues';

export interface PowerIssueReport {
  id: string;
  zone_id: string | null;
  location_description: string;
  problem_types: string[];
  power_available: boolean;
  reported_at: string;
  device_hash: string | null;
  additional_notes: string | null;
  status: string;
  created_at: string;
}

const getDeviceHash = (): string => {
  let hash = localStorage.getItem('nepa-buddy-device-hash');
  if (!hash) {
    hash = 'dev_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nepa-buddy-device-hash', hash);
  }
  return hash;
};

export const usePowerIssueReports = () => {
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<PowerIssueReport[]>([]);
  const [loading, setLoading] = useState(false);

  const submitReport = useCallback(async (
    zoneId: string | null,
    locationDescription: string,
    problemTypes: ProblemType[],
    powerAvailable: boolean,
    additionalNotes?: string
  ) => {
    if (!locationDescription.trim()) {
      toast({
        title: "Location needed",
        description: "Abeg enter your location so we fit help you!",
        variant: "destructive"
      });
      return false;
    }

    if (problemTypes.length === 0) {
      toast({
        title: "Problem type needed",
        description: "Select at least one problem type!",
        variant: "destructive"
      });
      return false;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('power_issue_reports')
        .insert({
          zone_id: zoneId,
          location_description: locationDescription.trim(),
          problem_types: problemTypes,
          power_available: powerAvailable,
          device_hash: getDeviceHash(),
          additional_notes: additionalNotes?.trim() || null
        });

      if (error) throw error;

      toast({
        title: powerAvailable ? "⚡ Light Dey! Report submitted" : "🔌 Report submitted!",
        description: "Thanks for reporting! Your feedback helps everybody."
      });
      
      return true;
    } catch (err) {
      console.error('Error submitting report:', err);
      toast({
        title: "Error!",
        description: "E no work o! Try again small small.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const fetchReports = useCallback(async (zoneId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('power_issue_reports')
        .select('*')
        .order('reported_at', { ascending: false })
        .limit(100);
      
      if (zoneId) {
        query = query.eq('zone_id', zoneId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setReports(data as PowerIssueReport[] || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReportsAsCSV = useCallback((reportsToExport: PowerIssueReport[]) => {
    if (reportsToExport.length === 0) {
      toast({
        title: "No reports",
        description: "No reports to export!",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Date', 'Location', 'Problem Types', 'Power Available', 'Notes', 'Status'];
    const rows = reportsToExport.map(r => [
      new Date(r.reported_at).toLocaleString(),
      r.location_description,
      r.problem_types.join('; '),
      r.power_available ? 'Yes' : 'No',
      r.additional_notes || '',
      r.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `power_reports_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export complete!",
      description: `${reportsToExport.length} reports exported to CSV.`
    });
  }, []);

  return {
    submitReport,
    submitting,
    fetchReports,
    reports,
    loading,
    exportReportsAsCSV
  };
};
