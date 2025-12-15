import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import saiLogo from "@/assets/sai-logo.png";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header with Logo */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={saiLogo} alt="Sai Financial Services" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Sri Sai Financial Services</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4 py-20">
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-full shadow-lg">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-2">Application Submitted!</CardTitle>
            <CardDescription className="text-base">
              Your loan application has been received
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 text-center space-y-6">
            <div className="space-y-4">
              <p className="text-lg text-foreground">
                Thank you for choosing <strong>Sai Financial Services</strong>.
              </p>
              <p className="text-muted-foreground">
                Our team will review your application and contact you within 24-48 hours. 
                We appreciate your trust in us.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-2">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Our team will verify your details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>We'll contact you to discuss loan terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Final approval and documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Quick disbursement of funds</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                variant="finance" 
                size="lg" 
                onClick={() => navigate("/")}
                className="w-full"
              >
                Return to Home
              </Button>
              <p className="text-xs text-muted-foreground">
                Need help? Contact us +91 8660871116
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={saiLogo} alt="Sai Financial Services" className="h-8 w-8 object-contain" />
            <span className="font-semibold">Sai Financial Services</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Sai Financial Services. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
