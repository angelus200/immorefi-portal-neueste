import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Cookie, Shield, BarChart3, Target } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent";

type ConsentStatus = "pending" | "accepted" | "rejected";

export function CookieBanner() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent === "accepted" || savedConsent === "rejected") {
      setConsentStatus(savedConsent);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsentStatus("accepted");
    // Tracking ist bereits aktiv, keine weitere Aktion nötig
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsentStatus("rejected");
    // Optional: Tracking deaktivieren
    // In einer vollständigen Implementierung würden hier die Tracking-Skripte deaktiviert
  };

  // Banner nicht anzeigen wenn bereits entschieden
  if (consentStatus !== "pending") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/20 bg-white dark:bg-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Wir verwenden Cookies und Tracking-Technologien
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Um Ihnen das beste Erlebnis auf unserer Website zu bieten, verwenden wir verschiedene 
                    Tracking-Technologien. Diese helfen uns, die Website zu verbessern und relevante Inhalte anzuzeigen.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 -mt-2 -mr-2"
                  onClick={handleReject}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tracking Details */}
              <div className={`space-y-3 overflow-hidden transition-all duration-300 ${showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Google Analytics</p>
                      <p className="text-xs text-muted-foreground">
                        Analyse des Nutzerverhaltens zur Verbesserung der Website
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <Target className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Meta Pixel</p>
                      <p className="text-xs text-muted-foreground">
                        Messung der Werbewirksamkeit und Remarketing
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Google Tag Manager</p>
                      <p className="text-xs text-muted-foreground">
                        Verwaltung von Marketing- und Analyse-Tags
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Weitere Informationen finden Sie in unserer{" "}
                  <a href="/datenschutz" className="text-primary hover:underline">
                    Datenschutzerklärung
                  </a>
                  . Sie können Ihre Einstellungen jederzeit ändern.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Details ausblenden" : "Details anzeigen"}
                </Button>
                
                <div className="flex-1" />
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    className="flex-1 sm:flex-none"
                  >
                    Nur notwendige
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                  >
                    Alle akzeptieren
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
