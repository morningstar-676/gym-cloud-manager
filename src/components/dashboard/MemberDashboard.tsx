
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Activity, PlayCircle, QrCode } from "lucide-react";

interface MemberDashboardProps {
  user: User;
  profile: any;
}

const MemberDashboard = ({ user, profile }: MemberDashboardProps) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.first_name}! 💪
        </h2>
        <p className="text-gray-600">Track your fitness journey and book classes</p>
        
        {/* QR Code Display */}
        {profile.qr_code && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <div className="flex items-center space-x-3">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Your QR Code</p>
                <p className="text-xs text-blue-600 font-mono">{profile.qr_code}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>My Classes</span>
            </CardTitle>
            <CardDescription>Booked fitness classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No classes booked</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Workout Plans</span>
            </CardTitle>
            <CardDescription>Your assigned programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workout plans assigned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5" />
              <span>Content Library</span>
            </CardTitle>
            <CardDescription>Workout videos & guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Attendance</span>
            </CardTitle>
            <CardDescription>Your check-in history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No check-ins yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
