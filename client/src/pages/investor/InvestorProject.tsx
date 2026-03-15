import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2, Building2, MapPin, TrendingUp, Calendar, Users, EuroIcon,
  Download, FileText, CheckCircle2, Clock, AlertCircle, ArrowLeft, XCircle,
} from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

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

const DOC_LABELS: Record<string, string> = {
  pitchdeck:     "Pitchdeck",
  businessplan:  "Businessplan",
  due_diligence: "Due Diligence",
  rating:        "Rating",
};

// ─── Zeichnungs-Status-Badge ──────────────────────────────────────────────────

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending:    { label: "Ausstehend",    icon: <Clock className="w-3 h-3 mr-1" />,         className: "text-yellow-600 border-yellow-600" },
    confirmed:  { label: "Bestätigt",    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,  className: "bg-green-500 text-white border-green-500" },
    waitlisted: { label: "Warteliste",   icon: <AlertCircle className="w-3 h-3 mr-1" />,   className: "text-blue-600 border-blue-600" },
    cancelled:  { label: "Storniert",    icon: <XCircle className="w-3 h-3 mr-1" />,       className: "text-muted-foreground border-muted" },
    completed:  { label: "Abgeschlossen",icon: <CheckCircle2 className="w-3 h-3 mr-1" />,  className: "bg-blue-500 text-white border-blue-500" },
  };
  const cfg = map[status] ?? { label: status, icon: null, className: "" };
  return (
    <Badge variant="outline" className={`flex items-center w-fit ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </Badge>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function InvestorProject() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const projectId = parseInt(params.id ?? "0");

  // States für Zeichnungs-Dialog
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("100000");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Investor-Status
  const { data: statusData, isLoading: statusLoading } = trpc.clubDeal.checkStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!statusLoading && statusData && !statusData.isInvestor) {
      setLocation("/investor/onboarding");
    }
  }, [statusData, statusLoading, setLocation]);

  // Projektdaten + eigene Zeichnung
  const { data, isLoading: projectLoading, refetch } = trpc.clubDeal.getProject.useQuery(
    { projectId },
    { enabled: !!statusData?.isInvestor && projectId > 0 },
  );

  // Mutations
  const subscribeMutation = trpc.clubDeal.subscribe.useMutation({
    onSuccess: (result) => {
      setSubscribeOpen(false);
      refetch();
      if (result.waitlisted) {
        toast.success("Auf Warteliste gesetzt — Sie werden benachrichtigt sobald ein Platz frei wird.");
      } else {
        toast.success("Zeichnung eingegangen — der Admin wird Ihre Zeichnung prüfen und bestätigen.");
      }
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const cancelMutation = trpc.clubDeal.cancelSubscription.useMutation({
    onSuccess: () => {
      setCancelDialogOpen(false);
      refetch();
      toast.success("Zeichnung storniert");
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const isLoading = loading || statusLoading || projectLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-muted-foreground text-center py-12">Projekt nicht gefunden oder nicht mehr verfügbar.</p>
          <div className="flex justify-center mt-4">
            <Link href="/investor/dashboard">
              <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Zurück zur Übersicht</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { project, mySubscription } = data;
  const progress = project.targetVolume > 0
    ? Math.min(100, Math.round((project.currentVolume / project.targetVolume) * 100))
    : 0;
  const remaining = project.targetVolume - project.currentVolume;
  const slotsLeft = project.maxInvestors - project.currentInvestors;
  const isFullyFunded = project.status === "fully_funded";
  const isActive = project.status === "active";
  const docs = (project.documents as Array<{ type: string; url: string }>) ?? [];

  // Eingabe-Betrag in Cent
  const amountCents = Math.round(parseFloat(amountInput || "0") * 100);
  const amountExceedsRemaining = amountCents > remaining;
  const amountBelowMin = amountCents < 10000000;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl">

        {/* ─── Zurück-Link + Titel ─── */}
        <div className="space-y-1">
          <Link href="/investor/dashboard">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Alle Projekte
            </button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <Badge
              variant="outline"
              className={isFullyFunded
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "bg-green-100 text-green-700 border-green-300"
              }
            >
              {isFullyFunded ? "Voll finanziert" : "Aktiv — Zeichnung offen"}
            </Badge>
          </div>
          {project.location && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4" />{project.location}
            </p>
          )}
        </div>

        {/* ─── Kennzahlen-Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: EuroIcon,    label: "Zielvolumen",   value: formatEur(project.targetVolume) },
            { icon: TrendingUp,  label: "Gezeichnet",    value: formatEur(project.currentVolume) },
            { icon: EuroIcon,    label: "Verbleibend",   value: formatEur(remaining) },
            { icon: Users,       label: "Investoren",    value: `${project.currentInvestors}/${project.maxInvestors}` },
            { icon: TrendingUp,  label: "Rendite p.a.",  value: `${project.expectedReturn}%` },
            { icon: Calendar,    label: "Laufzeit",      value: `${project.duration} Monate` },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="text-center">
              <CardContent className="pt-4 pb-3 px-3">
                <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-bold text-sm mt-0.5">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Fortschrittsbalken ─── */}
        <Card>
          <CardContent className="pt-4 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Finanzierungsfortschritt</span>
              <span className="text-xl font-bold text-primary">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatEur(project.currentVolume)} von {formatEur(project.targetVolume)}</span>
              {slotsLeft > 0
                ? <span className="text-green-600 font-medium">{slotsLeft} Plätze verfügbar</span>
                : <span className="text-orange-500 font-medium">Warteliste möglich</span>
              }
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── Linke Spalte: Details + Dokumente ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Projekt-Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projekt-Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Projektart</dt>
                    <dd className="font-medium mt-0.5">{PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Investmentstruktur</dt>
                    <dd className="font-medium mt-0.5">{INVESTMENT_TYPE_LABELS[project.investmentType] ?? project.investmentType}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Min. Investition</dt>
                    <dd className="font-medium mt-0.5">{formatEur(project.minInvestment)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Max. Investoren</dt>
                    <dd className="font-medium mt-0.5">{project.maxInvestors}</dd>
                  </div>
                </dl>

                {project.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dokumente */}
            {docs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Unterlagen</CardTitle>
                  <CardDescription>Klicken Sie zum Herunterladen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {docs.map((doc) => (
                      <a
                        key={doc.type}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{DOC_LABELS[doc.type] ?? doc.type}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Download className="h-3 w-3" />PDF herunterladen
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ─── Rechte Spalte: Zeichnung ─── */}
          <div className="space-y-4">

            {/* Vollfinanziert */}
            {isFullyFunded && !mySubscription && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-5 pb-5 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-blue-500 mx-auto" />
                  <p className="font-medium text-blue-800">Vollständig finanziert</p>
                  <p className="text-sm text-blue-600">Dieses Projekt ist vollständig finanziert.</p>
                </CardContent>
              </Card>
            )}

            {/* Eigene Zeichnung vorhanden */}
            {mySubscription && (
              <Card className={
                mySubscription.status === "confirmed"
                  ? "border-green-200 bg-green-50"
                  : mySubscription.status === "waitlisted"
                    ? "border-blue-200 bg-blue-50"
                    : mySubscription.status === "cancelled"
                      ? "border-muted bg-muted/30"
                      : "border-yellow-200 bg-yellow-50"
              }>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    Meine Zeichnung
                    <SubStatusBadge status={mySubscription.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">{formatEur(mySubscription.amount)}</div>

                  {mySubscription.status === "pending" && (
                    <p className="text-sm text-yellow-700">
                      Ihre Zeichnung wird vom Admin geprüft und bestätigt.
                    </p>
                  )}
                  {mySubscription.status === "confirmed" && (
                    <p className="text-sm text-green-700">
                      Ihre Zeichnung wurde bestätigt. Sie werden über weitere Schritte informiert.
                    </p>
                  )}
                  {mySubscription.status === "waitlisted" && (
                    <p className="text-sm text-blue-700">
                      Sie sind auf der Warteliste
                      {mySubscription.position ? ` (Position ${mySubscription.position})` : ""}.
                      Sie werden automatisch nachrücken sobald ein Platz frei wird.
                    </p>
                  )}
                  {mySubscription.status === "cancelled" && (
                    <p className="text-sm text-muted-foreground">
                      Diese Zeichnung wurde storniert.
                    </p>
                  )}

                  {(mySubscription.status === "pending" || mySubscription.status === "waitlisted") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Zeichnung stornieren
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Zeichnung abgeben (nur wenn aktiv und noch nicht gezeichnet) */}
            {isActive && !mySubscription && (
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Zeichnung abgeben</CardTitle>
                  <CardDescription>
                    Min. {formatEur(project.minInvestment)} · Schritte à €10.000
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Betrag (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="10000"
                      min="100000"
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                      className={amountBelowMin || amountExceedsRemaining ? "border-destructive" : ""}
                    />
                    {amountBelowMin && (
                      <p className="text-xs text-destructive">Mindestzeichnung: {formatEur(project.minInvestment)}</p>
                    )}
                    {!amountBelowMin && amountExceedsRemaining && (
                      <p className="text-xs text-orange-500">
                        Betrag überschreitet verbleibendes Volumen ({formatEur(remaining)})
                      </p>
                    )}
                  </div>

                  {slotsLeft === 0 && (
                    <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-700">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Alle Plätze belegt — Ihre Zeichnung kommt auf die Warteliste.</span>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={amountBelowMin || amountCents === 0}
                    onClick={() => setSubscribeOpen(true)}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Jetzt zeichnen
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Zeichnungen sind verbindlich und werden vom Admin bestätigt.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Club Deal Investitionen sind illiquide. Ein vollständiger Kapitalverlust ist möglich.
              Diese Informationen stellen keine Anlageberatung dar.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Zeichnungs-Bestätigungs-Dialog ─── */}
      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zeichnung bestätigen</DialogTitle>
            <DialogDescription>
              Bitte prüfen Sie Ihre Angaben vor der verbindlichen Zeichnung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projekt</span>
                <span className="font-medium text-right max-w-[200px]">{project.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Betrag</span>
                <span className="font-bold text-primary text-lg">{formatEur(amountCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Struktur</span>
                <span className="font-medium">{INVESTMENT_TYPE_LABELS[project.investmentType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status nach Zeichnung</span>
                <span className="font-medium">{slotsLeft > 0 ? "Ausstehend (wird geprüft)" : "Warteliste"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Ihre Zeichnung ist verbindlich. Nach der Prüfung durch den Admin erhalten Sie eine Bestätigung.
              Stornierungen sind bis zur Bestätigung möglich.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscribeOpen(false)}>Abbrechen</Button>
            <Button
              onClick={() => subscribeMutation.mutate({ projectId, amount: amountCents })}
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Verbindlich zeichnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Stornieren-Bestätigung ─── */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zeichnung wirklich stornieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Ihre Zeichnung über {mySubscription ? formatEur(mySubscription.amount) : ""} wird storniert.
              Ein späteres erneutes Zeichnen ist nicht möglich.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => mySubscription && cancelMutation.mutate({ subscriptionId: mySubscription.id })}
            >
              Zeichnung stornieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
