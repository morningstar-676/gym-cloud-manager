
-- Drop existing conflicting policies for gyms table
DROP POLICY IF EXISTS "Users can view their own gym" ON public.gyms;
DROP POLICY IF EXISTS "Gym admins can update their gym" ON public.gyms;
DROP POLICY IF EXISTS "Gym admins can view their gym" ON public.gyms;
DROP POLICY IF EXISTS "Super admins can view all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Super admins can manage all gyms" ON public.gyms;

-- Create proper RLS policies for gyms table
CREATE POLICY "Authenticated users can create gyms" ON public.gyms 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view their own gym" ON public.gyms 
FOR SELECT USING (id = public.get_current_user_gym_id() OR public.has_role('super_admin'));

CREATE POLICY "Gym admins can update their gym" ON public.gyms 
FOR UPDATE USING (id = public.get_current_user_gym_id() AND public.has_role('gym_admin'));

CREATE POLICY "Super admins can manage all gyms" ON public.gyms 
FOR ALL USING (public.has_role('super_admin'));
