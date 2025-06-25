
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Download, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceTrackingProps {
  gymId: string;
  userRole: string;
  userId: string;
}

const AttendanceTracking = ({ gymId, userRole, userId }: AttendanceTrackingProps) => {
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    currentlyInside: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceData();
    fetchStats();
  }, [gymId, dateFilter, selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      let query = supabase
        .from('attendance_logs')
        .select(`
          *,
          profiles!attendance_logs_member_id_fkey (
            id, first_name, last_name, member_code
          ),
          branches (id, name),
          scanned_by_profile:profiles!attendance_logs_scanned_by_fkey (
            first_name, last_name
          )
        `)
        .eq('gym_id', gymId)
        .order('check_in_time', { ascending: false });

      // Apply date filters
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('check_in_time', `${today}T00:00:00`);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('check_in_time', weekAgo.toISOString());
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('check_in_time', monthAgo.toISOString());
      } else if (dateFilter === 'custom') {
        query = query.gte('check_in_time', `${selectedDate}T00:00:00`)
                   .lt('check_in_time', `${selectedDate}T23:59:59`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setAttendanceLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Today's attendance
      const { count: todayCount } = await supabase
        .from('attendance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .gte('check_in_time', `${today}T00:00:00`);

      // This week's attendance
      const { count: weekCount } = await supabase
        .from('attendance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .gte('check_in_time', weekAgo.toISOString());

      // This month's attendance
      const { count: monthCount } = await supabase
        .from('attendance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .gte('check_in_time', monthAgo.toISOString());

      // Currently inside (checked in but not checked out today)
      const { count: insideCount } = await supabase
        .from('attendance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .gte('check_in_time', `${today}T00:00:00`)
        .is('check_out_time', null);

      setStats({
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        thisMonth: monthCount || 0,
        currentlyInside: insideCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return 'Still inside';
    
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const duration = checkOutTime.getTime() - checkInTime.getTime();
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const exportAttendance = () => {
    // Create CSV content
    const headers = ['Date', 'Member', 'Member Code', 'Check In', 'Check Out', 'Duration', 'Branch'];
    const csvContent = [
      headers.join(','),
      ...attendanceLogs.map(log => [
        new Date(log.check_in_time).toLocaleDateString(),
        `${log.profiles.first_name} ${log.profiles.last_name}`,
        log.profiles.member_code,
        new Date(log.check_in_time).toLocaleTimeString(),
        log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString() : 'Still inside',
        formatDuration(log.check_in_time, log.check_out_time),
        log.branches?.name || 'N/A'
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Attendance Tracking</h2>
          <p className="text-gray-600">Monitor gym attendance and member activity</p>
        </div>
        <Button onClick={exportAttendance} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              visits today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">
              visits this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              visits this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Inside</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.currentlyInside}</div>
            <p className="text-xs text-muted-foreground">
              members in gym
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div>
              <Label htmlFor="dateFilter">Time Period</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilter === 'custom' && (
              <div>
                <Label htmlFor="customDate">Select Date</Label>
                <Input
                  id="customDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Logs</CardTitle>
          <CardDescription>
            Member check-in and check-out records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Scanned By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading attendance data...
                  </TableCell>
                </TableRow>
              ) : attendanceLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-gray-500">No attendance records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                attendanceLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {log.profiles.first_name} {log.profiles.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.profiles.member_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(log.check_in_time).toLocaleDateString()}</p>
                        <p className="text-gray-500">{new Date(log.check_in_time).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.check_out_time ? (
                        <div className="text-sm">
                          <p>{new Date(log.check_out_time).toLocaleDateString()}</p>
                          <p className="text-gray-500">{new Date(log.check_out_time).toLocaleTimeString()}</p>
                        </div>
                      ) : (
                        <Badge variant="outline">Still inside</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.check_out_time ? 'secondary' : 'default'}>
                        {formatDuration(log.check_in_time, log.check_out_time)}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.branches?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {log.scanned_by_profile ? 
                        `${log.scanned_by_profile.first_name} ${log.scanned_by_profile.last_name}` : 
                        'Self'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.check_out_time ? 'secondary' : 'default'}>
                        {log.check_out_time ? 'Completed' : 'In Progress'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracking;
