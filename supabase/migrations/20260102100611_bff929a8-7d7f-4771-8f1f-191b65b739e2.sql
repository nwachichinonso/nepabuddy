-- Lagos zones table
CREATE TABLE public.zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  geohash_prefix TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Power status per zone (aggregated)
CREATE TABLE public.zone_power_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('on', 'off', 'recovering', 'unknown')),
  confidence TEXT NOT NULL DEFAULT 'low' CHECK (confidence IN ('low', 'medium', 'high')),
  buddy_count INTEGER NOT NULL DEFAULT 0,
  plugged_count INTEGER NOT NULL DEFAULT 0,
  unplugged_count INTEGER NOT NULL DEFAULT 0,
  last_change_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(zone_id)
);

-- Anonymous device reports (charging state changes)
CREATE TABLE public.device_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
  device_hash TEXT NOT NULL,
  is_charging BOOLEAN NOT NULL,
  geohash TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User feedback (manual reports)
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('light_on', 'light_off', 'gen_mode', 'inverter')),
  device_hash TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Outage history for timeline
CREATE TABLE public.outage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  buddy_count INTEGER NOT NULL DEFAULT 0,
  funny_caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fuel prices
CREATE TABLE public.fuel_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel')),
  min_price DECIMAL(10, 2) NOT NULL,
  max_price DECIMAL(10, 2) NOT NULL,
  avg_price DECIMAL(10, 2),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Official notices from Discos/TCN
CREATE TABLE public.official_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  notice_type TEXT NOT NULL DEFAULT 'info' CHECK (notice_type IN ('maintenance', 'grid_collapse', 'restoration', 'info')),
  affected_zones TEXT[],
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_power_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_notices ENABLE ROW LEVEL SECURITY;

-- Public read access for zones, status, history, fuel, notices (no auth required for viewing)
CREATE POLICY "Anyone can view zones" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Anyone can view power status" ON public.zone_power_status FOR SELECT USING (true);
CREATE POLICY "Anyone can view outage history" ON public.outage_history FOR SELECT USING (true);
CREATE POLICY "Anyone can view fuel prices" ON public.fuel_prices FOR SELECT USING (true);
CREATE POLICY "Anyone can view active notices" ON public.official_notices FOR SELECT USING (is_active = true);

-- Anonymous insert for device reports and feedback (crowdsourced data)
CREATE POLICY "Anyone can submit device reports" ON public.device_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);

-- Enable realtime for power status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.zone_power_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.official_notices;

-- Insert Lagos zones
INSERT INTO public.zones (name, display_name, geohash_prefix, latitude, longitude) VALUES
('ikeja', 'Ikeja GRA', 's14xz', 6.6018, 3.3515),
('ikeja_phase1', 'Ikeja Phase 1', 's14xy', 6.5950, 3.3480),
('lekki_phase1', 'Lekki Phase 1', 's15nb', 6.4478, 3.4723),
('lekki_phase2', 'Lekki Phase 2', 's15nc', 6.4350, 3.4900),
('victoria_island', 'Victoria Island', 's15h8', 6.4281, 3.4219),
('surulere', 'Surulere', 's14t8', 6.4969, 3.3567),
('yaba', 'Yaba', 's14u2', 6.5158, 3.3801),
('mainland', 'Lagos Mainland', 's14t9', 6.4698, 3.3515),
('ajah', 'Ajah', 's15p2', 6.4698, 3.5636),
('ikoyi', 'Ikoyi', 's15h4', 6.4500, 3.4333),
('festac', 'Festac Town', 's148z', 6.4667, 3.2833),
('oshodi', 'Oshodi', 's14r5', 6.5568, 3.3436),
('agege', 'Agege', 's14x2', 6.6210, 3.3284),
('apapa', 'Apapa', 's14p8', 6.4489, 3.3589),
('magodo', 'Magodo', 's15k2', 6.6167, 3.4167);

-- Initialize power status for all zones
INSERT INTO public.zone_power_status (zone_id, status, confidence, buddy_count)
SELECT id, 'unknown', 'low', 0 FROM public.zones;

-- Insert current fuel prices (Dec 2025)
INSERT INTO public.fuel_prices (fuel_type, min_price, max_price, avg_price) VALUES
('petrol', 770.00, 900.00, 835.00),
('diesel', 978.00, 1100.00, 1039.00);

-- Insert sample notices
INSERT INTO public.official_notices (source, title, content, notice_type, affected_zones, is_active) VALUES
('Excel Distribution', 'Planned Maintenance - Ikeja West', 'Scheduled maintenance work on 11KV Ikeja Industrial feeder. Estimated duration: 8am - 5pm.', 'maintenance', ARRAY['ikeja', 'ikeja_phase1'], true),
('IE Energy Lagos', 'Restoration Notice', 'Power has been restored to Lekki Phase 1 and Ajah areas after transformer repairs.', 'restoration', ARRAY['lekki_phase1', 'ajah'], true),
('TCN', 'Grid Update', 'National grid stable. All feeders operating normally.', 'info', NULL, true);

-- Function to update power status based on device reports
CREATE OR REPLACE FUNCTION public.update_zone_power_status()
RETURNS TRIGGER AS $$
DECLARE
  v_plugged INTEGER;
  v_unplugged INTEGER;
  v_total INTEGER;
  v_plug_ratio DECIMAL;
  v_new_status TEXT;
  v_new_confidence TEXT;
BEGIN
  -- Count reports in last 15 minutes
  SELECT 
    COUNT(*) FILTER (WHERE is_charging = true),
    COUNT(*) FILTER (WHERE is_charging = false),
    COUNT(*)
  INTO v_plugged, v_unplugged, v_total
  FROM public.device_reports
  WHERE zone_id = NEW.zone_id
    AND reported_at > NOW() - INTERVAL '15 minutes';
  
  -- Calculate status
  IF v_total < 3 THEN
    v_new_status := 'unknown';
    v_new_confidence := 'low';
  ELSE
    v_plug_ratio := v_plugged::DECIMAL / v_total;
    
    IF v_plug_ratio >= 0.7 THEN
      v_new_status := 'on';
      v_new_confidence := CASE WHEN v_total >= 10 THEN 'high' WHEN v_total >= 5 THEN 'medium' ELSE 'low' END;
    ELSIF v_plug_ratio <= 0.3 THEN
      v_new_status := 'off';
      v_new_confidence := CASE WHEN v_total >= 10 THEN 'high' WHEN v_total >= 5 THEN 'medium' ELSE 'low' END;
    ELSE
      v_new_status := 'recovering';
      v_new_confidence := 'medium';
    END IF;
  END IF;
  
  -- Update zone status
  UPDATE public.zone_power_status
  SET 
    status = v_new_status,
    confidence = v_new_confidence,
    buddy_count = v_total,
    plugged_count = v_plugged,
    unplugged_count = v_unplugged,
    updated_at = NOW(),
    last_change_at = CASE WHEN status != v_new_status THEN NOW() ELSE last_change_at END
  WHERE zone_id = NEW.zone_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update status on new reports
CREATE TRIGGER trigger_update_power_status
AFTER INSERT ON public.device_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_zone_power_status();