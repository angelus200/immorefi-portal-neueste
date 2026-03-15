/**
 * InvestorLanding — Öffentliche Einstiegsseite für den Investoren-Bereich
 * Pattern: identisch zu Affiliate.tsx
 * - Nicht eingeloggt → Öffentlicher Header (wie Home.tsx Navbar) + Marketing-Content
 * - Eingeloggt       → DashboardLayout + gleicher Marketing-Content
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2, Building2, Shield, Layers, CheckCircle2, ArrowRight,
  ClipboardCheck, Search, TrendingUp,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

// ─── Öffentlicher Header (identisch zu Affiliate.tsx) ────────────────────────

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <img src="/images/logos/non-dom-group-logo.webp" alt="Non Dom Group" className="h-10" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#leistungen">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Leistungen</span>
          </Link>
          <Link href="/#prozess">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Prozess</span>
          </Link>
          <Link href="/#faq">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">FAQ</span>
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Registrieren
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Marketing-Inhalt ────────────────────────────────────────────────────────

const advantages = [
  {
    icon: Shield,
    title: "Geprüfte Projekte",
    description:
      "Jedes Projekt durchläuft Due Diligence, Rating und professionelle Analyse durch unser Team — bevor es für Investoren zugänglich wird.",
  },
  {
    icon: Building2,
    title: "Exklusiver Zugang",
    description:
      "Nur für qualifizierte, professionelle Investoren. Maximal 18 Investoren pro Projekt — für echte Exklusivität und persönliche Begleitung.",
  },
  {
    icon: Layers,
    title: "Flexible Strukturen",
    description:
      "Nachrangdarlehen, Stille Beteiligung, Anleihe oder Genussrecht — wir wählen die optimale Struktur für Rendite und Risikoprofil.",
  },
];

const steps = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Registrieren & Qualifizieren",
    description:
      "Kostenloses Profil als professioneller Investor anlegen. Selbstauskunft bestätigen — dauert unter 2 Minuten.",
  },
  {
    icon: Search,
    step: "02",
    title: "Projekte prüfen",
    description:
      "Zugang zu Pitchdeck, Businessplan, Due Diligence und Rating. Alle Unterlagen auf einen Blick, transparent und vollständig.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Investieren",
    description:
      "Zeichnung abgeben, Abwicklung peer-to-peer oder über Treuhänder. Mindestzeichnung €100.000, Laufzeiten 12–60 Monate.",
  },
];

function LandingContent() {
  return (
    <div className="space-y-0">

      {/* ─── Hero ─── */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              Club Deal Investoren-Bereich
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Exklusive{" "}
              <span className="text-primary">Immobilien-Investments</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Investieren Sie in geprüfte Immobilienprojekte im DACH-Raum.
              Ab €100.000, maximal 18 Investoren pro Projekt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/investor/onboarding">
                <Button size="lg" className="w-full sm:w-auto group">
                  Jetzt als Investor registrieren
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Erstberatung buchen
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Projektvolumen €1 Mio. bis €3 Mio. · Mindestzeichnung €100.000
            </p>
          </div>

          {/* ─── Vorteile-Karten ─── */}
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {advantages.map((item, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── So funktioniert's ─── */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              So funktioniert&apos;s
            </h2>
            <p className="text-lg text-muted-foreground">
              In drei Schritten zur ersten Zeichnung
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA-Banner ─── */}
      <section className="py-20 lg:py-24">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Bereit zu <span className="text-primary">investieren?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Registrieren Sie sich kostenlos als qualifizierter Investor und erhalten Sie
            sofortigen Zugang zu aktuellen Club Deal Projekten.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/investor/onboarding">
              <Button size="lg" className="w-full sm:w-auto group">
                Kostenlos registrieren
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/booking">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Erstberatung buchen
              </Button>
            </Link>
          </div>

          {/* Vertrauens-Punkte */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-4">
            {[
              "Kostenlose Registrierung",
              "Keine Mindestlaufzeit",
              "DACH-weit aktiv",
            ].map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                {point}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground pt-2 max-w-2xl mx-auto">
            Nur für professionelle und qualifizierte Investoren. Ein vollständiger Kapitalverlust ist möglich.
            Diese Seite stellt keine Anlageberatung dar. ImmoRefi ist eine SaaS-Plattform — die
            Investitionsabwicklung erfolgt peer-to-peer direkt zwischen Anbieter und Investor oder über einen
            regulierten Treuhänder. ImmoRefi ist nicht Vertragspartei der Investition.
          </p>
          <Link href="/risikohinweise">
            <span className="text-xs underline text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Vollständige Risikohinweise lesen
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function InvestorLanding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Wenn User bereits Investor ist → direkt zum Dashboard
  const { data: statusData, isLoading: statusLoading } = trpc.clubDeal.checkStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (statusData?.isInvestor) {
      setLocation("/investor/dashboard");
    }
  }, [statusData, setLocation]);

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nicht eingeloggt → öffentlicher Header + Content (kein DashboardLayout)
  if (!user) {
    return (
      <div className="min-h-screen">
        <PublicHeader />
        <LandingContent />
      </div>
    );
  }

  // Eingeloggt (aber noch kein Investor) → DashboardLayout + gleicher Content
  return (
    <DashboardLayout>
      <LandingContent />
    </DashboardLayout>
  );
}
