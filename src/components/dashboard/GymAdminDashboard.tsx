
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Building2, 
  Calendar, 
  BarChart3, 
  QrCode, 
  Settings,
  UserPlus,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Crown
} from "lucide-react";

interface GymAdminDashboardProps {
  user: User;
  profile: any;
}

const GymAdminDashboard = ({ user, profile }: GymAdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalBranches: 0,
    todayAttendance: 0,
    thisMonthRevenue: 0,
    upcomingClasses: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [gymSubscription, setGymSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [profile.gym_id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch gym stats
      const [
        membersResult,
        branchesResult,
        attendanceResult,
        subscriptionsResult,
        classesResult,
        gymSubResult
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('gym_id', profile.gym_id).eq('role', 'member'),
        supabase.from('branches').select('*').eq('gym_id', profile.gym_id),
        supabase.from('attendance_logs').select('*').eq('gym_id', profile.gym_id).gte('check_in_time', new Date().toISOString().split('T')[0]),
        supabase.from('member_subscriptions').select('*').eq('gym_id', profile.gym_id).eq('is_active', true),
        supabase.from('classes').select('*').eq('gym_id', profile.gym_id).gte('class_date', new Date().toISOString().split('T')[0]),
        supabase.from('gym_subscriptions').select('*, subscription_plans(*)').eq('gym_id', profile.gym_id).eq('is_active', true).single()
      ]);

      const activeMembers = subscriptionsResult.data?.filter(sub => 
        new Date(sub.end_date || '9999-12-31') > new Date()
      ).length || 0;

      const thisMonthRevenue = subscriptionsResult.data?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0;

      setStats({
        totalMembers: membersResult.data?.length || 0,
        activeMembers,
        totalBranches: branchesResult.data?.length || 0,
        todayAttendance: attendanceResult.data?.length || 0,
        thisMonthRevenue,
        upcomingClasses: classesResult.data?.length || 0,
      });

      setGymSubscription(gymSubResult.data);

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('attendance_logs')
        .select('*, profiles(first_name, last_name), branches(name)')
        .eq('gym_id', profile.gym_id)
        .order('check_in_time', { ascending: false })
        .limit(10);

      setRecentActivity(activity || []);

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

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

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
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.first_name}! 👋
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Here's what's happening at {profile.gyms?.name} today.
          </p>
          {gymSubscription && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Crown className="h-3 w-3" />
              <span>{gymSubscription.subscription_plans?.name}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          description={`${stats.activeMembers} active memberships`}
          trend="+12% from last month"
        />
        <StatCard
          title="Branches"
          value={stats.totalBranches}
          icon={Building2}
          description="Across all locations"
        />
        <StatCard
          title="Today's Check-ins"
          value={stats.todayAttendance}
          icon={CheckCircle}
          description="Member visits today"
          trend="+5% from yesterday"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.thisMonthRevenue.toLocaleString()}`}
          icon={BarChart3}
          description="From active subscriptions"
          trend="+8% from last month"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Button className="h-16 flex-col">
          <UserPlus className="h-5 w-5 mb-1" />
          Add Member
        </Button>
        <Button variant="outline" className="h-16 flex-col">
          <Plus className="h-5 w-5 mb-1" />
          New Class
        </Button>
        <Button variant="outline" className="h-16 flex-col">
          <QrCode className="h-5 w-5 mb-1" />
          QR Scanner
        </Button>
        <Button variant="outline" className="h-16 flex-col">
          <MapPin className="h-5 w-5 mb-1" />
          Manage Branches
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest member check-ins and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 6).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {activity.profiles?.first_name} {activity.profiles?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Checked in at {activity.branches?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(activity.check_in_time).toLocaleTimeString()}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Check-in
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Today's Classes</span>
                </CardTitle>
                <CardDescription>Scheduled classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No classes scheduled for today</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Class
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>Manage your gym members and their subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Member Management</h3>
                <p className="mb-4">View, add, and manage all your gym members</p>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Class Management</CardTitle>
              <CardDescription>Schedule and manage fitness classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Class Scheduling</h3>
                <p className="mb-4">Create and manage fitness classes for your members</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Class
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>View detailed insights about your gym performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="mb-4">Get insights into member behavior, revenue, and more</p>
                <Button variant="outline">
                  View Full Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Gym Settings</CardTitle>
              <CardDescription>Manage your gym profile, branding, and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Gym Configuration</h3>
                <p className="mb-4">Update gym details, branding, and subscription settings</p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Open Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GymAdminDashboard;
