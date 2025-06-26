
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import LandingPage from "./LandingPage";
import AuthPage from "./auth/AuthPage";
import GymRegistration from "./auth/GymRegistration";
import Dashboard from "./dashboard/Dashboard";

const Layout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *, 
          gyms (
            id, name, gym_code, email, phone, logo_url, theme_color,
            address, city, state, country, postal_code
          ), 
          branches (
            id, name, address, city, state, phone, email
          ),
          member_subscriptions (
            id, start_date, end_date, is_active, plan_name
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!userProfile) {
    return <AuthPage user={user} onProfileCreated={setUserProfile} />;
  }

  // If user has no gym_id, they need to register or join a gym
  if (!userProfile.gym_id) {
    return <GymRegistration user={user} profile={userProfile} onGymRegistered={setUserProfile} />;
  }

  return <Dashboard user={user} profile={userProfile} onProfileUpdate={setUserProfile} />;
};

export default Layout;
