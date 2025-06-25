
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Filter, Download, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MemberManagementProps {
  gymId: string;
  userRole: string;
}

const MemberManagement = ({ gymId, userRole }: MemberManagementProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "member",
    branch_id: "",
    date_of_birth: "",
    emergency_contact: "",
    emergency_phone: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchBranches();
  }, [gymId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches (id, name),
          member_subscriptions (
            id, plan_name, start_date, end_date, is_active
          )
        `)
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('gym_id', gymId)
        .eq('is_active', true);

      if (error) throw error;
      setBranches(data || []);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newMember.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        user_metadata: {
          first_name: newMember.first_name,
          last_name: newMember.last_name
        }
      });

      if (authError) throw authError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          gym_id: gymId,
          branch_id: newMember.branch_id || null,
          role: newMember.role,
          first_name: newMember.first_name,
          last_name: newMember.last_name,
          email: newMember.email,
          phone: newMember.phone,
          date_of_birth: newMember.date_of_birth || null,
          emergency_contact: newMember.emergency_contact || null,
          emergency_phone: newMember.emergency_phone || null
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Member Added Successfully",
        description: `${newMember.first_name} ${newMember.last_name} has been added to your gym`,
      });

      setIsAddingMember(false);
      setNewMember({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "member",
        branch_id: "",
        date_of_birth: "",
        emergency_contact: "",
        emergency_phone: ""
      });
      
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error Adding Member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMemberQR = (member: any) => {
    // In a real implementation, this would generate an actual QR code image
    const qrData = `${window.location.origin}/member/${member.member_code}`;
    
    // Create a simple QR code representation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    if (ctx) {
      // Draw a simple placeholder QR code
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(member.member_code, 10, 20);
    }
    
    // Download the QR code
    const link = document.createElement('a');
    link.download = `${member.member_code}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = selectedBranch === "all" || member.branch_id === selectedBranch;
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    
    return matchesSearch && matchesBranch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Member Management</h2>
          <p className="text-gray-600">Manage your gym members and staff</p>
        </div>
        
        {(userRole === 'gym_admin' || userRole === 'super_admin') && (
          <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Add a new member or staff to your gym
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newMember.first_name}
                      onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newMember.last_name}
                      onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        {userRole === 'super_admin' && <SelectItem value="gym_admin">Gym Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={newMember.branch_id} onValueChange={(value) => setNewMember({ ...newMember, branch_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={newMember.date_of_birth}
                      onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={newMember.emergency_contact}
                      onChange={(e) => setNewMember({ ...newMember, emergency_contact: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={newMember.emergency_phone}
                    onChange={(e) => setNewMember({ ...newMember, emergency_phone: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Member"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddingMember(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="member">Members</SelectItem>
                <SelectItem value="trainer">Trainers</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="gym_admin">Gym Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Members ({filteredMembers.length})</CardTitle>
              <CardDescription>
                View and manage all gym members
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Member Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.member_code || 'Pending'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      member.role === 'gym_admin' ? 'default' :
                      member.role === 'trainer' ? 'secondary' :
                      member.role === 'staff' ? 'outline' : 'secondary'
                    }>
                      {member.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.branches?.name || 'No Branch'}</TableCell>
                  <TableCell>{member.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? 'default' : 'destructive'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {member.role === 'member' && member.qr_code && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateMemberQR(member)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberManagement;
