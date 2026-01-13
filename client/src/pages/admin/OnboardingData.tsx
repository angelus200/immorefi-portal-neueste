import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Eye, CheckCircle, Building2, User, Wallet, Target, FileText, ArrowLeft, Download, File } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type OnboardingEntry = {
  id: number;
  userId: number;
  status: string;
  anrede: string | null;
  titel: string | null;
  vorname: string | null;
  nachname: string | null;
  telefon: string | null;
  position: string | null;
  firmenname: string | null;
  rechtsform: string | null;
  gruendungsjahr: string | null;
  handelsregister: string | null;
  umsatzsteuerID: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  land: string | null;
  website: string | null;
  portfolioGroesse: string | null;
  anzahlObjekte: string | null;
  objektarten: string[] | null;
  standorte: string | null;
  gesamtmietflaeche: string | null;
  leerstandsquote: string | null;
  durchschnittlicheMietrendite: string | null;
  aktuelleFinanzierungen: string | null;
  durchschnittlicherZinssatz: string | null;
  restlaufzeiten: string | null;
  tilgungsstruktur: string | null;
  sicherheiten: string | null;
  bankbeziehungen: string | null;
  kapitalbedarf: string | null;
  verwendungszweck: string | null;
  zeithorizont: string | null;
  gewuenschteStruktur: string | null;
  investorentyp: string | null;
  projektbeschreibung: string | null;
  besondereAnforderungen: string | null;
  agbAkzeptiert: boolean | null;
  datenschutzAkzeptiert: boolean | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
    in_progress: { variant: "secondary", label: "In Bearbeitung" },
    completed: { variant: "default", label: "Abgeschlossen" },
    reviewed: { variant: "outline", label: "Geprüft" },
  };
  const config = variants[status] || { variant: "secondary", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="bg-muted/30 rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  jahresabschluss: "Jahresabschlüsse",
  bwa: "BWA / Summen- und Saldenliste",
  objektliste: "Objektliste mit Eckdaten",
  mieterliste: "Aktuelle Mieterliste",
  finanzierungen: "Übersicht bestehender Finanzierungen",
  wertgutachten: "Aktuelle Wertgutachten",
  gesellschaftsvertrag: "Gesellschaftsvertrag / Satzung",
  sonstige: "Sonstige Dokumente",
};

function DocumentsSection({ onboardingId }: { onboardingId: number }) {
  const { data: documents, isLoading } = trpc.onboarding.getDocuments.useQuery({ onboardingId });
  
  if (isLoading) {
    return (
      <DetailSection title="Dokumente" icon={File}>
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </DetailSection>
    );
  }
  
  if (!documents || documents.length === 0) {
    return (
      <DetailSection title="Dokumente" icon={File}>
        <p className="text-muted-foreground text-sm">Keine Dokumente hochgeladen</p>
      </DetailSection>
    );
  }
  
  return (
    <DetailSection title="Dokumente" icon={File}>
      <div className="space-y-2">
        {documents.map((doc: { id: number; fileName: string; category: string; fileUrl: string; size: number | null; createdAt: Date }) => (
          <div key={doc.id} className="flex items-center justify-between p-2 bg-background rounded">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{doc.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[doc.category] || doc.category} • {doc.size ? `${(doc.size / 1024).toFixed(0)} KB` : ''}
                </p>
              </div>
            </div>
            <a 
              href={doc.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}

export default function AdminOnboardingData() {
  const { data: onboardingList, isLoading, refetch } = trpc.onboarding.list.useQuery();
  const [selectedEntry, setSelectedEntry] = useState<OnboardingEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const markAsReviewed = trpc.onboarding.markAsReviewed.useMutation({
    onSuccess: () => {
      toast.success("Als geprüft markiert");
      refetch();
      setDetailOpen(false);
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren");
    },
  });

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatObjektarten = (arten: string[] | null) => {
    if (!arten || arten.length === 0) return "-";
    const labels: Record<string, string> = {
      wohnen: "Wohnimmobilien",
      buero: "Büroimmobilien",
      einzelhandel: "Einzelhandel",
      logistik: "Logistik/Industrie",
      hotel: "Hotel",
      pflege: "Pflege/Gesundheit",
      mixed: "Mixed-Use",
      grundstuecke: "Grundstücke",
      other: "Sonstige",
    };
    return arten.map(a => labels[a] || a).join(", ");
  };

  const openDetail = (entry: OnboardingEntry) => {
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-bold">Onboarding-Daten</h1>
        <p className="text-muted-foreground">
          Übersicht aller eingereichten Analyse-Fragebögen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eingereichte Fragebögen</CardTitle>
          <CardDescription>
            {onboardingList?.length || 0} Einträge insgesamt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!onboardingList || onboardingList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Onboarding-Daten vorhanden</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Kapitalbedarf</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Eingereicht</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onboardingList.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono">#{entry.id}</TableCell>
                    <TableCell>
                      {entry.vorname && entry.nachname 
                        ? `${entry.vorname} ${entry.nachname}` 
                        : "-"}
                    </TableCell>
                    <TableCell>{entry.firmenname || "-"}</TableCell>
                    <TableCell>{entry.kapitalbedarf || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell>{formatDate(entry.completedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDetail(entry as OnboardingEntry)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Onboarding-Details #{selectedEntry?.id}
              {selectedEntry && <StatusBadge status={selectedEntry.status} />}
            </DialogTitle>
            <DialogDescription>
              Eingereicht am {formatDate(selectedEntry?.completedAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6 mt-4">
              {/* Kontaktdaten */}
              <DetailSection title="Kontaktdaten" icon={User}>
                <DetailRow label="Anrede" value={selectedEntry.anrede} />
                <DetailRow label="Titel" value={selectedEntry.titel} />
                <DetailRow label="Vorname" value={selectedEntry.vorname} />
                <DetailRow label="Nachname" value={selectedEntry.nachname} />
                <DetailRow label="Telefon" value={selectedEntry.telefon} />
                <DetailRow label="Position" value={selectedEntry.position} />
              </DetailSection>

              {/* Unternehmen */}
              <DetailSection title="Unternehmen" icon={Building2}>
                <DetailRow label="Firmenname" value={selectedEntry.firmenname} />
                <DetailRow label="Rechtsform" value={selectedEntry.rechtsform} />
                <DetailRow label="Gründungsjahr" value={selectedEntry.gruendungsjahr} />
                <DetailRow label="Handelsregister" value={selectedEntry.handelsregister} />
                <DetailRow label="USt-IdNr." value={selectedEntry.umsatzsteuerID} />
                <DetailRow label="Adresse" value={
                  selectedEntry.strasse 
                    ? `${selectedEntry.strasse}, ${selectedEntry.plz} ${selectedEntry.ort}, ${selectedEntry.land}`
                    : null
                } />
                <DetailRow label="Website" value={selectedEntry.website} />
              </DetailSection>

              {/* Immobilienportfolio */}
              <DetailSection title="Immobilienportfolio" icon={Building2}>
                <DetailRow label="Portfoliogröße" value={selectedEntry.portfolioGroesse} />
                <DetailRow label="Anzahl Objekte" value={selectedEntry.anzahlObjekte} />
                <DetailRow label="Objektarten" value={formatObjektarten(selectedEntry.objektarten)} />
                <DetailRow label="Standorte" value={selectedEntry.standorte} />
                <DetailRow label="Gesamtmietfläche" value={selectedEntry.gesamtmietflaeche ? `${selectedEntry.gesamtmietflaeche} m²` : null} />
                <DetailRow label="Leerstandsquote" value={selectedEntry.leerstandsquote} />
                <DetailRow label="Mietrendite" value={selectedEntry.durchschnittlicheMietrendite} />
              </DetailSection>

              {/* Finanzierung */}
              <DetailSection title="Aktuelle Finanzierung" icon={Wallet}>
                <DetailRow label="Finanzierungsvolumen" value={selectedEntry.aktuelleFinanzierungen} />
                <DetailRow label="Durchschn. Zinssatz" value={selectedEntry.durchschnittlicherZinssatz} />
                <DetailRow label="Restlaufzeiten" value={selectedEntry.restlaufzeiten} />
                <DetailRow label="Tilgungsstruktur" value={selectedEntry.tilgungsstruktur} />
                <DetailRow label="Sicherheiten" value={selectedEntry.sicherheiten} />
                <DetailRow label="Bankbeziehungen" value={selectedEntry.bankbeziehungen} />
              </DetailSection>

              {/* Projektziele */}
              <DetailSection title="Projektziele" icon={Target}>
                <DetailRow label="Kapitalbedarf" value={selectedEntry.kapitalbedarf} />
                <DetailRow label="Verwendungszweck" value={selectedEntry.verwendungszweck} />
                <DetailRow label="Zeithorizont" value={selectedEntry.zeithorizont} />
                <DetailRow label="Gewünschte Struktur" value={selectedEntry.gewuenschteStruktur} />
                <DetailRow label="Investorentyp" value={selectedEntry.investorentyp} />
                {selectedEntry.projektbeschreibung && (
                  <div className="pt-2">
                    <span className="text-muted-foreground text-sm">Projektbeschreibung:</span>
                    <p className="mt-1 text-sm">{selectedEntry.projektbeschreibung}</p>
                  </div>
                )}
                {selectedEntry.besondereAnforderungen && (
                  <div className="pt-2">
                    <span className="text-muted-foreground text-sm">Besondere Anforderungen:</span>
                    <p className="mt-1 text-sm">{selectedEntry.besondereAnforderungen}</p>
                  </div>
                )}
              </DetailSection>

              {/* Zustimmungen */}
              <DetailSection title="Zustimmungen" icon={FileText}>
                <DetailRow 
                  label="AGB akzeptiert" 
                  value={selectedEntry.agbAkzeptiert ? "Ja" : "Nein"} 
                />
                <DetailRow 
                  label="Datenschutz akzeptiert" 
                  value={selectedEntry.datenschutzAkzeptiert ? "Ja" : "Nein"} 
                />
              </DetailSection>

              {/* Dokumente */}
              <DocumentsSection onboardingId={selectedEntry.id} />

              {/* Actions */}
              {selectedEntry.status !== "reviewed" && (
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={() => markAsReviewed.mutate({ id: selectedEntry.id })}
                    disabled={markAsReviewed.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Als geprüft markieren
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
