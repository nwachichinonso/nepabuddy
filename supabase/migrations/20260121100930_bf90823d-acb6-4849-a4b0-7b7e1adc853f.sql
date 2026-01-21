-- Add source column to zones to track where zone came from
ALTER TABLE public.zones 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'seed' CHECK (source IN ('seed', 'osm', 'user'));

-- Add submitted_at for user-submitted zones
ALTER TABLE public.zones 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Add device_hash for tracking who submitted (anonymous)
ALTER TABLE public.zones 
ADD COLUMN IF NOT EXISTS submitted_by TEXT;

-- Allow users to insert new zones
CREATE POLICY "Users can submit new zones"
ON public.zones
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_zones_source ON public.zones(source);
CREATE INDEX IF NOT EXISTS idx_zones_geohash ON public.zones(geohash_prefix);