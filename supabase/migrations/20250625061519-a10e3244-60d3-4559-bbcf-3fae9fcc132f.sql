
-- Add gym_code to gyms table and member_code to profiles
ALTER TABLE public.gyms ADD COLUMN gym_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN member_code TEXT UNIQUE;

-- Function to generate gym count based on gym_code
CREATE OR REPLACE FUNCTION public.get_gym_count_for_code(code TEXT)
RETURNS INTEGER AS $$
DECLARE
  max_count INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(gym_code FROM LENGTH(code) + 1) AS INTEGER)), 0)
  INTO max_count
  FROM public.gyms 
  WHERE gym_code LIKE code || '%' 
  AND LENGTH(gym_code) > LENGTH(code);
  
  RETURN COALESCE(max_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to generate member code
CREATE OR REPLACE FUNCTION public.generate_member_code(gym_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  gym_code_val TEXT;
  member_count INTEGER;
  new_member_code TEXT;
BEGIN
  -- Get gym code
  SELECT gym_code INTO gym_code_val FROM public.gyms WHERE id = gym_id_param;
  
  -- Get next member number for this gym
  SELECT COALESCE(MAX(CAST(SPLIT_PART(member_code, '.', 2) AS INTEGER)), 0) + 1
  INTO member_count
  FROM public.profiles 
  WHERE gym_id = gym_id_param AND member_code IS NOT NULL;
  
  -- Generate member code (e.g., bs1.1, bs1.2, etc.)
  new_member_code := gym_code_val || '.' || member_count::TEXT;
  
  RETURN new_member_code;
END;
$$ LANGUAGE plpgsql;

-- Update the QR code generation function to also generate member codes
CREATE OR REPLACE FUNCTION public.generate_member_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'member' AND NEW.qr_code IS NULL THEN
    NEW.qr_code := 'QR_' || NEW.id || '_' || extract(epoch from now())::text;
  END IF;
  
  -- Generate member code if gym_id is set and member_code is null
  IF NEW.gym_id IS NOT NULL AND NEW.member_code IS NULL AND NEW.role = 'member' THEN
    NEW.member_code := public.generate_member_code(NEW.gym_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add storage bucket for content library
INSERT INTO storage.buckets (id, name, public) VALUES ('gym-content', 'gym-content', true);

-- Storage policies for gym content
CREATE POLICY "Gym users can view their content" ON storage.objects 
FOR SELECT USING (bucket_id = 'gym-content');

CREATE POLICY "Gym admins can manage their content" ON storage.objects 
FOR ALL USING (bucket_id = 'gym-content');

-- Add notifications table for communication
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.notifications 
FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Gym admins can manage gym notifications" ON public.notifications 
FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));

-- Add default workout plans table
CREATE TABLE public.default_workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  plan_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.default_workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym users can view gym default plans" ON public.default_workout_plans 
FOR SELECT USING (gym_id = public.get_current_user_gym_id());

CREATE POLICY "Gym admins can manage default plans" ON public.default_workout_plans 
FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));
