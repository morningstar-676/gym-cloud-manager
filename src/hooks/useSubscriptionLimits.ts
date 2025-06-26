
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionLimits {
  canAddMembers: boolean;
  canAddBranches: boolean;
  canUseFeature: (feature: string) => boolean;
  memberCount: number;
  memberLimit: number | null;
  planName: string;
}

export const useSubscriptionLimits = (gymId: string) => {
  const [limits, setLimits] = useState<SubscriptionLimits>({
    canAddMembers: true,
    canAddBranches: true,
    canUseFeature: () => true,
    memberCount: 0,
    memberLimit: null,
    planName: 'Free'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!gymId) return;
    
    checkSubscriptionLimits();
  }, [gymId]);

  const checkSubscriptionLimits = async () => {
    try {
      // Get current subscription and plan
      const { data: subscription, error: subError } = await supabase
        .from('gym_subscriptions')
        .select(`
          *,
          subscription_plans (
            name, max_members, max_branches, features
          )
        `)
        .eq('gym_id', gymId)
        .eq('is_active', true)
        .single();

      if (subError) {
        console.error('Subscription error:', subError);
        return;
      }

      // Get current member count
      const { count: memberCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .eq('role', 'member');

      if (countError) {
        console.error('Count error:', countError);
        return;
      }

      const plan = subscription?.subscription_plans;
      const currentMemberCount = memberCount || 0;

      setLimits({
        canAddMembers: !plan?.max_members || currentMemberCount < plan.max_members,
        canAddBranches: true, // Implement branch count check if needed
        canUseFeature: (feature: string) => {
          return plan?.features?.[feature] === true;
        },
        memberCount: currentMemberCount,
        memberLimit: plan?.max_members,
        planName: plan?.name || 'Free'
      });

    } catch (error) {
      console.error('Error checking subscription limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const showUpgradePrompt = (feature: string) => {
    toast({
      title: "Upgrade Required",
      description: `This feature (${feature}) requires a higher subscription plan. Please upgrade to continue.`,
      variant: "destructive",
    });
  };

  return { limits, loading, checkSubscriptionLimits, showUpgradePrompt };
};
