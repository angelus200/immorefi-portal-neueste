import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Eye, Trash2, FileText, Tag } from "lucide-react";
import { toast } from "sonner";

function ContractTemplatesContent() {
  const utils = trpc.useUtils();
  const { data: templates = [], isLoading } = trpc.contractTemplate.list.useQuery();

  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDelete, setShowDelete] = useState<number | null>(null);

  const deleteMutation = trpc.contractTemplate.delete.useMutation({
    onSuccess: () => {
      toast.success("Vorlage erfolgreich gelöscht");
      utils.contractTemplate.list.invalidate();
      setShowDelete(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      fondstrukturierung: "Fondstrukturierung",
      anleihen: "Anleihen / CLN / AMC",
      beratung: "Beratung",
      sonstige: "Sonstige",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      fondstrukturierung: "bg-blue-100 text-blue-800 border-blue-300",
      anleihen: "bg-purple-100 text-purple-800 border-purple-300",
      beratung: "bg-green-100 text-green-800 border-green-300",
      sonstige: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[category] || colors.sonstige;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vertragsvorlagen</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Ihre Vertragsvorlagen und Platzhalter
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Vorlagen ({templates.length})</CardTitle>
          <CardDescription>
            Übersicht aller verfügbaren Vertragsvorlagen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground mt-4">Laden...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Vorlagen gefunden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihre erste Vertragsvorlage.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Erste Vorlage erstellen
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Platzhalter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(template.category)}>
                          {getCategoryLabel(template.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {Array.isArray(template.placeholders)
                              ? template.placeholders.length
                              : 0} Platzhalter
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            template.isActive
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          }
                        >
                          {template.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDelete(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kategorie</Label>
              <Badge className={getCategoryColor(previewTemplate?.category || "")}>
                {getCategoryLabel(previewTemplate?.category || "")}
              </Badge>
            </div>
            {previewTemplate?.placeholders && previewTemplate.placeholders.length > 0 && (
              <div>
                <Label>Platzhalter</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewTemplate.placeholders.map((ph: string) => (
                    <Badge key={ph} variant="outline">
                      {"{{"}{ph}{"}}"}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label>Vertragstext (Vorschau)</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                {previewTemplate?.content?.substring(0, 2000)}
                {(previewTemplate?.content?.length || 0) > 2000 && "..."}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete !== null} onOpenChange={(open) => !open && setShowDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vorlage löschen?</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diese Vorlage löschen möchten? Die Vorlage wird deaktiviert und kann nicht mehr verwendet werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(null)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDelete && handleDelete(showDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Löschen..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ContractTemplates() {
  return (
    <DashboardLayout>
      <ContractTemplatesContent />
    </DashboardLayout>
  );
}
