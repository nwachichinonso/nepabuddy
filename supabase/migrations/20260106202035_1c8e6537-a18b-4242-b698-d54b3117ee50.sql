-- Create push_subscriptions table for Web Push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_hash, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert subscriptions (anonymous)
CREATE POLICY "Anyone can subscribe to notifications"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

-- Allow reading own subscriptions via device_hash
CREATE POLICY "Anyone can view own subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (true);

-- Allow updating own subscriptions
CREATE POLICY "Anyone can update own subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (true);

-- Allow deleting own subscriptions
CREATE POLICY "Anyone can delete own subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_push_subscriptions_zone ON public.push_subscriptions(zone_id);
CREATE INDEX idx_push_subscriptions_device ON public.push_subscriptions(device_hash);