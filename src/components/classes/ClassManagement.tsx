
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Users, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClassManagementProps {
  gymId: string;
  userRole: string;
  userId: string;
}

const ClassManagement = ({ gymId, userRole, userId }: ClassManagementProps) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    branch_id: "",
    trainer_id: "",
    class_date: "",
    start_time: "",
    end_time: "",
    max_capacity: 20
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchBranches();
    fetchTrainers();
  }, [gymId]);

  const fetchClasses = async () => {
    try {
      let query = supabase
        .from('classes')
        .select(`
          *,
          branches (id, name),
          profiles!classes_trainer_id_fkey (id, first_name, last_name),
          class_bookings (id, status)
        `)
        .eq('gym_id', gymId)
        .order('class_date', { ascending: true });

      // If user is a trainer, only show their classes
      if (userRole === 'trainer') {
        query = query.eq('trainer_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load classes",
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

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('gym_id', gymId)
        .eq('role', 'trainer')
        .eq('is_active', true);

      if (error) throw error;
      setTrainers(data || []);
    } catch (error: any) {
      console.error('Error fetching trainers:', error);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('classes')
        .insert({
          gym_id: gymId,
          branch_id: newClass.branch_id,
          trainer_id: newClass.trainer_id || null,
          name: newClass.name,
          description: newClass.description,
          class_date: newClass.class_date,
          start_time: newClass.start_time,
          end_time: newClass.end_time,
          max_capacity: newClass.max_capacity
        });

      if (error) throw error;

      toast({
        title: "Class Created Successfully",
        description: `${newClass.name} has been scheduled`,
      });

      setIsCreatingClass(false);
      setNewClass({
        name: "",
        description: "",
        branch_id: "",
        trainer_id: "",
        class_date: "",
        start_time: "",
        end_time: "",
        max_capacity: 20
      });
      
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error Creating Class",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Class Deleted",
        description: "Class has been deleted successfully",
      });

      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (classItem: any) => {
    const now = new Date();
    const classDateTime = new Date(`${classItem.class_date}T${classItem.start_time}`);
    const endDateTime = new Date(`${classItem.class_date}T${classItem.end_time}`);

    if (classItem.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else if (classItem.status === 'completed') {
      return <Badge variant="secondary">Completed</Badge>;
    } else if (now > endDateTime) {
      return <Badge variant="secondary">Finished</Badge>;
    } else if (now >= classDateTime && now <= endDateTime) {
      return <Badge variant="default">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const canManageClasses = userRole === 'gym_admin' || userRole === 'trainer';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Class Management</h2>
          <p className="text-gray-600">Schedule and manage gym classes</p>
        </div>
        
        {canManageClasses && (
          <Dialog open={isCreatingClass} onOpenChange={setIsCreatingClass}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>
                  Schedule a new class for your gym
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="className">Class Name *</Label>
                    <Input
                      id="className"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      placeholder="e.g., Morning Yoga"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCapacity">Max Capacity *</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={newClass.max_capacity}
                      onChange={(e) => setNewClass({ ...newClass, max_capacity: parseInt(e.target.value) || 20 })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    placeholder="Describe the class..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch *</Label>
                    <Select value={newClass.branch_id} onValueChange={(value) => setNewClass({ ...newClass, branch_id: value })}>
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
                  <div>
                    <Label htmlFor="trainer">Trainer</Label>
                    <Select value={newClass.trainer_id} onValueChange={(value) => setNewClass({ ...newClass, trainer_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map(trainer => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.first_name} {trainer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="classDate">Date *</Label>
                    <Input
                      id="classDate"
                      type="date"
                      value={newClass.class_date}
                      onChange={(e) => setNewClass({ ...newClass, class_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newClass.start_time}
                      onChange={(e) => setNewClass({ ...newClass, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newClass.end_time}
                      onChange={(e) => setNewClass({ ...newClass, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Class"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreatingClass(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Classes Grid/List */}
      <div className="grid gap-4">
        {classes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">No classes scheduled yet</p>
              {canManageClasses && (
                <Button className="mt-4" onClick={() => setIsCreatingClass(true)}>
                  Create Your First Class
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          classes.map((classItem) => (
            <Card key={classItem.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                    <CardDescription>{classItem.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(classItem)}
                    {canManageClasses && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteClass(classItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(classItem.class_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{classItem.start_time} - {classItem.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{classItem.current_bookings || 0}/{classItem.max_capacity}</span>
                  </div>
                  <div>
                    <Badge variant="outline">{classItem.branches?.name}</Badge>
                  </div>
                </div>
                
                {classItem.profiles && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Trainer:</span> {classItem.profiles.first_name} {classItem.profiles.last_name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassManagement;
