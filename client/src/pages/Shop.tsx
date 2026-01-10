import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import { 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Building2, 
  ArrowRight,
  Shield,
  Clock,
  Users,
  BookOpen,
  Download,
  Gift,
  Star
} from "lucide-react";

export default function Shop() {
  const { user, loading: authLoading } = useAuth();
  
  const { data: hasPurchasedAnalysis, isLoading: analysisLoading } = trpc.order.hasPurchased.useQuery(
    { productId: 'ANALYSIS' },
    { enabled: !!user }
  );
  
  const { data: hasPurchasedHandbuch, isLoading: handbuchLoading } = trpc.order.hasPurchased.useQuery(
    { productId: 'HANDBUCH' },
    { enabled: !!user }
  );
  
  const createCheckout = trpc.order.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Sie werden zur Zahlungsseite weitergeleitet...");
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen der Checkout-Session");
    },
  });
  
  const handlePurchaseAnalysis = () => {
    if (!user) {
      // Redirect to login with return URL
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/shop')}`;
      return;
    }
    createCheckout.mutate({ productId: 'ANALYSIS' });
  };
  
  const guestCheckout = trpc.order.guestCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Sie werden zur Zahlungsseite weitergeleitet...");
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen der Checkout-Session");
    },
  });
  
  const handlePurchaseHandbuch = () => {
    if (user) {
      // Logged in user - use regular checkout
      createCheckout.mutate({ productId: 'HANDBUCH' });
    } else {
      // Guest checkout - no login required
      guestCheckout.mutate({ productId: 'HANDBUCH' });
    }
  };
  
  const handleDownloadHandbuch = () => {
    // Download the PDF
    window.open('/handbuch-immobilienprojektentwickler.pdf', '_blank');
  };
  
  const analysisFeatures = [
    {
      icon: Building2,
      title: "Unternehmensanalyse",
      description: "Detaillierte Analyse Ihrer Immobiliengesellschaft und Portfoliostruktur"
    },
    {
      icon: TrendingUp,
      title: "Kapitalmarktfähigkeit",
      description: "Bewertung der Kapitalmarktfähigkeit und Optimierungspotenziale"
    },
    {
      icon: FileText,
      title: "Strukturierungsempfehlung",
      description: "Konkrete Empfehlungen für CLN, Anleihen, Fonds oder andere Instrumente"
    },
    {
      icon: Users,
      title: "Investorenprofil",
      description: "Identifikation passender Investorengruppen und Platzierungsstrategien"
    },
  ];
  
  const handbuchChapters = [
    "Warum Private Debt für Projektentwickler jetzt entscheidend ist",
    "Was ist Private Debt? Klartext statt Buzzwords",
    "Wer sind die Player auf dem PrivateDebt-Markt?",
    "Welche Strukturen und Instrumente gibt es?",
    "Was Private-Debt-Investoren konkret sehen wollen",
    "Schritt-für-Schritt zur Private-Debt-Finanzierung",
    "Kennzahlen, auf die es ankommt",
    "Typische Fehler, die Sie vermeiden sollten",
    "Blueprint: So machen Sie Ihr Unternehmen Private-Debt-ready",
  ];
  
  const included = [
    "Umfassende Due-Diligence-Prüfung",
    "Analyse der Unternehmensstruktur",
    "Bewertung der Finanzierungsoptionen",
    "Strukturierungsempfehlung",
    "Umsetzungsfahrplan mit Zeitplan",
    "Persönliches Beratungsgespräch",
    "Schriftlicher Analysebericht (ca. 30 Seiten)",
    "Follow-up Gespräch nach 2 Wochen",
  ];
  
  // Check if user can download handbuch for free (logged in)
  const canDownloadFree = !!user;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/NonDomGroupLogo25012025.png" 
              alt="Non-Dom Group" 
              className="h-8 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline">Zum Dashboard</Button>
              </Link>
            ) : (
              <Link href="/">
                <Button variant="outline">Zur Startseite</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Wissen & Beratung für Immobilienprofis
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Unsere Produkte
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expertenwissen und professionelle Beratung für Ihren Kapitalmarktzugang
          </p>
        </div>
        
        {/* Products Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          
          {/* Handbuch Card */}
          <Card className="border-2 border-amber-500/30 shadow-lg relative overflow-hidden">
            {/* Bestseller Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-amber-500 hover:bg-amber-600">
                <Star className="w-3 h-3 mr-1" />
                Bestseller
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Handbuch für Immobilienprojektentwickler</CardTitle>
                  <CardDescription>28 Seiten Expertenwissen</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price Section */}
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">€29,90</span>
                  <span className="text-muted-foreground text-sm">inkl. MwSt.</span>
                </div>
                {canDownloadFree && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Gift className="w-3 h-3 mr-1" />
                    Für Sie kostenlos!
                  </Badge>
                )}
              </div>
              
              {/* Subtitle */}
              <p className="text-sm text-muted-foreground">
                <strong>Private Debt</strong> – Wie Sie über den Private-Debt-Markt Refinanzierungskapital gewinnen
              </p>
              
              {/* Chapters Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Inhalte:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {handbuchChapters.slice(0, 5).map((chapter, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{chapter}</span>
                    </li>
                  ))}
                  <li className="text-amber-600 font-medium pl-6">
                    + 4 weitere Kapitel & 5 Anhänge
                  </li>
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3">
              {canDownloadFree ? (
                // Logged in user - free download
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  onClick={handleDownloadHandbuch}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Kostenlos herunterladen
                </Button>
              ) : (
                // Not logged in - show both options
                <div className="w-full space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePurchaseHandbuch}
                    disabled={createCheckout.isPending}
                  >
                    {createCheckout.isPending ? "Wird verarbeitet..." : (
                      <>
                        Jetzt kaufen (€29,90)
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">oder</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    size="lg"
                    onClick={() => {
                      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/shop')}`;
                    }}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Anmelden & kostenlos erhalten
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                PDF-Download • Sofort verfügbar • 28 Seiten
              </p>
            </CardFooter>
          </Card>
          
          {/* Analysis Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Analyse-Paket</CardTitle>
                    <CardDescription>Professionelle Beratung</CardDescription>
                  </div>
                </div>
                {hasPurchasedAnalysis && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Gekauft
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">€2.990</span>
                <span className="text-muted-foreground text-sm">einmalig, zzgl. MwSt.</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Umfassende Analyse Ihrer Immobiliengesellschaft für den Kapitalmarktzugang
              </p>
              
              {/* Features Grid */}
              <div className="grid gap-3">
                {analysisFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3">
              {hasPurchasedAnalysis ? (
                <div className="w-full">
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full" size="lg">
                      Zum Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Sie haben dieses Produkt bereits erworben
                  </p>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePurchaseAnalysis}
                  disabled={createCheckout.isPending || authLoading || analysisLoading}
                >
                  {createCheckout.isPending ? "Wird verarbeitet..." : !user ? (
                    "Anmelden & Kaufen"
                  ) : (
                    <>
                      Jetzt kaufen
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
              
              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Sichere Zahlung</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Sofortiger Zugang</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Analysis Details Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Was im Analyse-Paket enthalten ist
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leistungsumfang</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">So funktioniert's</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Analyse kaufen</h4>
                      <p className="text-xs text-muted-foreground">Sichere Bezahlung über Stripe</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Onboarding ausfüllen</h4>
                      <p className="text-xs text-muted-foreground">Fragebogen zu Ihrem Unternehmen</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Analyse erhalten</h4>
                      <p className="text-xs text-muted-foreground">Innerhalb von 10 Werktagen</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Fragen?</h2>
          <p className="text-muted-foreground mb-4">
            Kontaktieren Sie uns für eine unverbindliche Erstberatung
          </p>
          <Link href="/#kontakt">
            <Button variant="outline" size="lg">
              Kontakt aufnehmen
            </Button>
          </Link>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Non-Dom Group. Alle Rechte vorbehalten.
            </div>
            <div className="flex gap-4 text-sm">
              <Link href="/impressum" className="text-muted-foreground hover:text-foreground">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-muted-foreground hover:text-foreground">
                Datenschutz
              </Link>
              <Link href="/agb" className="text-muted-foreground hover:text-foreground">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
