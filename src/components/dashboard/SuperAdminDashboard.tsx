
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, DollarSign, TrendingUp, Shield, Crown } from "lucide-react";

interface SuperAdminDashboardProps {
  user: User;
  profile: any;
}

const SuperAdminDashboard = ({ user, profile }: SuperAdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalGyms: 0,
    totalMembers: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
  });
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);

      const [gymsResult, profilesResult, subscriptionsResult] = await Promise.all([
        supabase.from('gyms').select('*, gym_subscriptions(*, subscription_plans(*))'),
        supabase.from('profiles').select('*'),
        supabase.from('gym_subscriptions').select('*, subscription_plans(*)').eq('is_active', true)
      ]);

      const totalMembers = profilesResult.data?.filter(p => p.role === 'member').length || 0;
      const monthlyRevenue = subscriptionsResult.data?.reduce((sum, sub) => sum + (sub.subscription_plans?.price || 0), 0) || 0;

      setStats({
        totalGyms: gymsResult.data?.length || 0,
        totalMembers,
        monthlyRevenue,
        activeSubscriptions: subscriptionsResult.data?.length || 0,
      });

      setGyms(gymsResult.data || []);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Crown className="h-6 w-6 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h2>
        </div>
        <p className="text-gray-600">Platform-wide analytics and gym management</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gyms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGyms}</div>
            <p className="text-xs text-muted-foreground">Registered gym partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all gyms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Paying gym subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Gyms List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Registered Gyms</span>
          </CardTitle>
          <CardDescription>All gyms registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gyms.length > 0 ? (
              gyms.map((gym) => (
                <div key={gym.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{gym.name}</h3>
                      <p className="text-sm text-gray-600">{gym.email}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(gym.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={gym.is_active ? "default" : "secondary"}>
                      {gym.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {gym.gym_subscriptions?.[0] && (
                      <p className="text-sm text-gray-600 mt-1">
                        {gym.gym_subscriptions[0].subscription_plans?.name}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No gyms registered yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
