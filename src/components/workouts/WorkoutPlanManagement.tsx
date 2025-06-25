
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Dumbbell, Users, Edit, Trash2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkoutPlanManagementProps {
  gymId: string;
  userRole: string;
  userId: string;
}

const WorkoutPlanManagement = ({ gymId, userRole, userId }: WorkoutPlanManagementProps) => {
  const [defaultPlans, setDefaultPlans] = useState<any[]>([]);
  const [memberPlans, setMemberPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingDefaultPlan, setIsCreatingDefaultPlan] = useState(false);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);
  const [newDefaultPlan, setNewDefaultPlan] = useState({
    name: "",
    description: "",
    plan_data: {
      weeks: 4,
      days_per_week: 3,
      exercises: []
    }
  });
  const [planAssignment, setPlanAssignment] = useState({
    default_plan_id: "",
    member_id: "",
    start_date: "",
    end_date: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDefaultPlans();
    fetchMemberPlans();
    fetchMembers();
  }, [gymId]);

  const fetchDefaultPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('default_workout_plans')
        .select(`
          *,
          profiles!default_workout_plans_created_by_fkey (
            first_name, last_name
          )
        `)
        .eq('gym_id', gymId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDefaultPlans(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load default workout plans",
        variant: "destructive",
      });
    }
  };

  const fetchMemberPlans = async () => {
    try {
      let query = supabase
        .from('workout_programs')
        .select(`
          *,
          profiles!workout_programs_member_id_fkey (
            id, first_name, last_name, member_code
          ),
          trainer:profiles!workout_programs_trainer_id_fkey (
            first_name, last_name
          )
        `)
        .eq('gym_id', gymId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // If user is a trainer, only show their assigned plans
      if (userRole === 'trainer') {
        query = query.eq('trainer_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMemberPlans(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load member workout plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, member_code')
        .eq('gym_id', gymId)
        .eq('role', 'member')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCreateDefaultPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('default_workout_plans')
        .insert({
          gym_id: gymId,
          name: newDefaultPlan.name,
          description: newDefaultPlan.description,
          plan_data: newDefaultPlan.plan_data,
          created_by: userId
        });

      if (error) throw error;

      toast({
        title: "Default Plan Created",
        description: `${newDefaultPlan.name} has been created`,
      });

      setIsCreatingDefaultPlan(false);
      setNewDefaultPlan({
        name: "",
        description: "",
        plan_data: {
          weeks: 4,
          days_per_week: 3,
          exercises: []
        }
      });
      
      fetchDefaultPlans();
    } catch (error: any) {
      toast({
        title: "Error Creating Plan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the default plan data
      const { data: defaultPlan, error: planError } = await supabase
        .from('default_workout_plans')
        .select('*')
        .eq('id', planAssignment.default_plan_id)
        .single();

      if (planError) throw planError;

      // Create member-specific workout program
      const { error } = await supabase
        .from('workout_programs')
        .insert({
          gym_id: gymId,
          trainer_id: userId,
          member_id: planAssignment.member_id,
          name: defaultPlan.name,
          description: defaultPlan.description,
          program_data: defaultPlan.plan_data,
          start_date: planAssignment.start_date,
          end_date: planAssignment.end_date
        });

      if (error) throw error;

      toast({
        title: "Plan Assigned Successfully",
        description: "Workout plan has been assigned to the member",
      });

      setIsAssigningPlan(false);
      setPlanAssignment({
        default_plan_id: "",
        member_id: "",
        start_date: "",
        end_date: ""
      });
      
      fetchMemberPlans();
    } catch (error: any) {
      toast({
        title: "Error Assigning Plan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDefaultPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('default_workout_plans')
        .update({ is_active: false })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Plan Deleted",
        description: "Default workout plan has been deleted",
      });

      fetchDefaultPlans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const canCreatePlans = userRole === 'gym_admin' || userRole === 'trainer';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workout Plan Management</h2>
          <p className="text-gray-600">Create and manage workout plans for your gym</p>
        </div>
      </div>

      <Tabs defaultValue="default-plans" className="w-full">
        <TabsList>
          <TabsTrigger value="default-plans">Default Plans</TabsTrigger>
          <TabsTrigger value="member-plans">Member Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="default-plans">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Default Workout Plans</h3>
                <p className="text-gray-600">Template plans that can be assigned to members</p>
              </div>
              
              {canCreatePlans && (
                <Dialog open={isCreatingDefaultPlan} onOpenChange={setIsCreatingDefaultPlan}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Default Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Default Workout Plan</DialogTitle>
                      <DialogDescription>
                        Create a template workout plan that can be assigned to members
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleCreateDefaultPlan} className="space-y-4">
                      <div>
                        <Label htmlFor="planName">Plan Name *</Label>
                        <Input
                          id="planName"
                          value={newDefaultPlan.name}
                          onChange={(e) => setNewDefaultPlan({ ...newDefaultPlan, name: e.target.value })}
                          placeholder="e.g., Beginner Strength Training"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="planDescription">Description</Label>
                        <Textarea
                          id="planDescription"
                          value={newDefaultPlan.description}
                          onChange={(e) => setNewDefaultPlan({ ...newDefaultPlan, description: e.target.value })}
                          placeholder="Describe the workout plan..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weeks">Duration (weeks)</Label>
                          <Input
                            id="weeks"
                            type="number"
                            value={newDefaultPlan.plan_data.weeks}
                            onChange={(e) => setNewDefaultPlan({
                              ...newDefaultPlan,
                              plan_data: {
                                ...newDefaultPlan.plan_data,
                                weeks: parseInt(e.target.value) || 4
                              }
                            })}
                            min="1"
                            max="52"
                          />
                        </div>
                        <div>
                          <Label htmlFor="daysPerWeek">Days per week</Label>
                          <Input
                            id="daysPerWeek"
                            type="number"
                            value={newDefaultPlan.plan_data.days_per_week}
                            onChange={(e) => setNewDefaultPlan({
                              ...newDefaultPlan,
                              plan_data: {
                                ...newDefaultPlan.plan_data,
                                days_per_week: parseInt(e.target.value) || 3
                              }
                            })}
                            min="1"
                            max="7"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Creating..." : "Create Plan"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsCreatingDefaultPlan(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid gap-4">
              {defaultPlans.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500">No default workout plans yet</p>
                    {canCreatePlans && (
                      <Button className="mt-4" onClick={() => setIsCreatingDefaultPlan(true)}>
                        Create Your First Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                defaultPlans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {plan.plan_data.weeks} weeks
                          </Badge>
                          <Badge variant="outline">
                            {plan.plan_data.days_per_week} days/week
                          </Badge>
                          {canCreatePlans && (
                            <div className="flex gap-1">
                              <Dialog open={isAssigningPlan} onOpenChange={setIsAssigningPlan}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setPlanAssignment({ ...planAssignment, default_plan_id: plan.id })}
                                  >
                                    <Users className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Assign Plan to Member</DialogTitle>
                                    <DialogDescription>
                                      Assign "{plan.name}" to a member
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <form onSubmit={handleAssignPlan} className="space-y-4">
                                    <div>
                                      <Label htmlFor="member">Member *</Label>
                                      <Select value={planAssignment.member_id} onValueChange={(value) => setPlanAssignment({ ...planAssignment, member_id: value })}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {members.map(member => (
                                            <SelectItem key={member.id} value={member.id}>
                                              {member.first_name} {member.last_name} ({member.member_code})
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                          id="startDate"
                                          type="date"
                                          value={planAssignment.start_date}
                                          onChange={(e) => setPlanAssignment({ ...planAssignment, start_date: e.target.value })}
                                          min={new Date().toISOString().split('T')[0]}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                          id="endDate"
                                          type="date"
                                          value={planAssignment.end_date}
                                          onChange={(e) => setPlanAssignment({ ...planAssignment, end_date: e.target.value })}
                                          min={planAssignment.start_date}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                      <Button type="submit" disabled={loading}>
                                        {loading ? "Assigning..." : "Assign Plan"}
                                      </Button>
                                      <Button type="button" variant="outline" onClick={() => setIsAssigningPlan(false)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteDefaultPlan(plan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        Created by: {plan.profiles?.first_name} {plan.profiles?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="member-plans">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Assigned Member Plans</h3>
              <p className="text-gray-600">Workout plans assigned to individual members</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-gray-500">No plans assigned to members yet</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      memberPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {plan.profiles.first_name} {plan.profiles.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {plan.profiles.member_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{plan.name}</TableCell>
                          <TableCell>
                            {plan.trainer?.first_name} {plan.trainer?.last_name}
                          </TableCell>
                          <TableCell>
                            {plan.start_date && plan.end_date ? (
                              <div className="text-sm">
                                <p>{new Date(plan.start_date).toLocaleDateString()}</p>
                                <p className="text-gray-500">to {new Date(plan.end_date).toLocaleDateString()}</p>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                              {plan.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanManagement;
