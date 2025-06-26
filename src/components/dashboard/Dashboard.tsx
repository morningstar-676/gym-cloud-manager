
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Dumbbell, 
  LogOut, 
  Users, 
  Calendar, 
  QrCode, 
  Activity, 
  UserPlus, 
  BarChart3,
  Settings,
  Home,
  Library,
  Bell,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SuperAdminDashboard from "./SuperAdminDashboard";
import GymAdminDashboard from "./GymAdminDashboard";
import TrainerDashboard from "./TrainerDashboard";
import StaffDashboard from "./StaffDashboard";
import MemberDashboard from "./MemberDashboard";
import MemberManagement from "../members/MemberManagement";
import ClassManagement from "../classes/ClassManagement";
import QRScanner from "../scanner/QRScanner";
import WorkoutPlanManagement from "../workouts/WorkoutPlanManagement";
import AttendanceTracking from "../attendance/AttendanceTracking";
import NotificationCenter from "../notifications/NotificationCenter";
import SubscriptionGuard from "../subscription/SubscriptionGuard";
import ContentLibrary from "../content/ContentLibrary";
import ReportsSection from "../reports/ReportsSection";

interface DashboardProps {
  user: User;
  profile: any;
  onProfileUpdate?: (profile: any) => void;
}

const Dashboard = ({ user, profile, onProfileUpdate }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showLandingPage, setShowLandingPage] = useState(false);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500';
      case 'gym_admin': return 'bg-blue-500';
      case 'trainer': return 'bg-green-500';
      case 'staff': return 'bg-orange-500';
      case 'member': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Overview', icon: Home }
    ];

    switch (profile.role) {
      case 'super_admin':
        return [
          ...baseItems,
          { id: 'members', label: 'All Members', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ];
      
      case 'gym_admin':
        return [
          ...baseItems,
          { id: 'members', label: 'Members', icon: Users },
          { id: 'classes', label: 'Classes', icon: Calendar },
          { id: 'workouts', label: 'Workout Plans', icon: Dumbbell },
          { id: 'content', label: 'Content Library', icon: Library },
          { id: 'attendance', label: 'Attendance', icon: Activity },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'scanner', label: 'QR Scanner', icon: QrCode }
        ];
      
      case 'trainer':
        return [
          ...baseItems,
          { id: 'members', label: 'My Members', icon: Users },
          { id: 'classes', label: 'My Classes', icon: Calendar },
          { id: 'workouts', label: 'Workout Plans', icon: Dumbbell },
          { id: 'content', label: 'Content Library', icon: Library },
          { id: 'attendance', label: 'Attendance', icon: Activity }
        ];
      
      case 'staff':
        return [
          ...baseItems,
          { id: 'scanner', label: 'QR Scanner', icon: QrCode },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: Activity }
        ];
      
      case 'member':
        return [
          ...baseItems,
          { id: 'classes', label: 'Classes', icon: Calendar },
          { id: 'workouts', label: 'My Workouts', icon: Dumbbell },
          { id: 'content', label: 'Content Library', icon: Library },
          { id: 'attendance', label: 'My Attendance', icon: Activity },
          { id: 'reports', label: 'My Reports', icon: BarChart3 }
        ];
      
      default:
        return baseItems;
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      gymId: profile.gym_id,
      userRole: profile.role,
      userId: user.id,
      userProfile: profile
    };

    const protectedFeatures = ['classes', 'workouts', 'content', 'reports'];
    const requiresSubscriptionGuard = protectedFeatures.includes(activeTab) && profile.role === 'member';

    const content = (() => {
      switch (activeTab) {
        case 'overview':
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
        
        case 'members':
          return <MemberManagement {...commonProps} />;
        
        case 'classes':
          return <ClassManagement {...commonProps} />;
        
        case 'scanner':
          return (
            <QRScanner 
              gymId={profile.gym_id}
              branchId={profile.branch_id || profile.gyms?.branches?.[0]?.id || ''}
              scannedBy={user.id}
            />
          );
        
        case 'workouts':
          return <WorkoutPlanManagement {...commonProps} />;
        
        case 'content':
          return <ContentLibrary {...commonProps} />;
        
        case 'attendance':
          return <AttendanceTracking {...commonProps} />;
        
        case 'reports':
          return <ReportsSection {...commonProps} />;
        
        default:
          return <div>Content not found</div>;
      }
    })();

    return requiresSubscriptionGuard ? (
      <SubscriptionGuard userProfile={profile} feature={activeTab}>
        {content}
      </SubscriptionGuard>
    ) : content;
  };

  if (showLandingPage) {
    // This would show the landing page - implement navigation back logic
    return <div>Landing Page</div>;
  }

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLandingPage(true)}
              className="p-2 hover:bg-purple-600/20"
            >
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profile.gyms?.name || 'GymCloud'}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className={`${getRoleColor(profile.role)} text-white`}>
                  {profile.role.replace('_', ' ').toUpperCase()}
                </Badge>
                {profile.gyms?.gym_code && (
                  <Badge variant="outline" className="border-purple-400 text-purple-300">
                    Gym: {profile.gyms.gym_code}
                  </Badge>
                )}
                {profile.member_code && (
                  <Badge variant="outline" className="border-purple-400 text-purple-300">
                    Member: {profile.member_code}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationCenter userId={user.id} gymId={profile.gym_id} />
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs text-purple-300">{profile.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-purple-400 text-purple-300 hover:bg-purple-600/20">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-purple-500/20 bg-slate-800/50">
          <div className="px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 py-3 px-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? 'border-purple-400 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-purple-300 hover:border-purple-500/50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
