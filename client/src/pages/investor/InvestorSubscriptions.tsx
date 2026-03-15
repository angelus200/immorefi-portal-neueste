import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2, ClipboardList, CheckCircle2, Clock, AlertCircle, XCircle, ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatEur(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

// ─── Status-Badge ─────────────────────────────────────────────────────────────

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending:    { label: "Ausstehend",    icon: <Clock className="w-3 h-3 mr-1" />,         className: "text-yellow-600 border-yellow-600 bg-yellow-50" },
    confirmed:  { label: "Bestätigt",    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,  className: "bg-green-500 text-white border-green-500" },
    waitlisted: { label: "Warteliste",   icon: <AlertCircle className="w-3 h-3 mr-1" />,   className: "text-blue-600 border-blue-600 bg-blue-50" },
    cancelled:  { label: "Storniert",    icon: <XCircle className="w-3 h-3 mr-1" />,       className: "text-muted-foreground border-muted bg-muted/30" },
    completed:  { label: "Abgeschlossen",icon: <CheckCircle2 className="w-3 h-3 mr-1" />,  className: "bg-blue-500 text-white border-blue-500" },
  };
  const cfg = map[status] ?? { label: status, icon: null, className: "" };
  return (
    <Badge variant="outline" className={`flex items-center w-fit whitespace-nowrap ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </Badge>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function InvestorSubscriptions() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelAmount, setCancelAmount] = useState(0);

  // Investor-Status
  const { data: statusData, isLoading: statusLoading } = trpc.clubDeal.checkStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!statusLoading && statusData && !statusData.isInvestor) {
      setLocation("/investor/onboarding");
    }
  }, [statusData, statusLoading, setLocation]);

  // Zeichnungen laden
  const { data: subscriptions, isLoading: subsLoading, refetch } = trpc.clubDeal.getMySubscriptions.useQuery(
    undefined,
    { enabled: !!statusData?.isInvestor },
  );

  // Stornierung
  const cancelMutation = trpc.clubDeal.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Zeichnung storniert");
      setCancelId(null);
      refetch();
    },
    onError: (e) => {
      toast.error(`Fehler: ${e.message}`);
    },
  });

  const isLoading = loading || statusLoading || subsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Zusammenfassung berechnen
  const active = subscriptions?.filter(s => s.status === "pending" || s.status === "confirmed" || s.status === "waitlisted") ?? [];
  const confirmed = subscriptions?.filter(s => s.status === "confirmed") ?? [];
  const totalCommitted = active.reduce((sum, s) => sum + s.amount, 0);
  const totalConfirmed = confirmed.reduce((sum, s) => sum + s.amount, 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl">

        {/* ─── Seitentitel ─── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Meine Zeichnungen
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Übersicht aller Ihrer Club Deal Zeichnungen
            </p>
          </div>
          <Link href="/investor/dashboard">
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              Neue Projekte
            </Button>
          </Link>
        </div>

        {/* ─── Zusammenfassung ─── */}
        {subscriptions && subscriptions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Gesamt Zeichnungen</p>
                <p className="text-2xl font-bold mt-1">{subscriptions.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Aktiv / Ausstehend</p>
                <p className="text-2xl font-bold mt-1">{active.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Bestätigtes Volumen</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{formatEur(totalConfirmed)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Gesamtvolumen aktiv</p>
                <p className="text-2xl font-bold mt-1">{formatEur(totalCommitted)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Zeichnungs-Tabelle ─── */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Zeichnungen</CardTitle>
            <CardDescription>
              Stornierungen sind bis zur Bestätigung durch den Admin möglich.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!subscriptions || subscriptions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground">Noch keine Zeichnungen vorhanden.</p>
                <Link href="/investor/dashboard">
                  <Button size="sm" variant="outline">
                    Projekte ansehen
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projekt</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className={sub.status === "cancelled" ? "opacity-50" : ""}>
                      {/* Projekt */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm">
                            {sub.project?.title ?? `Projekt #${sub.projectId}`}
                          </p>
                          {sub.project?.projectType && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {sub.project.projectType}
                            </p>
                          )}
                          {sub.status === "waitlisted" && sub.position && (
                            <p className="text-xs text-blue-600">
                              Warteliste Position {sub.position}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Betrag */}
                      <TableCell className="font-semibold">
                        {formatEur(sub.amount)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <SubStatusBadge status={sub.status} />
                      </TableCell>

                      {/* Datum */}
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(sub.subscribedAt), "dd. MMM yyyy", { locale: de })}
                      </TableCell>

                      {/* Aktion */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Zum Projekt */}
                          {sub.status !== "cancelled" && (
                            <Link href={`/investor/project/${sub.projectId}`}>
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                                Ansehen
                              </Button>
                            </Link>
                          )}
                          {/* Stornieren */}
                          {(sub.status === "pending" || sub.status === "waitlisted") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2 text-destructive hover:text-destructive border-destructive/30"
                              onClick={() => {
                                setCancelId(sub.id);
                                setCancelAmount(sub.amount);
                              }}
                            >
                              Stornieren
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ─── Hinweis ─── */}
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto border-t pt-4">
          Bestätigte Zeichnungen können nicht storniert werden. Bei Fragen wenden Sie sich
          bitte an <a href="mailto:info@immorefi.de" className="underline hover:text-primary">info@immorefi.de</a>.
        </p>
      </div>

      {/* ─── Stornieren-Dialog ─── */}
      <AlertDialog open={cancelId !== null} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zeichnung stornieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Ihre Zeichnung über <strong>{formatEur(cancelAmount)}</strong> wird unwiderruflich storniert.
              Ein erneutes Zeichnen für dasselbe Projekt ist nicht möglich.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => cancelId !== null && cancelMutation.mutate({ subscriptionId: cancelId })}
            >
              {cancelMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : "Endgültig stornieren"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
