import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  X,
  Calendar,
  FileUp,
  ShoppingCart,
  Settings,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export function OnboardingChecklist() {
  const [location, setLocation] = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const { data: onboardingStatus } = trpc.onboarding.getMyStatus.useQuery();
  const updateStatus = trpc.onboarding.updateMyStatus.useMutation();

  if (!onboardingStatus || dismissed) {
    return null;
  }

  const progress = onboardingStatus.onboardingProgress || {};

  // Calculate completion percentage
  const steps = [
    { key: 'profileCompleted', completed: progress.profileCompleted },
    { key: 'firstBooking', completed: progress.firstBooking },
    { key: 'firstDocument', completed: progress.firstDocument },
    { key: 'firstOrder', completed: progress.firstOrder },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length + 1; // +1 for account created
  const progressPercent = ((completedSteps + 1) / totalSteps) * 100; // +1 because account is created

  // Don't show if everything is completed
  if (completedSteps === steps.length) {
    return null;
  }

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span>Erste Schritte</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({completedSteps + 1}/{totalSteps})
              </span>
            </CardTitle>
            <CardDescription>
              Entdecken Sie die wichtigsten Funktionen des Portals
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progressPercent} className="mt-3" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Step 1: Account created (always complete) */}
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-muted-foreground line-through">
            Account erstellt
          </span>
        </div>

        {/* Step 2: Complete profile */}
        <div className="flex items-center gap-3">
          {progress.profileCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm ${
                progress.profileCompleted ? "text-muted-foreground line-through" : ""
              }`}
            >
              Profil vervollständigen
            </span>
          </div>
          {!progress.profileCompleted && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2"
              onClick={() => handleNavigate("/settings")}
            >
              <Settings className="h-3 w-3 mr-1" />
              Öffnen
            </Button>
          )}
        </div>

        {/* Step 3: Book first appointment */}
        <div className="flex items-center gap-3">
          {progress.firstBooking ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm ${
                progress.firstBooking ? "text-muted-foreground line-through" : ""
              }`}
            >
              Ersten Termin buchen
            </span>
          </div>
          {!progress.firstBooking && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2"
              onClick={() => handleNavigate("/booking")}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Buchen
            </Button>
          )}
        </div>

        {/* Step 4: Upload documents */}
        <div className="flex items-center gap-3">
          {progress.firstDocument ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm ${
                progress.firstDocument ? "text-muted-foreground line-through" : ""
              }`}
            >
              Dokumente hochladen
            </span>
          </div>
          {!progress.firstDocument && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2"
              onClick={() => handleNavigate("/documents")}
            >
              <FileUp className="h-3 w-3 mr-1" />
              Hochladen
            </Button>
          )}
        </div>

        {/* Step 5: Place first order */}
        <div className="flex items-center gap-3">
          {progress.firstOrder ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm ${
                progress.firstOrder ? "text-muted-foreground line-through" : ""
              }`}
            >
              Erste Bestellung aufgeben
            </span>
          </div>
          {!progress.firstOrder && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2"
              onClick={() => handleNavigate("/orders")}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Bestellen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
