
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, LogOut } from "lucide-react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import GymAdminDashboard from "./GymAdminDashboard";
import TrainerDashboard from "./TrainerDashboard";
import StaffDashboard from "./StaffDashboard";
import MemberDashboard from "./MemberDashboard";

interface DashboardProps {
  user: User;
  profile: any;
}

const Dashboard = ({ user, profile }: DashboardProps) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderDashboard = () => {
    switch (profile.role) {
      case 'super_admin':
        return <SuperAdminDashboard user={user} profile={profile} />;
      case 'gym_admin':
        return <GymAdminDashboard user={user} profile={profile} />;
      case 'trainer':
        return <TrainerDashboard user={user} profile={profile} />;
      case 'staff':
        return <StaffDashboard user={user} profile={profile} />;
      case 'member':
        return <MemberDashboard user={user} profile={profile} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile.gyms?.name || 'GymCloud'}
              </h1>
              <p className="text-sm text-gray-500 capitalize">
                {profile.role.replace('_', ' ')} Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
