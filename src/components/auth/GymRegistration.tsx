
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users } from "lucide-react";

interface GymRegistrationProps {
  user: User;
  profile: any;
  onGymRegistered: (profile: any) => void;
}

const GymRegistration = ({ user, profile, onGymRegistered }: GymRegistrationProps) => {
  const [loading, setLoading] = useState(false);
  const [gymData, setGymData] = useState({
    name: "",
    gymCode: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: ""
  });
  const [joinCode, setJoinCode] = useState("");
  const { toast } = useToast();

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate gym code (2 digits)
      if (!/^[a-zA-Z0-9]{2}$/.test(gymData.gymCode)) {
        throw new Error("Gym code must be exactly 2 characters (letters or numbers)");
      }

      // Get gym count for this code
      const { data: countData, error: countError } = await supabase
        .rpc('get_gym_count_for_code', { code: gymData.gymCode });

      if (countError) throw countError;

      const finalGymCode = gymData.gymCode + countData;

      // Create gym
      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: gymData.name,
          gym_code: finalGymCode,
          email: gymData.email,
          phone: gymData.phone,
          address: gymData.address,
          city: gymData.city,
          state: gymData.state,
          country: gymData.country,
          postal_code: gymData.postal_code
        })
        .select()
        .single();

      if (gymError) throw gymError;

      // Update user profile to gym_admin and link to gym
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          gym_id: gym.id,
          role: 'gym_admin'
        })
        .eq('id', user.id)
        .select(`
          *, 
          gyms (
            id, name, gym_code, email, phone, logo_url, theme_color,
            address, city, state, country, postal_code
          )
        `)
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Gym Created Successfully!",
        description: `Your gym "${gym.name}" has been created with code: ${finalGymCode}`,
      });

      onGymRegistered(updatedProfile);
    } catch (error: any) {
      toast({
        title: "Error Creating Gym",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find gym by code
      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .select('*')
        .eq('gym_code', joinCode)
        .single();

      if (gymError || !gym) {
        throw new Error("Gym not found with that code");
      }

      // Update user profile to link to gym
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          gym_id: gym.id,
          role: 'member'
        })
        .eq('id', user.id)
        .select(`
          *, 
          gyms (
            id, name, gym_code, email, phone, logo_url, theme_color,
            address, city, state, country, postal_code
          )
        `)
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Successfully Joined Gym!",
        description: `Welcome to ${gym.name}!`,
      });

      onGymRegistered(updatedProfile);
    } catch (error: any) {
      toast({
        title: "Error Joining Gym",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to GymCloud!</CardTitle>
          <CardDescription>
            Create your gym or join an existing one to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Create Gym
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Join Gym
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateGym} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gymName">Gym Name *</Label>
                    <Input
                      id="gymName"
                      value={gymData.name}
                      onChange={(e) => setGymData({ ...gymData, name: e.target.value })}
                      placeholder="My Awesome Gym"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gymCode">2-Digit Gym Code *</Label>
                    <Input
                      id="gymCode"
                      value={gymData.gymCode}
                      onChange={(e) => setGymData({ ...gymData, gymCode: e.target.value.slice(0, 2) })}
                      placeholder="BS"
                      maxLength={2}
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
                      value={gymData.email}
                      onChange={(e) => setGymData({ ...gymData, email: e.target.value })}
                      placeholder="info@mygym.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={gymData.phone}
                      onChange={(e) => setGymData({ ...gymData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={gymData.address}
                    onChange={(e) => setGymData({ ...gymData, address: e.target.value })}
                    placeholder="123 Fitness Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={gymData.city}
                      onChange={(e) => setGymData({ ...gymData, city: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={gymData.state}
                      onChange={(e) => setGymData({ ...gymData, state: e.target.value })}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={gymData.country}
                      onChange={(e) => setGymData({ ...gymData, country: e.target.value })}
                      placeholder="USA"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Gym..." : "Create Gym"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={handleJoinGym} className="space-y-4">
                <div>
                  <Label htmlFor="joinCode">Gym Code</Label>
                  <Input
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter gym code (e.g., bs1)"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ask your gym administrator for the gym code
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Joining..." : "Join Gym"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymRegistration;
