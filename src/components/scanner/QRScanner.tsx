
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  gymId: string;
  branchId: string;
  scannedBy: string;
}

const QRScanner = ({ gymId, branchId, scannedBy }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsScanning(true);
      startScanning();
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    const scanInterval = setInterval(async () => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // In a real implementation, you'd use a QR code library here
          // For now, we'll simulate QR detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          // Mock QR code detection - replace with actual QR library
          simulateQRDetection();
        }
      }
    }, 500);

    return () => clearInterval(scanInterval);
  };

  const simulateQRDetection = () => {
    // This is a mock function - replace with actual QR code detection
    // For demo purposes, we'll randomly detect a QR code
    if (Math.random() > 0.98) { // 2% chance per scan
      const mockQRCode = `QR_member_${Date.now()}`;
      handleQRDetected(mockQRCode);
    }
  };

  const handleQRDetected = async (qrCode: string) => {
    try {
      // Find member by QR code
      const { data: member, error: memberError } = await supabase
        .from('profiles')
        .select('*')
        .eq('qr_code', qrCode)
        .eq('gym_id', gymId)
        .single();

      if (memberError || !member) {
        toast({
          title: "Member Not Found",
          description: "Invalid QR code or member not in this gym",
          variant: "destructive",
        });
        return;
      }

      // Check if already checked in today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingLog } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('member_id', member.id)
        .eq('gym_id', gymId)
        .gte('check_in_time', today)
        .is('check_out_time', null)
        .single();

      if (existingLog) {
        // Check out
        const { error: checkoutError } = await supabase
          .from('attendance_logs')
          .update({ check_out_time: new Date().toISOString() })
          .eq('id', existingLog.id);

        if (checkoutError) throw checkoutError;

        setLastScan({
          type: 'checkout',
          member: member,
          time: new Date()
        });

        toast({
          title: "Check-out Successful",
          description: `${member.first_name} ${member.last_name} checked out`,
        });
      } else {
        // Check in
        const { error: checkinError } = await supabase
          .from('attendance_logs')
          .insert({
            member_id: member.id,
            gym_id: gymId,
            branch_id: branchId,
            scanned_by: scannedBy,
            check_in_time: new Date().toISOString()
          });

        if (checkinError) throw checkinError;

        setLastScan({
          type: 'checkin',
          member: member,
          time: new Date()
        });

        toast({
          title: "Check-in Successful",
          description: `${member.first_name} ${member.last_name} checked in`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Scan Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan member QR codes for check-in/check-out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={isScanning ? stopCamera : startCamera}
              variant={isScanning ? "destructive" : "default"}
            >
              {isScanning ? (
                <>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
          </div>

          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg border"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500 rounded-lg"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {lastScan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastScan.type === 'checkin' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-blue-500" />
              )}
              Last Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {lastScan.member.first_name} {lastScan.member.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  Member Code: {lastScan.member.member_code}
                </p>
                <p className="text-sm text-gray-500">
                  {lastScan.time.toLocaleTimeString()}
                </p>
              </div>
              <Badge variant={lastScan.type === 'checkin' ? 'default' : 'secondary'}>
                {lastScan.type === 'checkin' ? 'Checked In' : 'Checked Out'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;
