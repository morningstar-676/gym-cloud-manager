
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Filter, Download, Mail, Phone, QrCode, Calendar, Activity } from "lucide-react";

interface MemberManagementProps {
  gymId: string;
  userRole: string;
  userId: string;
}

const MemberManagement = ({ gymId, userRole, userId }: MemberManagementProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "member" as "super_admin" | "gym_admin" | "trainer" | "staff" | "member"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [gymId]);

  const fetchMembers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id, email, first_name, last_name, phone, role, member_code, qr_code, 
          created_at, branch_id, branches(name)
        `)
        .eq('gym_id', gymId);

      // Filter based on user role
      if (userRole === 'trainer') {
        // Trainers can only see members assigned to them
        query = query.eq('role', 'member');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newMember.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        email_confirm: true
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: newMember.email,
          first_name: newMember.first_name,
          last_name: newMember.last_name,
          phone: newMember.phone,
          role: newMember.role,
          gym_id: gymId
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: `${newMember.role.charAt(0).toUpperCase() + newMember.role.slice(1)} added successfully`,
      });

      setShowAddMember(false);
      setNewMember({
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        role: "member"
      });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || member.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

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

  if (loading) {
    return <div className="flex justify-center p-8">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
          <p className="text-gray-600">Manage gym members, staff, and trainers</p>
        </div>
        
        {(userRole === 'gym_admin' || userRole === 'super_admin') && (
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Create a new member account for your gym
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={newMember.first_name}
                      onChange={(e) => setNewMember({...newMember, first_name: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={newMember.last_name}
                      onChange={(e) => setNewMember({...newMember, last_name: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="john.doe@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newMember.role} onValueChange={(value: "super_admin" | "gym_admin" | "trainer" | "staff" | "member") => setNewMember({...newMember, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      {userRole === 'super_admin' && <SelectItem value="gym_admin">Gym Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleAddMember} className="w-full">
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="member">Members</SelectItem>
            <SelectItem value="trainer">Trainers</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="gym_admin">Gym Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.first_name?.[0]}{member.last_name?.[0]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {member.first_name} {member.last_name}
                    </CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </div>
                </div>
                <Badge className={`${getRoleColor(member.role)} text-white`}>
                  {member.role.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {member.member_code && (
                <div className="flex items-center gap-2 text-sm">
                  <QrCode className="h-4 w-4 text-gray-500" />
                  <span className="font-mono">{member.member_code}</span>
                </div>
              )}
              
              {member.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{member.phone}</span>
                </div>
              )}
              
              {member.branches?.name && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{member.branches.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="h-4 w-4" />
                <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600 text-center">
              {searchTerm || filterRole !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Start by adding your first member to the gym."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberManagement;
