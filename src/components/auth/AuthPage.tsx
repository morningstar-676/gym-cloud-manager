
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Crown, Dumbbell } from "lucide-react";

interface AuthPageProps {
  user: User;
  onProfileCreated: (profile: any) => void;
}

const AuthPage = ({ user, onProfileCreated }: AuthPageProps) => {
  const [step, setStep] = useState<'setup' | 'join'>('setup');
  const [loading, setLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  
  // Setup gym form
  const [gymName, setGymName] = useState("");
  const [gymEmail, setGymEmail] = useState(user.email || "");
  const [gymPhone, setGymPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  // Join gym form
  const [inviteCode, setInviteCode] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      setSubscriptionPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSetupGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create gym
      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: gymName,
          email: gymEmail,
          phone: gymPhone,
          address,
          city,
          state,
          postal_code: postalCode,
        })
        .select()
        .single();

      if (gymError) throw gymError;

      // Create gym subscription
      const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
      if (selectedPlanData) {
        const { error: subError } = await supabase
          .from('gym_subscriptions')
          .insert({
            gym_id: gym.id,
            plan_id: selectedPlan,
          });

        if (subError) throw subError;
      }

      // Create main branch
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .insert({
          gym_id: gym.id,
          name: `${gymName} - Main`,
          address,
          city,
          state,
          postal_code: postalCode,
          phone: gymPhone,
          email: gymEmail,
        })
        .select()
        .single();

      if (branchError) throw branchError;

      // Update user profile as gym admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          gym_id: gym.id,
          branch_id: branch.id,
          role: 'gym_admin',
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          email: user.email,
        })
        .eq('id', user.id)
        .select('*, gyms(*), branches(*)')
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Success!",
        description: "Your gym has been set up successfully.",
      });

      onProfileCreated(profile);
    } catch (error: any) {
      toast({
        title: "Setup Error",
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
      // For now, we'll implement a simple join process
      // In production, you'd validate invite codes, etc.
      toast({
        title: "Feature Coming Soon",
        description: "Gym invitation system will be available soon. Please set up your own gym for now.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Join Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to GymCloud</h1>
          <p className="text-gray-600">Let's get you started with your gym management platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Setup New Gym */}
          <Card className={`cursor-pointer transition-all ${step === 'setup' ? 'ring-2 ring-blue-600 shadow-lg' : ''}`} 
                onClick={() => setStep('setup')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit mb-4">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Set Up New Gym</CardTitle>
              <CardDescription>Create and manage your own gym with full admin access</CardDescription>
            </CardHeader>
            {step === 'setup' && (
              <CardContent>
                <form onSubmit={handleSetupGym} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gymName">Gym Name *</Label>
                    <Input
                      id="gymName"
                      placeholder="FitZone Gym"
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gymEmail">Email *</Label>
                      <Input
                        id="gymEmail"
                        type="email"
                        value={gymEmail}
                        onChange={(e) => setGymEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gymPhone">Phone</Label>
                      <Input
                        id="gymPhone"
                        placeholder="+1 (555) 123-4567"
                        value={gymPhone}
                        onChange={(e) => setGymPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Fitness Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">ZIP Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="10001"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan *</Label>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{plan.name}</span>
                              <span className="text-blue-600 font-semibold ml-2">${plan.price}/mo</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Setting up..." : "Create Gym"}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Join Existing Gym */}
          <Card className={`cursor-pointer transition-all ${step === 'join' ? 'ring-2 ring-blue-600 shadow-lg' : ''}`} 
                onClick={() => setStep('join')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-green-100 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Join Existing Gym</CardTitle>
              <CardDescription>Join a gym as a trainer, staff member, or member</CardDescription>
            </CardHeader>
            {step === 'join' && (
              <CardContent>
                <form onSubmit={handleJoinGym} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invitation Code</Label>
                    <Input
                      id="inviteCode"
                      placeholder="Enter your invitation code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        <strong>Coming Soon:</strong> The invitation system is being developed. 
                        Please set up your own gym for now.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={true}>
                    Join Gym (Coming Soon)
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
