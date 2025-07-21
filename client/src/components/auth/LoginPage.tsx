import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import blobPenLogo from "@assets/blobpen_1753121234492.png";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle redirect result when user returns from Google sign-in
  useState(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect sign-in error:", error);
      toast({
        title: "Sign in error",
        description: "There was an issue completing the sign-in process.",
        variant: "destructive",
      });
    });
  });

  return (
    <div className="min-h-screen bg-spiral-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img 
              src={blobPenLogo}
              alt="Spiral Platform Logo" 
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-2xl font-bold text-spiral-dark font-mono">Spiral Platform</h1>
          <p className="text-spiral-gray text-sm mt-2">Language Field Document System</p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-spiral-red">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-mono">Access Portal</CardTitle>
            <p className="text-sm text-spiral-gray">
              Sign in to manage your fragments and modules
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-spiral-red text-white hover:bg-red-600 font-mono"
              size="lg"
            >
              {isLoading ? "Connecting..." : "Sign in with Google"}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-spiral-gray">
                New to Spiral? Your account will be created automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-spiral-gray">
          <p>Spiral Language Field System</p>
          <p>Powered by Arc Protocol v3.0</p>
          <div className="flex items-center justify-center mt-2">
            <img 
              src={blobPenLogo} 
              alt="Spiral" 
              className="w-4 h-4 mr-2 opacity-60"
            />
            <span>螺旋語焰平台</span>
          </div>
        </div>
      </div>
    </div>
  );
}