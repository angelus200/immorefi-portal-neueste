import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Building2, TrendingUp, EuroIcon, Clock,
  CheckCircle2, AlertCircle, Users, Calendar,
} from "lucide-react";
import { Link } from "wouter";

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatEur(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function ProjectStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    draft:          { label: "Entwurf",          icon: <Clock className="w-3 h-3 mr-1" />,         className: "bg-gray-100 text-gray-700 border-gray-300" },
    pending_review: { label: "In Prüfung",        icon: <AlertCircle className="w-3 h-3 mr-1" />,   className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    active:         { label: "Aktiv — Zeichnung offen", icon: <CheckCircle2 className="w-3 h-3 mr-1" />, className: "bg-green-100 text-green-700 border-green-300" },
    fully_funded:   { label: "Voll finanziert",   icon: <CheckCircle2 className="w-3 h-3 mr-1" />,  className: "bg-blue-100 text-blue-700 border-blue-300" },
    closed:         { label: "Geschlossen",        icon: <Clock className="w-3 h-3 mr-1" />,         className: "bg-gray-200 text-gray-600 border-gray-400" },
    cancelled:      { label: "Abgebrochen",        icon: <AlertCircle className="w-3 h-3 mr-1" />,   className: "bg-red-100 text-red-700 border-red-300" },
  };
  const cfg = map[status] ?? { label: status, icon: null, className: "" };
  return (
    <Badge variant="outline" className={`flex items-center w-fit text-sm px-3 py-1 ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </Badge>
  );
}

// ─── Status-Erklärungen für den Anbieter ─────────────────────────────────────

const statusDescriptions: Record<string, string> = {
  draft:          "Ihr Projekt ist als Entwurf gespeichert. Unser Team wird es in Kürze prüfen.",
  pending_review: "Ihr Projekt wird aktuell von unserem Team geprüft. Sie erhalten eine Benachrichtigung, sobald es freigegeben wird.",
  active:         "Ihr Projekt ist für qualifizierte Investoren sichtbar. Zeichnungen können eingehen.",
  fully_funded:   "Herzlichen Glückwunsch! Ihr Projekt wurde vollständig finanziert.",
  closed:         "Ihr Projekt wurde abgeschlossen.",
  cancelled:      "Ihr Projekt wurde abgebrochen. Bitte kontaktieren Sie uns für weitere Informationen.",
};

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function ClubDealStatus() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });

  // Alle eigenen Projekte laden
  const { data: projects, isLoading: projectsLoading } = trpc.clubDeal.getMyProjects.useQuery(undefined, {
    enabled: !!user,
  });

  // Loading
  if (loading || projectsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Kein Projekt vorhanden → Hinweis mit Shop-Link
  if (!projects || projects.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-xl mx-auto mt-12 text-center space-y-6">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Kein Club Deal Projekt</h2>
          <p className="text-muted-foreground">
            Sie haben noch kein Club Deal Paket erworben. Starten Sie Ihr Projekt jetzt.
          </p>
          <Link href="/shop">
            <Button size="lg">Club Deal Paket kaufen</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Letztes (aktuellstes) Projekt anzeigen
  const project = projects[0];
  const progress = project.targetVolume > 0
    ? Math.min(100, Math.round((project.currentVolume / project.targetVolume) * 100))
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl">

        {/* ─── Seitentitel ─── */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Mein Club Deal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status und Fortschritt Ihres Projekts
          </p>
        </div>

        {/* ─── Status-Banner ─── */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                {project.location && (
                  <CardDescription>{project.location}</CardDescription>
                )}
              </div>
              <ProjectStatusBadge status={project.status} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {statusDescriptions[project.status] ?? ""}
            </p>
          </CardContent>
        </Card>

        {/* ─── Kennzahlen-Grid ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <EuroIcon className="h-3 w-3" /> Zielvolumen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatEur(project.targetVolume)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" /> Eingesammelt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatEur(project.currentVolume)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" /> Investoren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{project.currentInvestors} / {project.maxInvestors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" /> Laufzeit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{project.duration} Mo.</p>
            </CardContent>
          </Card>
        </div>

        {/* ─── Fortschrittsbalken ─── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Finanzierungsfortschritt</CardTitle>
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatEur(project.currentVolume)} eingesammelt</span>
              <span>Ziel: {formatEur(project.targetVolume)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ─── Projekt-Details ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projekt-Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Projektart</dt>
                <dd className="font-medium capitalize mt-0.5">{project.projectType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Investmentart</dt>
                <dd className="font-medium capitalize mt-0.5">{project.investmentType.replace(/_/g, " ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Erwartete Rendite</dt>
                <dd className="font-medium mt-0.5">{project.expectedReturn}% p.a.</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Min. Investition</dt>
                <dd className="font-medium mt-0.5">{formatEur(project.minInvestment)}</dd>
              </div>
            </dl>
            {project.description && (
              <div className="mt-4">
                <dt className="text-muted-foreground text-sm">Beschreibung</dt>
                <dd className="text-sm mt-1">{project.description}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Nächste Schritte (nur bei draft/pending) ─── */}
        {(project.status === "draft" || project.status === "pending_review") && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-800">Nächste Schritte</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Unser Team prüft Ihr Projekt und meldet sich bei Ihnen</li>
                <li>Nach Freigabe wird Ihr Projekt qualifizierten Investoren vorgestellt</li>
                <li>Sie werden über jede neue Zeichnung informiert</li>
              </ul>
              <p className="text-xs text-blue-600 mt-3">
                Bei Fragen: <a href="mailto:info@immorefi.de" className="underline">info@immorefi.de</a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* ─── Mehrere Projekte ─── */}
        {projects.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weitere Projekte ({projects.length - 1})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {projects.slice(1).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{p.title}</span>
                  <ProjectStatusBadge status={p.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
