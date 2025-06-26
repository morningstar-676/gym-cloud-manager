
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CreditCard } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  userProfile: any;
  feature?: string;
}

const SubscriptionGuard = ({ children, userProfile, feature }: SubscriptionGuardProps) => {
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [userProfile]);

  const checkSubscriptionStatus = () => {
    if (!userProfile?.member_subscriptions?.length) return;

    const activeSubscription = userProfile.member_subscriptions.find((sub: any) => sub.is_active);
    
    if (!activeSubscription) {
      setIsExpired(true);
      return;
    }

    // Check if subscription is expired
    const endDate = new Date(activeSubscription.end_date);
    const now = new Date();
    
    if (endDate < now) {
      setIsExpired(true);
      setShowExpiredDialog(true);
    }
  };

  // If user is not a member, don't show subscription guard
  if (userProfile?.role !== 'member') {
    return <>{children}</>;
  }

  // If subscription is expired and this is a protected feature
  if (isExpired && feature) {
    return (
      <>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Subscription Expired
            </CardTitle>
            <CardDescription className="text-red-600">
              Your subscription has expired. Please renew to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-red-600 hover:bg-red-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Renew Subscription
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Subscription Expired
              </DialogTitle>
              <DialogDescription>
                Your subscription has expired. Please contact your gym administrator or renew your subscription to continue using the app.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowExpiredDialog(false)}>
                View Reports Only
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                Contact Admin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
