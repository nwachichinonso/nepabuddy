-- Create power_issue_reports table for detailed problem reporting
CREATE TABLE public.power_issue_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id),
  location_description TEXT NOT NULL,
  problem_types TEXT[] NOT NULL,
  power_available BOOLEAN NOT NULL DEFAULT false,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_hash TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.power_issue_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit reports
CREATE POLICY "Anyone can submit power issue reports"
ON public.power_issue_reports
FOR INSERT
WITH CHECK (true);

-- Anyone can view reports (for export functionality)
CREATE POLICY "Anyone can view power issue reports"
ON public.power_issue_reports
FOR SELECT
USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.power_issue_reports IS 'User-submitted power problem reports for forwarding to DISCOs';
COMMENT ON COLUMN public.power_issue_reports.problem_types IS 'Array of problem types: no_power, low_voltage, frequent_tripping, meter_issues';
COMMENT ON COLUMN public.power_issue_reports.power_available IS 'True if power is currently on (Light Dey button clicked)';
COMMENT ON COLUMN public.power_issue_reports.status IS 'Report status: pending, exported, resolved';