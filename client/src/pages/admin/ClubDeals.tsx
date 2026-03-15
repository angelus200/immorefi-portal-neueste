import { useState } from "react";
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, Building2, Users, TrendingUp, EuroIcon,
  CheckCircle2, Clock, XCircle, AlertCircle, Eye,
} from "lucide-react";
import { toast } from "sonner";

// ─── Status-Badge-Helper ──────────────────────────────────────────────────────

function ProjectStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:         { label: "Entwurf",        className: "bg-gray-100 text-gray-700 border-gray-300" },
    pending_review:{ label: "Prüfung",        className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    active:        { label: "Aktiv",           className: "bg-green-100 text-green-700 border-green-300" },
    fully_funded:  { label: "Voll finanziert", className: "bg-blue-100 text-blue-700 border-blue-300" },
    closed:        { label: "Geschlossen",     className: "bg-gray-200 text-gray-600 border-gray-400" },
    cancelled:     { label: "Abgebrochen",     className: "bg-red-100 text-red-700 border-red-300" },
  };
  const cfg = map[status] ?? { label: status, className: "" };
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending:    { label: "Ausstehend",   icon: <Clock className="w-3 h-3 mr-1" />,        className: "text-yellow-600 border-yellow-600" },
    confirmed:  { label: "Bestätigt",   icon: <CheckCircle2 className="w-3 h-3 mr-1" />, className: "bg-green-500 text-white" },
    waitlisted: { label: "Warteliste",  icon: <AlertCircle className="w-3 h-3 mr-1" />,  className: "text-blue-600 border-blue-600" },
    cancelled:  { label: "Abgelehnt",   icon: <XCircle className="w-3 h-3 mr-1" />,      className: "text-red-600 border-red-600" },
    completed:  { label: "Abgeschlossen",icon: <CheckCircle2 className="w-3 h-3 mr-1" />,className: "bg-blue-500 text-white" },
  };
  const cfg = map[status] ?? { label: status, icon: null, className: "" };
  return (
    <Badge variant="outline" className={`flex items-center w-fit ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </Badge>
  );
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatEur(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function AdminClubDeals() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.clubDeal.getDashboardStats.useQuery(undefined, {
    enabled: !!user && (user.role === "superadmin" || user.role === "tenant_admin"),
  });

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = trpc.clubDeal.getAllProjects.useQuery(
    { limit: 100, offset: 0 },
    { enabled: !!user && (user.role === "superadmin" || user.role === "tenant_admin") },
  );

  const { data: subscriptions, refetch: refetchSubs } = trpc.clubDeal.getProjectSubscriptions.useQuery(
    { projectId: selectedProjectId! },
    { enabled: selectedProjectId !== null },
  );

  // Mutations
  const updateStatus = trpc.clubDeal.updateProjectStatus.useMutation({
    onSuccess: () => {
      toast.success("Projektstatus aktualisiert");
      refetchProjects();
      refetchStats();
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const publishProject = trpc.clubDeal.publishProject.useMutation({
    onSuccess: () => {
      toast.success("Projekt freigeschaltet — Investoren können nun zeichnen");
      refetchProjects();
      refetchStats();
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const updateSubStatus = trpc.clubDeal.updateSubscriptionStatus.useMutation({
    onSuccess: () => {
      toast.success("Zeichnungsstatus aktualisiert");
      refetchSubs();
      refetchProjects();
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  // Loading & Auth-Guard
  if (loading || projectsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || (user.role !== "superadmin" && user.role !== "tenant_admin")) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
        </div>
      </DashboardLayout>
    );
  }

  const selectedProject = projects?.find(p => p.id === selectedProjectId) ?? null;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* ─── Seitentitel ─── */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Club Deal Verwaltung
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Überblick, Projekt-Freigabe und Zeichnungs-Management
          </p>
        </div>

        {/* ─── Stats-Kacheln ─── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> Aktive Projekte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.activeProjectsCount}</p>
                <p className="text-xs text-muted-foreground">von {stats.totalProjectsCount} gesamt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <EuroIcon className="h-4 w-4" /> Zielvolumen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatEur(stats.totalTargetVolume)}</p>
                <p className="text-xs text-muted-foreground">aktive Projekte</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> Eingesammelt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatEur(stats.totalCurrentVolume)}</p>
                <p className="text-xs text-muted-foreground">bestätigte Zeichnungen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> Investoren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalInvestors}</p>
                <p className="text-xs text-muted-foreground">bestätigte Zeichner</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Projekt-Tabelle ─── */}
        <Card>
          <CardHeader>
            <CardTitle>Projekte</CardTitle>
            <CardDescription>Alle Club Deal Projekte — Status verwalten und freischalten</CardDescription>
          </CardHeader>
          <CardContent>
            {!projects || projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Noch keine Projekte vorhanden.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Zielvolumen</TableHead>
                    <TableHead>Fortschritt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const progress = project.targetVolume > 0
                      ? Math.min(100, Math.round((project.currentVolume / project.targetVolume) * 100))
                      : 0;
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{project.title}</TableCell>
                        <TableCell className="capitalize">{project.projectType}</TableCell>
                        <TableCell>{formatEur(project.targetVolume)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell><ProjectStatusBadge status={project.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Status-Änderung */}
                            <Select
                              value={project.status}
                              onValueChange={(value) =>
                                updateStatus.mutate({ projectId: project.id, status: value as any })
                              }
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Entwurf</SelectItem>
                                <SelectItem value="pending_review">Zur Prüfung</SelectItem>
                                <SelectItem value="active">Aktiv</SelectItem>
                                <SelectItem value="fully_funded">Voll finanziert</SelectItem>
                                <SelectItem value="closed">Geschlossen</SelectItem>
                                <SelectItem value="cancelled">Abgebrochen</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Schnell-Freischalten */}
                            {project.status === "pending_review" && (
                              <Button
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => publishProject.mutate({ projectId: project.id })}
                                disabled={publishProject.isPending}
                              >
                                Freischalten
                              </Button>
                            )}

                            {/* Zeichnungen anzeigen */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => setSelectedProjectId(project.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Zeichnungen
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Zeichnungs-Dialog ─── */}
      <Dialog open={selectedProjectId !== null} onOpenChange={(open) => !open && setSelectedProjectId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Zeichnungen — {selectedProject?.title}</DialogTitle>
            <DialogDescription>
              {subscriptions?.length ?? 0} Zeichnungen · {formatEur(selectedProject?.currentVolume ?? 0)} bestätigt
            </DialogDescription>
          </DialogHeader>

          {!subscriptions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Noch keine Zeichnungen für dieses Projekt.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor-ID</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">#{sub.investorId ?? "–"}</TableCell>
                    <TableCell className="font-medium">{formatEur(sub.amount)}</TableCell>
                    <TableCell><SubStatusBadge status={sub.status} /></TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={sub.status}
                        onValueChange={(value) =>
                          updateSubStatus.mutate({ subscriptionId: sub.id, status: value as any })
                        }
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Ausstehend</SelectItem>
                          <SelectItem value="confirmed">Bestätigen</SelectItem>
                          <SelectItem value="waitlisted">Warteliste</SelectItem>
                          <SelectItem value="cancelled">Ablehnen</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
