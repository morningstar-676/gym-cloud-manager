
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Calendar as CalendarIcon, Users, Activity, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ReportsSectionProps {
  gymId: string;
  userRole: string;
  userId: string;
  userProfile: any;
}

const ReportsSection = ({ gymId, userRole, userId, userProfile }: ReportsSectionProps) => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [memberStats, setMemberStats] = useState({
    totalMembers: 0,
    activeThisMonth: 0,
    newThisMonth: 0
  });
  const [selectedDateRange, setSelectedDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportsData();
  }, [gymId, selectedDateRange, reportType]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      if (reportType === 'attendance') {
        await fetchAttendanceData();
      } else if (reportType === 'members') {
        await fetchMemberStats();
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    const query = supabase
      .from('attendance_logs')
      .select(`
        *,
        profiles:member_id (first_name, last_name, member_code)
      `)
      .eq('gym_id', gymId)
      .gte('check_in_time', selectedDateRange.from.toISOString())
      .lte('check_in_time', selectedDateRange.to.toISOString());

    // If user is a member, only show their own attendance
    if (userRole === 'member') {
      query.eq('member_id', userId);
    }

    const { data, error } = await query.order('check_in_time', { ascending: false });
    
    if (error) throw error;
    setAttendanceData(data || []);
  };

  const fetchMemberStats = async () => {
    if (userRole === 'member') return;

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // Total members
    const { count: totalMembers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .eq('role', 'member');

    // Active this month (checked in at least once)
    const { data: activeMembers } = await supabase
      .from('attendance_logs')
      .select('member_id')
      .eq('gym_id', gymId)
      .gte('check_in_time', startOfMonth.toISOString());

    const uniqueActiveMembers = new Set(activeMembers?.map(log => log.member_id)).size;

    // New members this month
    const { count: newMembers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .eq('role', 'member')
      .gte('created_at', startOfMonth.toISOString());

    setMemberStats({
      totalMembers: totalMembers || 0,
      activeThisMonth: uniqueActiveMembers,
      newThisMonth: newMembers || 0
    });
  };

  const exportToCSV = () => {
    if (reportType === 'attendance' && attendanceData.length > 0) {
      const headers = ['Date', 'Member Name', 'Member Code', 'Check In', 'Check Out', 'Duration'];
      const csvData = attendanceData.map(log => [
        format(new Date(log.check_in_time), 'yyyy-MM-dd'),
        `${log.profiles?.first_name || ''} ${log.profiles?.last_name || ''}`,
        log.profiles?.member_code || '',
        format(new Date(log.check_in_time), 'HH:mm'),
        log.check_out_time ? format(new Date(log.check_out_time), 'HH:mm') : 'Not checked out',
        log.check_out_time ? 
          `${Math.round((new Date(log.check_out_time).getTime() - new Date(log.check_in_time).getTime()) / (1000 * 60))} min` 
          : 'N/A'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    }
  };

  const canViewAllReports = userRole === 'gym_admin' || userRole === 'trainer';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-purple-200">View attendance reports and member statistics</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="attendance">Attendance Report</SelectItem>
              {canViewAllReports && <SelectItem value="members">Member Statistics</SelectItem>}
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} className="bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="bg-slate-800/90 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  From: {format(selectedDateRange.from, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                <Calendar
                  mode="single"
                  selected={selectedDateRange.from}
                  onSelect={(date) => date && setSelectedDateRange(prev => ({ ...prev, from: date }))}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  To: {format(selectedDateRange.to, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                <Calendar
                  mode="single"
                  selected={selectedDateRange.to}
                  onSelect={(date) => date && setSelectedDateRange(prev => ({ ...prev, to: date }))}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportType === 'members' && canViewAllReports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/90 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{memberStats.totalMembers}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/90 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Active This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{memberStats.activeThisMonth}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/90 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{memberStats.newThisMonth}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'attendance' && (
        <Card className="bg-slate-800/90 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attendance Log
            </CardTitle>
            <CardDescription className="text-purple-200">
              {userRole === 'member' ? 'Your attendance history' : 'Member attendance records'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-purple-300">Loading attendance data...</div>
            ) : attendanceData.length === 0 ? (
              <div className="text-center py-8 text-purple-300">
                No attendance records found for the selected period
              </div>
            ) : (
              <div className="space-y-4">
                {attendanceData.slice(0, 50).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {log.profiles?.first_name} {log.profiles?.last_name}
                        </p>
                        <p className="text-sm text-purple-300">
                          {log.profiles?.member_code}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white">
                          {format(new Date(log.check_in_time), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-purple-300">
                          {format(new Date(log.check_in_time), 'HH:mm')} - {
                            log.check_out_time 
                              ? format(new Date(log.check_out_time), 'HH:mm')
                              : 'Present'
                          }
                        </p>
                      </div>
                      
                      <Badge 
                        variant={log.check_out_time ? 'secondary' : 'default'}
                        className={log.check_out_time ? 'bg-green-600' : 'bg-blue-600'}
                      >
                        {log.check_out_time ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {attendanceData.length > 50 && (
                  <p className="text-center text-purple-300 py-4">
                    Showing first 50 records. Export CSV for complete data.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsSection;
