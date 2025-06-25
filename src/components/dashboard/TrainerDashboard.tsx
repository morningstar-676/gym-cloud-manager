
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrainerDashboardProps {
  user: User;
  profile: any;
}

const TrainerDashboard = ({ user, profile }: TrainerDashboardProps) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    todayClasses: 0,
    weeklyAttendance: 0,
    activeWorkoutPlans: 0
  });
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainerStats();
    fetchRecentClasses();
  }, [user.id]);

  const fetchTrainerStats = async () => {
    try {
      // Get members assigned to this trainer (through workout programs)
      const { count: memberCount } = await supabase
        .from('workout_programs')
        .select('member_id', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .eq('is_active', true);

      // Get today's classes
      const today = new Date().toISOString().split('T')[0];
      const { count: todayClassCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .eq('class_date', today);

      // Get this week's attendance for trainer's classes
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weeklyAttendanceCount } = await supabase
        .from('class_bookings')
        .select(`
          *,
          classes!inner (trainer_id)
        `, { count: 'exact', head: true })
        .eq('classes.trainer_id', user.id)
        .gte('booked_at', weekAgo.toISOString())
        .eq('status', 'confirmed');

      // Get active workout plans
      const { count: workoutPlanCount } = await supabase
        .from('workout_programs')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .eq('is_active', true);

      setStats({
        totalMembers: memberCount || 0,
        todayClasses: todayClassCount || 0,
        weeklyAttendance: weeklyAttendanceCount || 0,
        activeWorkoutPlans: workoutPlanCount || 0
      });
    } catch (error) {
      console.error('Error fetching trainer stats:', error);
    }
  };

  const fetchRecentClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          branches (name),
          class_bookings (id, status)
        `)
        .eq('trainer_id', user.id)
        .gte('class_date', new Date().toISOString().split('T')[0])
        .order('class_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      setRecentClasses(data || []);
    } catch (error) {
      console.error('Error fetching recent classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.first_name}!
        </h2>
        <p className="text-gray-600">Here's your trainer dashboard overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Members with active plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayClasses}</div>
            <p className="text-xs text-muted-foreground">
              Classes scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Attendance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyAttendance}</div>
            <p className="text-xs text-muted-foreground">
              Class bookings this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkoutPlans}</div>
            <p className="text-xs text-muted-foreground">
              Workout plans assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>Your scheduled classes for today and upcoming days</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading classes...
            </div>
          ) : recentClasses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{classItem.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(classItem.class_date).toLocaleDateString()} at {classItem.start_time}
                    </p>
                    <p className="text-sm text-gray-500">
                      {classItem.branches?.name} • {classItem.current_bookings || 0}/{classItem.max_capacity} booked
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {classItem.class_bookings?.length || 0} bookings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Manage Members</span>
            </CardTitle>
            <CardDescription>View and manage your assigned members</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Classes</span>
            </CardTitle>
            <CardDescription>Create and manage your class schedule</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5" />
              <span>Workout Plans</span>
            </CardTitle>
            <CardDescription>Create and assign workout programs</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default TrainerDashboard;
