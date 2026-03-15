import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2, Building2, Users, TrendingUp, EuroIcon,
  CheckCircle2, Clock, XCircle, AlertCircle, Eye,
  Plus, Pencil, Trash2, Upload, FileText, X,
} from "lucide-react";
import { toast } from "sonner";

// ─── Typen ────────────────────────────────────────────────────────────────────

type DocType = "pitchdeck" | "businessplan" | "due_diligence" | "rating";
interface Document { type: DocType; url: string }

// ─── Status-Badge-Helper ──────────────────────────────────────────────────────

function ProjectStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:          { label: "Entwurf",         className: "bg-gray-100 text-gray-700 border-gray-300" },
    pending_review: { label: "Prüfung",          className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    active:         { label: "Aktiv",            className: "bg-green-100 text-green-700 border-green-300" },
    fully_funded:   { label: "Voll finanziert",  className: "bg-blue-100 text-blue-700 border-blue-300" },
    closed:         { label: "Geschlossen",      className: "bg-gray-200 text-gray-600 border-gray-400" },
    cancelled:      { label: "Abgebrochen",      className: "bg-red-100 text-red-700 border-red-300" },
  };
  const cfg = map[status] ?? { label: status, className: "" };
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending:    { label: "Ausstehend",    icon: <Clock className="w-3 h-3 mr-1" />,         className: "text-yellow-600 border-yellow-600" },
    confirmed:  { label: "Bestätigt",    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,  className: "bg-green-500 text-white" },
    waitlisted: { label: "Warteliste",   icon: <AlertCircle className="w-3 h-3 mr-1" />,   className: "text-blue-600 border-blue-600" },
    cancelled:  { label: "Abgelehnt",    icon: <XCircle className="w-3 h-3 mr-1" />,       className: "text-red-600 border-red-600" },
    completed:  { label: "Abgeschlossen",icon: <CheckCircle2 className="w-3 h-3 mr-1" />,  className: "bg-blue-500 text-white" },
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

const DOC_LABELS: Record<DocType, string> = {
  pitchdeck:     "Pitchdeck",
  businessplan:  "Businessplan",
  due_diligence: "Due Diligence",
  rating:        "Rating",
};

// ─── Projekt-Formular (Create + Edit) ─────────────────────────────────────────

interface ProjectFormData {
  title: string;
  description: string;
  location: string;
  projectType: string;
  investmentType: string;
  targetVolume: string;       // In EUR als String (z.B. "1000000")
  minInvestment: string;      // In EUR
  maxInvestors: string;
  expectedReturn: string;
  duration: string;
  status: string;
  providerId: string;
  documents: Document[];
}

const EMPTY_FORM: ProjectFormData = {
  title: "",
  description: "",
  location: "",
  projectType: "residential",
  investmentType: "nachrangdarlehen",
  targetVolume: "1000000",
  minInvestment: "100000",
  maxInvestors: "18",
  expectedReturn: "8",
  duration: "24",
  status: "draft",
  providerId: "0",
  documents: [],
};

function projectToForm(project: any): ProjectFormData {
  return {
    title: project.title ?? "",
    description: project.description ?? "",
    location: project.location ?? "",
    projectType: project.projectType ?? "residential",
    investmentType: project.investmentType ?? "nachrangdarlehen",
    targetVolume: String(Math.round((project.targetVolume ?? 0) / 100)),
    minInvestment: String(Math.round((project.minInvestment ?? 0) / 100)),
    maxInvestors: String(project.maxInvestors ?? 18),
    expectedReturn: String(project.expectedReturn ?? "8"),
    duration: String(project.duration ?? 24),
    status: project.status ?? "draft",
    providerId: String(project.providerId ?? 0),
    documents: (project.documents as Document[]) ?? [],
  };
}

// ─── Dokument-Upload-Panel ────────────────────────────────────────────────────

function DocumentPanel({
  documents,
  onChange,
}: {
  documents: Document[];
  onChange: (docs: Document[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);
  const [pendingType, setPendingType] = useState<DocType>("pitchdeck");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadingType) return;

    try {
      setUploadingType(uploadingType);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, mimeType: file.type, data: base64 }),
        });
        if (!response.ok) throw new Error("Upload fehlgeschlagen");
        const { url } = await response.json();

        // Altes Dokument desselben Typs ersetzen
        const updated = documents.filter(d => d.type !== uploadingType);
        onChange([...updated, { type: uploadingType, url }]);
        toast.success(`${DOC_LABELS[uploadingType]} hochgeladen`);
        setUploadingType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload fehlgeschlagen");
      setUploadingType(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={pendingType} onValueChange={(v) => setPendingType(v as DocType)}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DOC_LABELS) as DocType[]).map(t => (
              <SelectItem key={t} value={t}>{DOC_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => { setUploadingType(pendingType); fileInputRef.current?.click(); }}
        >
          <Upload className="h-3 w-3 mr-1" />
          PDF hochladen
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {documents.length > 0 && (
        <ul className="space-y-1.5">
          {documents.map((doc) => (
            <li key={doc.type} className="flex items-center justify-between bg-muted rounded px-3 py-1.5 text-sm">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {DOC_LABELS[doc.type]}
                </a>
              </span>
              <button
                type="button"
                onClick={() => onChange(documents.filter(d => d.type !== doc.type))}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Projekt-Dialog (Anlegen / Bearbeiten) ───────────────────────────────────

function ProjectDialog({
  open,
  onClose,
  project,          // null = neues Projekt
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  project: any | null;
  onSaved: () => void;
}) {
  const isEdit = project !== null;
  const [form, setForm] = useState<ProjectFormData>(isEdit ? projectToForm(project) : EMPTY_FORM);

  // Form beim Öffnen / Projekt-Wechsel resetten
  useState(() => {
    setForm(isEdit ? projectToForm(project) : EMPTY_FORM);
  });

  const createMutation = trpc.clubDeal.adminCreateProject.useMutation({
    onSuccess: () => { toast.success("Projekt angelegt"); onSaved(); onClose(); },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const updateMutation = trpc.clubDeal.adminUpdateProject.useMutation({
    onSuccess: () => { toast.success("Projekt gespeichert"); onSaved(); onClose(); },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  function set(field: keyof ProjectFormData, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || undefined,
      location: form.location || undefined,
      projectType: form.projectType as any,
      investmentType: form.investmentType as any,
      targetVolume: Math.round(parseFloat(form.targetVolume) * 100),
      minInvestment: Math.round(parseFloat(form.minInvestment) * 100),
      maxInvestors: parseInt(form.maxInvestors),
      expectedReturn: parseFloat(form.expectedReturn),
      duration: parseInt(form.duration),
      status: form.status as any,
      providerId: parseInt(form.providerId) || 0,
      documents: form.documents,
    };

    if (isEdit) {
      updateMutation.mutate({ projectId: project.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Projekt bearbeiten — ${project?.title}` : "Neues Projekt anlegen"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Alle Felder sind bearbeitbar. Änderungen werden sofort gespeichert." : "Manuelles Anlegen eines Club Deal Projekts ohne Stripe-Zahlung."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Titel */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Titel *</Label>
            <Input id="title" value={form.title} onChange={e => set("title", e.target.value)} required />
          </div>

          {/* Beschreibung */}
          <div className="space-y-1.5">
            <Label htmlFor="desc">Beschreibung</Label>
            <Textarea id="desc" value={form.description} onChange={e => set("description", e.target.value)} rows={3} />
          </div>

          {/* Standort + Anbieter-ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Standort</Label>
              <Input id="location" value={form.location} onChange={e => set("location", e.target.value)} placeholder="z.B. München, Bayern" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="providerId">Anbieter-ID (User-ID)</Label>
              <Input id="providerId" type="number" value={form.providerId} onChange={e => set("providerId", e.target.value)} placeholder="0 = kein Anbieter" />
            </div>
          </div>

          {/* Projekttyp + Investmenttyp */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Projekttyp *</Label>
              <Select value={form.projectType} onValueChange={v => set("projectType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Wohnimmobilien</SelectItem>
                  <SelectItem value="commercial">Gewerbeimmobilien</SelectItem>
                  <SelectItem value="mixed">Gemischt</SelectItem>
                  <SelectItem value="renovation">Sanierung</SelectItem>
                  <SelectItem value="development">Neubau</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Investmenttyp *</Label>
              <Select value={form.investmentType} onValueChange={v => set("investmentType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nachrangdarlehen">Nachrangdarlehen</SelectItem>
                  <SelectItem value="stille_beteiligung">Stille Beteiligung</SelectItem>
                  <SelectItem value="anleihe">Anleihe</SelectItem>
                  <SelectItem value="genussrecht">Genussrecht</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Volumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="targetVolume">Zielvolumen (€) *</Label>
              <Input id="targetVolume" type="number" value={form.targetVolume} onChange={e => set("targetVolume", e.target.value)} placeholder="1000000" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minInvestment">Min. Investition (€) *</Label>
              <Input id="minInvestment" type="number" value={form.minInvestment} onChange={e => set("minInvestment", e.target.value)} placeholder="100000" required />
            </div>
          </div>

          {/* Investoren + Laufzeit + Rendite */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maxInvestors">Max. Investoren</Label>
              <Input id="maxInvestors" type="number" value={form.maxInvestors} onChange={e => set("maxInvestors", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expectedReturn">Rendite (% p.a.)</Label>
              <Input id="expectedReturn" type="number" step="0.1" value={form.expectedReturn} onChange={e => set("expectedReturn", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Laufzeit (Monate)</Label>
              <Input id="duration" type="number" value={form.duration} onChange={e => set("duration", e.target.value)} />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="pending_review">Zur Prüfung</SelectItem>
                <SelectItem value="active">Aktiv (freigegeben)</SelectItem>
                <SelectItem value="fully_funded">Voll finanziert</SelectItem>
                <SelectItem value="closed">Geschlossen</SelectItem>
                <SelectItem value="cancelled">Abgebrochen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dokumente */}
          <div className="space-y-1.5">
            <Label>Dokumente</Label>
            <DocumentPanel
              documents={form.documents}
              onChange={docs => set("documents", docs)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Speichern" : "Anlegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function AdminClubDeals() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });

  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<any | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [subsProjectId, setSubsProjectId] = useState<number | null>(null);

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.clubDeal.getDashboardStats.useQuery(undefined, {
    enabled: !!user && (user.role === "superadmin" || user.role === "tenant_admin"),
  });

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = trpc.clubDeal.getAllProjects.useQuery(
    { limit: 100, offset: 0 },
    { enabled: !!user && (user.role === "superadmin" || user.role === "tenant_admin") },
  );

  const { data: subscriptions, refetch: refetchSubs } = trpc.clubDeal.getProjectSubscriptions.useQuery(
    { projectId: subsProjectId! },
    { enabled: subsProjectId !== null },
  );

  // Mutations
  const publishProject = trpc.clubDeal.publishProject.useMutation({
    onSuccess: () => { toast.success("Projekt freigeschaltet"); refetchProjects(); refetchStats(); },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const updateSubStatus = trpc.clubDeal.updateSubscriptionStatus.useMutation({
    onSuccess: () => { toast.success("Zeichnungsstatus aktualisiert"); refetchSubs(); refetchProjects(); },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const deleteProject = trpc.clubDeal.adminDeleteProject.useMutation({
    onSuccess: () => {
      toast.success("Projekt gelöscht");
      setDeleteProjectId(null);
      refetchProjects();
      refetchStats();
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  function refetchAll() { refetchProjects(); refetchStats(); }

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

  const subsProject = projects?.find(p => p.id === subsProjectId) ?? null;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* ─── Seitentitel ─── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Club Deal Verwaltung
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Projekte anlegen, freigeben und Zeichnungen verwalten
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Projekt
          </Button>
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
            <CardDescription>Alle Club Deal Projekte</CardDescription>
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
                    <TableHead>Dokumente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const progress = project.targetVolume > 0
                      ? Math.min(100, Math.round((project.currentVolume / project.targetVolume) * 100))
                      : 0;
                    const docs = (project.documents as Document[]) ?? [];
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium max-w-[180px] truncate">{project.title}</TableCell>
                        <TableCell className="capitalize text-sm">{project.projectType}</TableCell>
                        <TableCell className="text-sm">{formatEur(project.targetVolume)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {docs.length > 0 ? (
                            <span className="text-xs text-muted-foreground">{docs.length} Dok.</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">–</span>
                          )}
                        </TableCell>
                        <TableCell><ProjectStatusBadge status={project.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {project.status === "pending_review" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => publishProject.mutate({ projectId: project.id })}
                                disabled={publishProject.isPending}
                              >
                                Freischalten
                              </Button>
                            )}
                            <Button
                              size="sm" variant="outline" className="h-7 w-7 p-0"
                              title="Bearbeiten"
                              onClick={() => setEditProject(project)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm" variant="outline" className="h-7 w-7 p-0"
                              title="Zeichnungen"
                              onClick={() => setSubsProjectId(project.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              title="Löschen"
                              onClick={() => setDeleteProjectId(project.id)}
                            >
                              <Trash2 className="h-3 w-3" />
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

      {/* ─── Anlegen-Dialog ─── */}
      <ProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        project={null}
        onSaved={refetchAll}
      />

      {/* ─── Bearbeiten-Dialog ─── */}
      <ProjectDialog
        open={editProject !== null}
        onClose={() => setEditProject(null)}
        project={editProject}
        onSaved={refetchAll}
      />

      {/* ─── Löschen-Bestätigung ─── */}
      <AlertDialog open={deleteProjectId !== null} onOpenChange={(o) => !o && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Alle zugehörigen Zeichnungen werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteProjectId !== null && deleteProject.mutate({ projectId: deleteProjectId })}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Zeichnungs-Dialog ─── */}
      <Dialog open={subsProjectId !== null} onOpenChange={(o) => !o && setSubsProjectId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Zeichnungen — {subsProject?.title}</DialogTitle>
            <DialogDescription>
              {subscriptions?.length ?? 0} Zeichnungen · {formatEur(subsProject?.currentVolume ?? 0)} bestätigt
            </DialogDescription>
          </DialogHeader>

          {!subscriptions ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
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
                    <TableCell className="font-mono text-xs">#{sub.investorId}</TableCell>
                    <TableCell className="font-medium">{formatEur(sub.amount)}</TableCell>
                    <TableCell><SubStatusBadge status={sub.status} /></TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={sub.status}
                        onValueChange={(v) => updateSubStatus.mutate({ subscriptionId: sub.id, status: v as any })}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
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
