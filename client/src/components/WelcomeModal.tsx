import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  MessageCircle,
  ShoppingCart,
  Sparkles,
  FolderOpen,
} from "lucide-react";

export function WelcomeModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { data: onboardingStatus } = trpc.onboarding.getMyStatus.useQuery(undefined, {
    enabled: !!user, // Only fetch when user is authenticated
  });
  const updateStatus = trpc.onboarding.updateMyStatus.useMutation();

  useEffect(() => {
    // Show modal if user hasn't seen welcome yet
    if (onboardingStatus && !onboardingStatus.hasSeenWelcome) {
      setOpen(true);
    }
  }, [onboardingStatus]);

  const handleClose = async (startTour = false) => {
    try {
      await updateStatus.mutateAsync({
        hasSeenWelcome: true,
        hasCompletedTour: startTour,
      });
    } catch (error) {
      console.error("Error updating onboarding status:", error);
    }

    setOpen(false);

    if (startTour) {
      setLocation("/onboarding");
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose(false)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">
              Willkommen im ImmoRefi Portal!
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Wir freuen uns, Sie an Bord zu haben. Entdecken Sie die wichtigsten Funktionen Ihres neuen Portals.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1: Termine buchen */}
            <div className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Termine buchen</h4>
                <p className="text-sm text-muted-foreground">
                  Vereinbaren Sie ganz einfach Beratungsgespräche mit unseren Experten.
                </p>
              </div>
            </div>

            {/* Feature 2: Bestellungen */}
            <div className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Analysen bestellen</h4>
                <p className="text-sm text-muted-foreground">
                  Fordern Sie professionelle Immobilienanalysen und Gutachten an.
                </p>
              </div>
            </div>

            {/* Feature 3: Dokumente */}
            <div className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dokumente verwalten</h4>
                <p className="text-sm text-muted-foreground">
                  Laden Sie Unterlagen hoch und greifen Sie jederzeit darauf zu.
                </p>
              </div>
            </div>

            {/* Feature 4: Nachrichten */}
            <div className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Direkter Kontakt</h4>
                <p className="text-sm text-muted-foreground">
                  Kommunizieren Sie direkt mit Ihrem Berater über den Chat.
                </p>
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex gap-2 items-start">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Alle Informationen auf einen Blick</p>
                <p className="text-sm text-muted-foreground">
                  Im Dashboard finden Sie eine Übersicht über alle Ihre Aktivitäten, Termine und Dokumente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="sm:flex-1"
          >
            Später
          </Button>
          <Button
            onClick={() => handleClose(true)}
            className="sm:flex-1"
          >
            Los geht's!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
