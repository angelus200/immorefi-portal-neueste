import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Building2, MapPin, TrendingUp, Calendar, Users, ArrowRight, Inbox,
} from "lucide-react";
import { Link, useLocation } from "wouter";

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatEur(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  residential:  "Wohnimmobilien",
  commercial:   "Gewerbeimmobilien",
  mixed:        "Gemischt",
  renovation:   "Sanierung",
  development:  "Neubau",
};

const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  nachrangdarlehen:   "Nachrangdarlehen",
  stille_beteiligung: "Stille Beteiligung",
  anleihe:            "Anleihe",
  genussrecht:        "Genussrecht",
};

// ─── Projekt-Karte ────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: any }) {
  const progress = project.targetVolume > 0
    ? Math.min(100, Math.round((project.currentVolume / project.targetVolume) * 100))
    : 0;
  const remaining = project.targetVolume - project.currentVolume;
  const slotsLeft = project.maxInvestors - project.currentInvestors;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
            {project.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {project.location}
              </p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            {PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* Beschreibung */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        )}

        {/* Kennzahlen */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">Rendite:</span>
            <span className="font-semibold">{project.expectedReturn}% p.a.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">Laufzeit:</span>
            <span className="font-semibold">{project.duration} Mo.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">Typ:</span>
            <span className="font-semibold text-xs">{INVESTMENT_TYPE_LABELS[project.investmentType] ?? project.investmentType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">Slots:</span>
            <span className={`font-semibold ${slotsLeft === 0 ? "text-orange-500" : ""}`}>
              {slotsLeft > 0 ? `${slotsLeft} frei` : "Warteliste"}
            </span>
          </div>
        </div>

        {/* Fortschrittsbalken */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatEur(project.currentVolume)} gezeichnet</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ziel: {formatEur(project.targetVolume)}</span>
            <span>Noch: {formatEur(remaining)}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-1 mt-auto">
          <Link href={`/investor/project/${project.id}`}>
            <Button className="w-full group/btn" size="sm">
              Details ansehen
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function InvestorDashboard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  // Investor-Status prüfen
  const { data: statusData, isLoading: statusLoading } = trpc.clubDeal.checkStatus.useQuery(undefined, {
    enabled: !!user,
  });

  // Aktive Projekte laden (nur wenn Investor)
  const { data: projects, isLoading: projectsLoading } = trpc.clubDeal.getActiveProjects.useQuery(undefined, {
    enabled: !!statusData?.isInvestor,
  });

  // Kein Investor → Onboarding
  useEffect(() => {
    if (!statusLoading && statusData && !statusData.isInvestor) {
      setLocation("/investor/onboarding");
    }
  }, [statusData, statusLoading, setLocation]);

  const isLoading = loading || statusLoading || projectsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* ─── Seitentitel ─── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Club Deal Projekte
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Aktuelle Investitionsmöglichkeiten für qualifizierte Investoren
            </p>
          </div>
          <Link href="/investor/subscriptions">
            <Button variant="outline" size="sm">
              Meine Zeichnungen
            </Button>
          </Link>
        </div>

        {/* ─── Projekte-Grid ─── */}
        {!projects || projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Inbox className="h-12 w-12 text-muted-foreground/40" />
              <div className="text-center space-y-1">
                <CardTitle className="text-lg text-muted-foreground">Keine aktiven Projekte</CardTitle>
                <CardDescription>
                  Aktuell sind keine Club Deal Projekte zur Zeichnung verfügbar.
                  <br />
                  Wir informieren Sie sobald neue Projekte freigeschaltet werden.
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {projects.length} Projekt{projects.length !== 1 ? "e" : ""} verfügbar
            </p>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}

        {/* ─── Hinweis ─── */}
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto pt-4 border-t">
          Club Deal Investitionen sind ausschließlich für professionelle und qualifizierte Investoren.
          Alle Angaben ohne Gewähr. Ein vollständiger Kapitalverlust ist möglich.
        </p>
      </div>
    </DashboardLayout>
  );
}
