import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function ShopSuccess() {
  const { user } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get('session_id');
  
  const { data: verification, isLoading, refetch } = trpc.order.verifyCheckout.useQuery(
    { sessionId: sessionId || '' },
    { 
      enabled: !!sessionId && !!user,
      refetchInterval: (data) => {
        // Keep refetching until payment is confirmed
        if (data?.state?.data?.success) return false;
        return 2000;
      },
    }
  );
  
  useEffect(() => {
    if (sessionId && user) {
      refetch();
    }
  }, [sessionId, user, refetch]);
  
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Fehler</CardTitle>
            <CardDescription>
              Keine Session-ID gefunden. Bitte versuchen Sie es erneut.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/shop">
              <Button>Zurück zum Shop</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <CardTitle>Zahlung wird überprüft...</CardTitle>
            <CardDescription>
              Bitte warten Sie einen Moment.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (!verification?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <CardTitle>Zahlung wird verarbeitet...</CardTitle>
            <CardDescription>
              Dies kann einen Moment dauern. Bitte schließen Sie dieses Fenster nicht.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <Card className="max-w-lg w-full mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Zahlung erfolgreich!</CardTitle>
          <CardDescription className="text-base">
            Vielen Dank für Ihren Kauf der Analyse & Strukturierungsdiagnose.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Nächste Schritte:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">1.</span>
                Füllen Sie das Onboarding-Formular aus
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">2.</span>
                Laden Sie relevante Dokumente hoch
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">3.</span>
                Wir beginnen mit der Analyse innerhalb von 2 Werktagen
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">4.</span>
                Sie erhalten Ihren Bericht innerhalb von 10 Werktagen
              </li>
            </ol>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full" size="lg">
                Zum Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/onboarding" className="w-full">
              <Button variant="outline" className="w-full">
                Onboarding starten
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Eine Bestätigungs-E-Mail wurde an Ihre E-Mail-Adresse gesendet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
