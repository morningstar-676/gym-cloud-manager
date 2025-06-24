
-- Create enum types for roles and subscription tiers
CREATE TYPE public.user_role AS ENUM ('super_admin', 'gym_admin', 'trainer', 'staff', 'member');
CREATE TYPE public.subscription_tier AS ENUM ('startup', 'growth', 'enterprise');
CREATE TYPE public.class_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');
CREATE TYPE public.content_type AS ENUM ('video', 'pdf', 'image', 'document');

-- Core gyms table for multi-tenancy
CREATE TABLE public.gyms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#1e40af',
  banner_url TEXT,
  custom_domain TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier subscription_tier NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  max_branches INTEGER,
  max_members INTEGER,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gym subscriptions
CREATE TABLE public.gym_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'member',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  qr_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Member subscriptions
CREATE TABLE public.member_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  class_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER DEFAULT 20,
  current_bookings INTEGER DEFAULT 0,
  status class_status DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Class bookings
CREATE TABLE public.class_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  status booking_status DEFAULT 'confirmed',
  booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(class_id, member_id)
);

-- Content library
CREATE TABLE public.content_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workout programs
CREATE TABLE public.workout_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  program_data JSONB NOT NULL DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attendance tracking
CREATE TABLE public.attendance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  scanned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT
);

-- Audit logs for security
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, price, max_branches, max_members, features) VALUES
('Startup Plan', 'startup', 29.00, 1, 50, '{"qr_checkin": false, "class_booking": true, "content_library": false, "export_reports": false, "communication": false, "custom_branding": false}'),
('Growth Plan', 'growth', 79.00, 3, 500, '{"qr_checkin": true, "class_booking": true, "content_library": true, "export_reports": true, "communication": true, "custom_branding": false}'),
('Enterprise Plan', 'enterprise', 199.00, null, null, '{"qr_checkin": true, "class_booking": true, "content_library": true, "export_reports": true, "communication": true, "custom_branding": true}');

-- Enable Row Level Security on all tables
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's gym_id
CREATE OR REPLACE FUNCTION public.get_current_user_gym_id()
RETURNS UUID AS $$
  SELECT gym_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = _role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT public.has_role('super_admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for multi-tenant isolation

-- Gyms policies
CREATE POLICY "Super admins can view all gyms" ON public.gyms FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Gym admins can view their gym" ON public.gyms FOR SELECT USING (id = public.get_current_user_gym_id());
CREATE POLICY "Super admins can manage all gyms" ON public.gyms FOR ALL USING (public.is_super_admin());
CREATE POLICY "Gym admins can update their gym" ON public.gyms FOR UPDATE USING (id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));

-- Subscription plans policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins can manage plans" ON public.subscription_plans FOR ALL USING (public.is_super_admin());

-- Gym subscriptions policies
CREATE POLICY "Super admins can view all gym subscriptions" ON public.gym_subscriptions FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Gym users can view their gym subscription" ON public.gym_subscriptions FOR SELECT USING (gym_id = public.get_current_user_gym_id());
CREATE POLICY "Super admins can manage gym subscriptions" ON public.gym_subscriptions FOR ALL USING (public.is_super_admin());

-- Branches policies
CREATE POLICY "Gym users can view their branches" ON public.branches FOR SELECT USING (gym_id = public.get_current_user_gym_id());
CREATE POLICY "Gym admins can manage their branches" ON public.branches FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Gym staff can view gym profiles" ON public.profiles FOR SELECT USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin') OR public.has_role('trainer') OR public.has_role('staff'));
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Gym admins can manage gym profiles" ON public.profiles FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));
CREATE POLICY "Super admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_super_admin());

-- Member subscriptions policies
CREATE POLICY "Members can view their subscriptions" ON public.member_subscriptions FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Gym staff can view gym member subscriptions" ON public.member_subscriptions FOR SELECT USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('staff')));
CREATE POLICY "Gym admins can manage member subscriptions" ON public.member_subscriptions FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));

-- Classes policies
CREATE POLICY "Gym users can view gym classes" ON public.classes FOR SELECT USING (gym_id = public.get_current_user_gym_id());
CREATE POLICY "Trainers and admins can manage classes" ON public.classes FOR ALL USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('trainer')));

-- Class bookings policies
CREATE POLICY "Members can view their bookings" ON public.class_bookings FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Gym staff can view gym bookings" ON public.class_bookings FOR SELECT USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('trainer') OR public.has_role('staff')));
CREATE POLICY "Members can manage their bookings" ON public.class_bookings FOR ALL USING (member_id = auth.uid() AND gym_id = public.get_current_user_gym_id());
CREATE POLICY "Gym staff can manage gym bookings" ON public.class_bookings FOR ALL USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('trainer') OR public.has_role('staff')));

-- Content library policies
CREATE POLICY "Gym users can view gym content" ON public.content_library FOR SELECT USING (gym_id = public.get_current_user_gym_id());
CREATE POLICY "Trainers and admins can manage content" ON public.content_library FOR ALL USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('trainer')));

-- Workout programs policies
CREATE POLICY "Members can view their programs" ON public.workout_programs FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Trainers can view their assigned programs" ON public.workout_programs FOR SELECT USING (trainer_id = auth.uid());
CREATE POLICY "Gym staff can view gym programs" ON public.workout_programs FOR SELECT USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('staff')));
CREATE POLICY "Trainers can manage their programs" ON public.workout_programs FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.has_role('trainer'));
CREATE POLICY "Gym admins can manage all programs" ON public.workout_programs FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));

-- Attendance logs policies
CREATE POLICY "Members can view their attendance" ON public.attendance_logs FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Gym staff can view gym attendance" ON public.attendance_logs FOR SELECT USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('trainer') OR public.has_role('staff')));
CREATE POLICY "Gym staff can manage attendance" ON public.attendance_logs FOR ALL USING (gym_id = public.get_current_user_gym_id() AND (public.has_role('gym_admin') OR public.has_role('staff')));

-- Audit logs policies (admin only)
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Gym admins can view their gym audit logs" ON public.audit_logs FOR SELECT USING (gym_id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate QR code for members
CREATE OR REPLACE FUNCTION public.generate_member_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'member' AND NEW.qr_code IS NULL THEN
    NEW.qr_code := 'QR_' || NEW.id || '_' || extract(epoch from now())::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate QR code for new members
CREATE TRIGGER generate_qr_code_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'member')
  EXECUTE FUNCTION public.generate_member_qr_code();
