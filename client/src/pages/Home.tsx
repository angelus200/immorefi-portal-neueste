import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Building2,
  TrendingUp,
  Shield,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ChevronRight,
  BookOpen,
  Download,
  Linkedin,
  Facebook
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { FinanceCalculator } from "@/components/FinanceCalculator";
import { VideoCarousel } from "@/components/VideoCarousel";
import { Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Default tenant ID for the main landing page
const DEFAULT_TENANT_ID = 1;

// Market growth data for hero chart
const marketData = [
  { year: '2020', value: 8 },
  { year: '2021', value: 9.2 },
  { year: '2022', value: 10.5 },
  { year: '2023', value: 11.3 },
  { year: '2024', value: 12.5 }
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    kapitalbedarf: "",
    zeithorizont: "",
    beschreibung: "",
  });

  const createLead = trpc.lead.createPublic.useMutation({
    onSuccess: () => {
      toast.success("Vielen Dank! Wir werden uns in Kürze bei Ihnen melden.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        kapitalbedarf: "",
        zeithorizont: "",
        beschreibung: "",
      });
    },
    onError: (error) => {
      console.error('Lead creation failed:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate({
      tenantId: DEFAULT_TENANT_ID,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      capitalNeed: formData.kapitalbedarf || undefined,
      timeHorizon: formData.zeithorizont || undefined,
      description: formData.beschreibung || undefined,
      source: "website",
    });
  };

  // Logo queries
  const { data: pressLogos = [] } = trpc.partnerLogo.list.useQuery({ category: "presse" });
  const { data: membershipLogos = [] } = trpc.partnerLogo.list.useQuery({ category: "mitgliedschaft" });
  const { data: awardLogos = [] } = trpc.partnerLogo.list.useQuery({ category: "auszeichnung" });

  // Guest checkout for Handbuch direct purchase
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

  const handleDirectPurchaseHandbuch = () => {
    guestCheckout.mutate({ productId: 'HANDBUCH' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <img src="/images/logos/non-dom-group-logo.webp" alt="Non Dom Group" className="h-10" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#leistungen" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Leistungen
            </a>
            <a href="#prozess" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Prozess
            </a>
            <a href="#kontakt" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Kontakt
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>
                  Dashboard
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="outline">Login</Button>
                </Link>
                <a href="#kontakt">
                  <Button>
                    Beratung anfragen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Kapitalmarktzugang für Immobilienunternehmen
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-foreground">Ihr Zugang zum</span>{" "}
                <span className="text-primary">Kapitalmarkt</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Wir strukturieren für Immobilienunternehmen Credit Linked Notes, Anleihen, 
                Zertifikate und Fonds. Profitieren Sie von unserem Netzwerk aus Banken und Kapitalmarktexperten.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#kontakt">
                  <Button size="lg" className="w-full sm:w-auto">
                    Analyse anfordern
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#prozess">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    So funktioniert's
                  </Button>
                </a>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Projekte</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">€2Mrd+</div>
                  <div className="text-sm text-muted-foreground">Volumen</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Erfolgsquote</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-xl" />
              <div className="relative rounded-3xl shadow-2xl overflow-hidden">
                {/* Professional Real Estate Image */}
                <img
                  src="/images/AdobeStock_650048976.jpeg"
                  alt="Professionelles Immobilien-Stadtmodell"
                  className="w-full h-[500px] object-cover"
                />

                {/* Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-8">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="text-2xl font-bold text-white">500+</div>
                      <div className="text-xs text-white/80">Projekte</div>
                    </div>
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="text-2xl font-bold text-white">€2Mrd+</div>
                      <div className="text-xs text-white/80">Volumen</div>
                    </div>
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="text-2xl font-bold text-white">98%</div>
                      <div className="text-xs text-white/80">Erfolgsquote</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Carousel Section */}
      <VideoCarousel />

      {/* Trust Badges - Dynamic from DB */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-8">Bekannt aus</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {/* Press logos from database */}
            {pressLogos.map((logo) => (
              <a
                key={logo.id}
                href={logo.linkUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src={logo.imageUrl}
                  alt={logo.name}
                  className="h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </a>
            ))}

            {/* Fallback SVG logos if DB empty */}
            {pressLogos.length === 0 && (
              <>
                <a href="https://unternehmen.focus.de/amazon-markenaufbau.html" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <svg viewBox="0 0 140 40" className="h-8" role="img" aria-label="FOCUS">
                    <rect fill="#E4002B" width="140" height="40" rx="2"/>
                    <text x="70" y="26" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">FOCUS</text>
                  </svg>
                </a>
                <a href="https://www.forbes.at/artikel/internationale-firmengruendung-optimiert" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <svg viewBox="0 0 140 40" className="h-8" role="img" aria-label="Forbes">
                    <rect fill="#000000" width="140" height="40" rx="2"/>
                    <text x="70" y="28" fill="white" fontSize="20" fontWeight="normal" textAnchor="middle" fontFamily="serif">Forbes</text>
                  </svg>
                </a>
              </>
            )}

            <div className="text-xl font-bold text-muted-foreground opacity-60">Handelsblatt</div>
            <div className="text-xl font-bold text-muted-foreground opacity-60">Manager Magazin</div>
          </div>
        </div>
      </section>

      {/* Auszeichnungen & Mitgliedschaften - Dynamic from DB */}
      <section className="py-16 bg-gray-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Auszeichnungen & Mitgliedschaften</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">

            {/* Dynamic awards logos from database */}
            {awardLogos.map((logo) => (
              <a
                key={logo.id}
                href={logo.linkUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src={logo.imageUrl}
                  alt={logo.name}
                  className="h-24 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </a>
            ))}

            {/* Dynamic membership logos from database */}
            {membershipLogos.map((logo) => (
              <a
                key={logo.id}
                href={logo.linkUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src={logo.imageUrl}
                  alt={logo.name}
                  className="h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </a>
            ))}

            {/* Fallback CSS logos if DB empty */}
            {awardLogos.length === 0 && membershipLogos.length === 0 && (
              <>
                {/* Fallback diind Siegel */}
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg border-4 border-yellow-500">
                  <div className="text-[8px] font-bold text-yellow-900 uppercase tracking-tight">Unternehmen</div>
                  <div className="text-[10px] font-bold text-yellow-900 uppercase">der Zukunft</div>
                  <div className="text-[6px] text-yellow-800 mt-1 text-center px-2">diind</div>
                </div>
                {/* Fallback Swiss Startup */}
                <div className="text-center font-bold leading-tight">
                  <div className="text-sm text-foreground">swiss startup</div>
                  <div className="text-sm text-foreground">associati<span className="text-red-600">o</span>n</div>
                </div>
                {/* Fallback BAND */}
                <div className="flex items-center gap-3">
                  <div className="flex shadow-md">
                    <span className="bg-red-600 text-white px-2 py-1.5 font-bold text-lg">B</span>
                    <span className="bg-white text-red-600 px-2 py-1.5 font-bold text-lg border-2 border-red-600 border-l-0">A</span>
                    <span className="bg-red-600 text-white px-2 py-1.5 font-bold text-lg">N</span>
                    <span className="bg-red-600 text-white px-2 py-1.5 font-bold text-lg">D</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-tight font-semibold uppercase">
                    Business<br/>Angels<br/>Deutschland
                  </div>
                </div>
              </>
            )}

          </div>
          <p className="text-center text-muted-foreground text-sm mt-6">
            Stolzes Mitglied führender Wirtschaftsverbände
          </p>
        </div>
      </section>

      {/* Analyse Section - Hauptprodukt */}
      <section id="analyse" className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <FileText className="h-4 w-4" />
                Stufe 1 – Einstiegsleistung
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Analyse & <span className="text-primary">Strukturierungsdiagnose</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Die Refinanzierungs- und Kapitalstrukturierung von Bauträgern ist stets individuell. 
                Art, Umfang, Modelllogik und regulatorische Einordnung können erst nach einer fundierten Analyse 
                belastbar definiert werden.
              </p>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Die Analyse umfasst:</h3>
                <ul className="space-y-3">
                  {[
                    "Sichtung und Auswertung Ihrer Unterlagen (Jahresabschlüsse, Projektkalkulationen, Finanzierungsverträge)",
                    "Analyse der bestehenden Finanzierungsstruktur (Eigen-/Fremdkapital, Covenants, Rangfolgen)",
                    "Bewertung der Finanzierungsfähigkeit über Banken, Private Debt, CLN oder Fonds",
                    "Entwicklung möglicher Strukturierungsansätze (CLN, Fonds, SPV, Holding-Umbau)",
                    "Regulatorische Einordnung und Identifikation erforderlicher Partner",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <Card className="border-2 border-primary shadow-xl">
                <CardHeader className="text-center pb-2">
                  <div className="text-sm text-muted-foreground">Analyse & Strukturierungsdiagnose</div>
                  <div className="text-5xl font-bold text-primary">€ 2.990</div>
                  <div className="text-sm text-muted-foreground">zzgl. MwSt. | Einmaliges Fixhonorar</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Ergebnis der Analyse:</h4>
                    <ul className="space-y-2 text-sm">
                      {[
                        "Zusammenfassung der Ausgangslage",
                        "Bewertung der Finanzierungs- und Kapitalstruktur",
                        "Darstellung identifizierter Schwachstellen",
                        "Beschreibung möglicher Strukturierungsoptionen",
                        "Empfehlung eines priorisierten Vorgehens",
                        "Grobe Roadmap mit Meilensteinen",
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                      Typische Dauer: 3–4 Wochen ab vollständigem Eingang aller Unterlagen. 
                      Die Analyse ist Voraussetzung für alle weiteren Strukturierungs- oder Umsetzungsleistungen.
                    </p>
                  </div>
                  <Link href="/shop">
                    <Button className="w-full" size="lg">
                      Analyse kaufen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Handbuch Section - Kostenlos bei Anmeldung */}
      <section id="handbuch" className="py-16 lg:py-24 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Kostenloses Expertenwissen
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Handbuch für <span className="text-amber-600">Immobilienprojektentwickler</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                <strong>Private Debt</strong> – Wie Sie über den Private-Debt-Markt Refinanzierungskapital gewinnen.
                28 Seiten Expertenwissen mit 9 Kapiteln und 5 Anhängen.
              </p>
              <ul className="space-y-3">
                {[
                  "Warum Private Debt für Projektentwickler jetzt entscheidend ist",
                  "Wer sind die Player auf dem Private-Debt-Markt?",
                  "Welche Strukturen und Instrumente gibt es?",
                  "Schritt-für-Schritt zur Private-Debt-Finanzierung",
                  "Blueprint: So machen Sie Ihr Unternehmen Private-Debt-ready",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Card className="border-2 border-amber-500/30 shadow-xl bg-white dark:bg-card">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-amber-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Jetzt kostenlos erhalten</CardTitle>
                  <CardDescription className="text-base">
                    Melden Sie sich an und laden Sie das Handbuch sofort herunter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 line-through opacity-50">€29,90</div>
                      <div className="text-sm text-muted-foreground">Normalpreis</div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">Kostenlos</div>
                      <div className="text-sm text-muted-foreground">bei Anmeldung</div>
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    {isAuthenticated ? (
                      <Button
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        size="lg"
                        onClick={() => window.open('/downloads/handbuch-immobilienprojektentwickler.pdf', '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Zum Handbuch
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          size="lg"
                          onClick={() => window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/shop')}`}
                        >
                          Kostenlos anmelden & herunterladen
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-card px-2 text-muted-foreground">oder</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-950"
                          size="lg"
                          onClick={handleDirectPurchaseHandbuch}
                          disabled={guestCheckout.isPending}
                        >
                          {guestCheckout.isPending ? "Wird verarbeitet..." : "Direkt kaufen für €29,90"}
                        </Button>
                      </>
                    )}
                    <p className="text-xs text-center text-muted-foreground">
                      PDF-Download • 28 Seiten • Sofort verfügbar
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Selbsttest Quiz Section */}
      <section id="selbsttest" className="py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50 dark:from-background dark:to-slate-950/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <CheckCircle2 className="h-4 w-4" />
              3-Minuten Selbsttest
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sind Sie bereit für eine <span className="text-primary">professionelle Refinanzierung</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Finden Sie in nur 3 Minuten heraus, ob Ihre Immobilienprojekte für eine professionelle 
              Refinanzierungsstrategie mit Investoren, Fonds oder Club Deals geeignet sind.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-card rounded-2xl shadow-xl border overflow-hidden">
              <iframe 
                src="https://link.non-dom.group/widget/quiz/6zCsuLxQjK3cqE7TQr4L"
                style={{ width: '100%', height: '700px', border: 'none' }}
                title="Refinanzierungs-Selbsttest"
                allow="clipboard-write"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Am Ende erhalten Sie eine klare Auswertung und erfahren, welche nächsten Schritte für Sie sinnvoll sind.
            </p>
          </div>
        </div>
      </section>

      {/* Finanzrechner Section */}
      <section id="rechner" className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calculator className="h-4 w-4" />
              Interaktive Rechner
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Analysieren Sie Ihre <span className="text-primary">Finanzierungsstruktur</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Nutzen Sie unsere Rechner, um Kapitallücken, Risiken und Optimierungspotenziale zu identifizieren.
            </p>
          </div>
          
          <FinanceCalculator />
        </div>
      </section>

      {/* Services Section */}
      <section id="leistungen" className="py-20 lg:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Strukturierungs<span className="text-primary">module</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Nach der Analyse: Maßgeschneiderte Kapitalmarktlösungen für Ihr Unternehmen
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Credit Linked Notes (CLN)",
                description: "Strukturierte Schuldverschreibungen, deren Rückzahlung an definierte Kredit- oder Projektparameter gekoppelt ist.",
              },
              {
                icon: TrendingUp,
                title: "Actively Managed Certificates",
                description: "Strukturierte Finanzinstrumente mit aktiv gemanagtem Referenzportfolio für institutionelle Investoren.",
              },
              {
                icon: Shield,
                title: "Private Placements",
                description: "Prospektfreie Angebote ausschließlich für professionelle oder semiprofessionelle Investoren.",
              },
              {
                icon: Users,
                title: "Fonds & SPVs",
                description: "Alternative Investment Funds (AIF), SICAV-Strukturen und Special Purpose Vehicles für Ihr Portfolio.",
              },
              {
                icon: FileText,
                title: "Club Deals",
                description: "Exklusive Co-Investment-Strukturen mit ausgewählten Investorengruppen auf individueller Basis.",
              },
              {
                icon: CheckCircle2,
                title: "Holding-Umbauten",
                description: "Gruppenumbauten und Strukturoptimierungen zur Verbesserung der Kapitalmarktfähigkeit.",
              },
            ].map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              Der Auftragnehmer erbringt ausschließlich strukturierende, analytische und beratende Leistungen. 
              Es werden keine erlaubnispflichtigen Tätigkeiten wie Anlageberatung, Vermittlung oder Platzierung 
              von Finanzinstrumenten erbracht. Sämtliche regulierungsrelevanten Leistungen werden durch lizenzierte Partner übernommen.
            </p>
          </div>
        </div>
      </section>

      {/* Process Section - Stufenmodell */}
      <section id="prozess" className="py-20 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unser <span className="text-primary">Stufenmodell</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Die Leistungserbringung erfolgt stufenweise – transparent und planbar
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "Stufe 1",
                title: "Analyse & Strukturierungsdiagnose",
                price: "€ 2.990",
                description: "Eigenständige, abgeschlossene Beratungsleistung als Voraussetzung für alle weiteren Schritte. Inkl. SWOT-Analyse, Finanzierungsfähigkeit, Strukturierungsoptionen und Handlungsempfehlungen.",
                highlight: true,
              },
              {
                step: "Stufe 2",
                title: "Strukturierung",
                price: "Pauschale je Modul",
                description: "CLN-Strukturen, Fonds- oder SPV-Setups, Holding-Umbauten, Anleihen oder AMC – separate Pauschalen je nach gewähltem Strukturierungsansatz.",
                highlight: false,
              },
              {
                step: "Stufe 3",
                title: "Umsetzung & Kapitalakquise",
                price: "Erfolgsabhängig",
                description: "Erfolgsabhängige Vergütung ausschließlich auf tatsächlich eingeworbenes Kapital. Platzierung durch lizenzierte Partner.",
                highlight: false,
              },
            ].map((item, index) => (
              <Card key={index} className={`relative ${item.highlight ? 'border-primary border-2 shadow-lg' : ''}`}>
                {item.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Einstieg
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="text-sm font-medium text-primary mb-2">{item.step}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <div className="text-2xl font-bold text-primary mt-2">{item.price}</div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-center">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Eine Anrechnung des Analysehonorars auf spätere Leistungen erfolgt nicht automatisch, 
              sondern nur auf Basis gesonderter Vereinbarung. Alle Preise zzgl. MwSt.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="kontakt" className="py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Starten Sie Ihre <span className="text-primary">Anfrage</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Füllen Sie das Formular aus und wir melden uns innerhalb von 48 Stunden 
                  für ein erstes Gespräch bei Ihnen.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Telefon</div>
                    <div className="text-muted-foreground">+41 44 500 41 00</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">E-Mail</div>
                    <div className="text-muted-foreground">info@non-dom.group</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Adresse</div>
                    <div className="text-muted-foreground">
                      Marketplace24-7 GmbH<br />
                      Kantonsstrasse 1<br />
                      8807 Freienbach SZ<br />
                      Schweiz
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      HR Kanton Schwyz: CH-130.4.033.363-2
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Google Maps */}
              <div className="mt-8 rounded-xl overflow-hidden border shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2711.8!2d8.7547!3d47.2047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479ab6d8e8a8b8b7%3A0x8b8b8b8b8b8b8b8b!2sKantonsstrasse%201%2C%208807%20Freienbach%2C%20Switzerland!5e0!3m2!1sen!2sch!4v1704672000000!5m2!1sen!2sch"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Standort Marketplace24-7 GmbH"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </div>
            
            {/* Lead Form */}
            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle>Kontaktformular</CardTitle>
                <CardDescription>
                  Alle Felder mit * sind Pflichtfelder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Max Mustermann"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="max@beispiel.de"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        placeholder="+49 123 456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Unternehmen</Label>
                      <Input
                        id="company"
                        placeholder="Firma GmbH"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kapitalbedarf">Kapitalbedarf</Label>
                      <Select
                        value={formData.kapitalbedarf}
                        onValueChange={(value) => setFormData({ ...formData, kapitalbedarf: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unter-500k">Unter 500.000 €</SelectItem>
                          <SelectItem value="500k-1m">500.000 € - 1 Mio. €</SelectItem>
                          <SelectItem value="1m-5m">1 Mio. € - 5 Mio. €</SelectItem>
                          <SelectItem value="5m-10m">5 Mio. € - 10 Mio. €</SelectItem>
                          <SelectItem value="ueber-10m">Über 10 Mio. €</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zeithorizont">Zeithorizont</Label>
                      <Select
                        value={formData.zeithorizont}
                        onValueChange={(value) => setFormData({ ...formData, zeithorizont: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sofort">Sofort</SelectItem>
                          <SelectItem value="1-3-monate">1-3 Monate</SelectItem>
                          <SelectItem value="3-6-monate">3-6 Monate</SelectItem>
                          <SelectItem value="6-12-monate">6-12 Monate</SelectItem>
                          <SelectItem value="ueber-12-monate">Über 12 Monate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="beschreibung">Projektbeschreibung</Label>
                    <Textarea
                      id="beschreibung"
                      placeholder="Beschreiben Sie kurz Ihr Projekt oder Anliegen..."
                      rows={4}
                      value={formData.beschreibung}
                      onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={createLead.isPending}
                  >
                    {createLead.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        Anfrage absenden
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-32 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Häufig gestellte <span className="text-primary">Fragen</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Antworten auf die wichtigsten Fragen zu unseren Leistungen
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "Was kostet die Portfolio-Analyse?",
                answer: "Die Kosten für unsere Portfolio-Analyse richten sich nach Umfang und Komplexität Ihres Portfolios. Nach einem ersten Gespräch erstellen wir Ihnen ein individuelles Angebot.",
              },
              {
                question: "Welche Unterlagen benötigen Sie für eine Analyse?",
                answer: "Für eine detaillierte Analyse benötigen wir Unterlagen wie Exposés, Mietverträge, Grundbuchauszüge, aktuelle Bewertungen und bestehende Finanzierungsunterlagen.",
              },
              {
                question: "Wie funktioniert die Honorarberatung?",
                answer: "Alle unsere Leistungen werden auf Honorarbasis abgerechnet. So stellen wir sicher, dass wir unabhängig und ausschließlich in Ihrem Interesse handeln.",
              },
              {
                question: "Welche Kapitalmarktprodukte bieten Sie an?",
                answer: "Wir strukturieren Credit Linked Notes (CLN), Anleihen, Zertifikate, Fonds (z.B. SICAV), SPVs und Club Deals – je nach Ihren individuellen Anforderungen.",
              },
              {
                question: "Ab welchem Volumen arbeiten Sie?",
                answer: "Wir arbeiten mit Portfolios ab einem Volumen von 5 Mio. €. Nach oben gibt es keine Grenze – wir haben bereits Projekte mit über 100 Mio. € erfolgreich strukturiert.",
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Vertriebspartner Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Partnerschaft
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Werden Sie <span className="text-primary">Vertriebspartner</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Profitieren Sie von attraktiven Provisionen und werden Sie Teil unseres Netzwerks. 
              Als Vertriebspartner der NON DOM Group erhalten Sie Zugang zu exklusiven Produkten 
              und umfassender Unterstützung.
            </p>
            <a 
              href="https://vertrieb.non-dom.group" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              Jetzt Vertriebspartner werden
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-primary">NON</span>
                <span className="text-xl font-bold text-primary bg-primary/10 px-1 rounded">DOM</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider ml-1">Group</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ihr Partner für Kapitalmarktzugang und strukturierte Immobilieninvestments.
              </p>
              <div className="flex gap-4 mt-4">
                <a 
                  href="https://www.facebook.com/nondomgroup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/non-dom-group/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Leistungen</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Credit Linked Notes</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Portfolio-Analyse</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Fonds & SPVs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Club Deals</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">Über uns</Link></li>
                <li><Link href="/team" className="hover:text-primary transition-colors">Team</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Karriere</a></li>
                <li><Link href="/press" className="hover:text-primary transition-colors">Presse</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/impressum" className="hover:text-primary transition-colors">Impressum</Link></li>
                <li><Link href="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link></li>
                <li><Link href="/agb" className="hover:text-primary transition-colors">AGB</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie-Einstellungen</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Marketplace24-7 GmbH (NON DOM Group). Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
