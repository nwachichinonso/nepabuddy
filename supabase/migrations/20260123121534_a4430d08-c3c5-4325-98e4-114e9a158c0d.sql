-- Create profiles table for user data and daily indication tracking
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  default_location TEXT,
  daily_indication_count INTEGER NOT NULL DEFAULT 0,
  last_indication_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create locations table for aggregated power status by location string
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_string TEXT NOT NULL,
  normalized_string TEXT NOT NULL,
  on_count INTEGER NOT NULL DEFAULT 0,
  off_count INTEGER NOT NULL DEFAULT 0,
  total_reports INTEGER NOT NULL DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster location lookups
CREATE INDEX idx_locations_normalized ON public.locations(normalized_string);

-- Enable RLS on locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Anyone can view locations
CREATE POLICY "Anyone can view locations" 
ON public.locations FOR SELECT 
USING (true);

-- Create indications table for user power status reports
CREATE TABLE public.indications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id),
  location_string TEXT NOT NULL,
  status BOOLEAN NOT NULL, -- true = power ON, false = power OFF
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on indications
ALTER TABLE public.indications ENABLE ROW LEVEL SECURITY;

-- Users can view their own indications
CREATE POLICY "Users can view their own indications" 
ON public.indications FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own indications
CREATE POLICY "Users can insert their own indications" 
ON public.indications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id),
  location_string TEXT NOT NULL,
  complaint_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Users can view their own complaints
CREATE POLICY "Users can view their own complaints" 
ON public.complaints FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own complaints
CREATE POLICY "Users can insert their own complaints" 
ON public.complaints FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Anyone can view anonymized complaint counts per location
CREATE POLICY "Anyone can view complaint counts" 
ON public.complaints FOR SELECT 
USING (true);

-- Function to update profiles timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to normalize location strings for matching
CREATE OR REPLACE FUNCTION public.normalize_location(loc TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(TRIM(REGEXP_REPLACE(loc, '[^a-zA-Z0-9\s]', '', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Function to update location aggregates when indication is inserted
CREATE OR REPLACE FUNCTION public.update_location_aggregates()
RETURNS TRIGGER AS $$
DECLARE
  loc_id UUID;
  norm_str TEXT;
BEGIN
  norm_str := public.normalize_location(NEW.location_string);
  
  -- Find or create location
  SELECT id INTO loc_id FROM public.locations WHERE normalized_string = norm_str LIMIT 1;
  
  IF loc_id IS NULL THEN
    INSERT INTO public.locations (location_string, normalized_string, on_count, off_count, total_reports)
    VALUES (NEW.location_string, norm_str, 
            CASE WHEN NEW.status THEN 1 ELSE 0 END,
            CASE WHEN NOT NEW.status THEN 1 ELSE 0 END,
            1)
    RETURNING id INTO loc_id;
  ELSE
    UPDATE public.locations 
    SET on_count = on_count + CASE WHEN NEW.status THEN 1 ELSE 0 END,
        off_count = off_count + CASE WHEN NOT NEW.status THEN 1 ELSE 0 END,
        total_reports = total_reports + 1,
        confidence = LEAST(100, (total_reports + 1) * 10),
        last_updated = now()
    WHERE id = loc_id;
  END IF;
  
  NEW.location_id := loc_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update aggregates on new indication
CREATE TRIGGER on_indication_insert
BEFORE INSERT ON public.indications
FOR EACH ROW
EXECUTE FUNCTION public.update_location_aggregates();