import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink, GripVertical } from "lucide-react";

type LogoCategory = "presse" | "mitgliedschaft" | "auszeichnung" | "partner";

const categoryLabels: Record<LogoCategory, string> = {
  presse: "Presse",
  mitgliedschaft: "Mitgliedschaften",
  auszeichnung: "Auszeichnungen",
  partner: "Partner",
};

export default function AdminLogos() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<LogoCategory>("presse");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "presse" as LogoCategory,
    imageUrl: "",
    linkUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data: allLogos = [], isLoading } = trpc.partnerLogo.listAll.useQuery();

  const createMutation = trpc.partnerLogo.create.useMutation({
    onSuccess: () => {
      toast.success("Logo erfolgreich erstellt");
      utils.partnerLogo.listAll.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.partnerLogo.update.useMutation({
    onSuccess: () => {
      toast.success("Logo erfolgreich aktualisiert");
      utils.partnerLogo.listAll.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.partnerLogo.delete.useMutation({
    onSuccess: () => {
      toast.success("Logo erfolgreich gelöscht");
      utils.partnerLogo.listAll.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleOpenDialog = (logo?: any) => {
    if (logo) {
      setEditingLogo(logo);
      setFormData({
        name: logo.name,
        category: logo.category,
        imageUrl: logo.imageUrl,
        linkUrl: logo.linkUrl || "",
        sortOrder: logo.sortOrder,
        isActive: logo.isActive,
      });
    } else {
      setEditingLogo(null);
      setFormData({
        name: "",
        category: activeTab,
        imageUrl: "",
        linkUrl: "",
        sortOrder: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLogo(null);
    setFormData({
      name: "",
      category: "presse",
      imageUrl: "",
      linkUrl: "",
      sortOrder: 0,
      isActive: true,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.imageUrl) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    if (editingLogo) {
      updateMutation.mutate({
        id: editingLogo.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const logosByCategory = allLogos.filter((logo) => logo.category === activeTab);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Logo-Verwaltung</h1>
            <p className="text-muted-foreground mt-2">
              Verwalten Sie Presse-Logos, Mitgliedschaften, Auszeichnungen und Partner
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Logo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logos nach Kategorie</CardTitle>
            <CardDescription>
              Organisieren Sie Logos in verschiedenen Kategorien für die Landingpage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LogoCategory)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="presse">Presse</TabsTrigger>
                <TabsTrigger value="mitgliedschaft">Mitgliedschaften</TabsTrigger>
                <TabsTrigger value="auszeichnung">Auszeichnungen</TabsTrigger>
                <TabsTrigger value="partner">Partner</TabsTrigger>
              </TabsList>

              {(["presse", "mitgliedschaft", "auszeichnung", "partner"] as LogoCategory[]).map((category) => (
                <TabsContent key={category} value={category} className="mt-6">
                  {isLoading ? (
                    <div className="text-center py-8">Laden...</div>
                  ) : logosByCategory.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Keine Logos vorhanden</h3>
                      <p className="text-muted-foreground mb-4">
                        Erstellen Sie Ihr erstes {categoryLabels[category]}-Logo
                      </p>
                      <Button onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Logo hinzufügen
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Vorschau</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Sortierung</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logosByCategory.map((logo) => (
                            <TableRow key={logo.id}>
                              <TableCell>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              </TableCell>
                              <TableCell className="font-medium">{logo.name}</TableCell>
                              <TableCell>
                                <img
                                  src={logo.imageUrl}
                                  alt={logo.name}
                                  className="h-8 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Crect fill='%23ddd' width='100' height='40'/%3E%3Ctext x='50' y='20' fill='%23999' text-anchor='middle' dy='.3em' font-size='10'%3EBild fehlt%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {logo.linkUrl ? (
                                  <a href={logo.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">
                                    <ExternalLink className="h-3 w-3" />
                                    Link
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>{logo.sortOrder}</TableCell>
                              <TableCell>
                                <Badge variant={logo.isActive ? "default" : "secondary"}>
                                  {logo.isActive ? "Aktiv" : "Inaktiv"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenDialog(logo)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteConfirmId(logo.id)}
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
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLogo ? "Logo bearbeiten" : "Neues Logo hinzufügen"}</DialogTitle>
              <DialogDescription>
                Fügen Sie Logo-Details hinzu. Alle Felder mit * sind Pflichtfelder.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. FOCUS, Forbes"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as LogoCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presse">Presse</SelectItem>
                    <SelectItem value="mitgliedschaft">Mitgliedschaft</SelectItem>
                    <SelectItem value="auszeichnung">Auszeichnung</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Bild-URL *</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {formData.imageUrl && (
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Vorschau:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Vorschau"
                      className="h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkUrl">Link-URL (optional)</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Sortierung</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">Niedrigere Zahlen erscheinen zuerst</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Aktiv</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingLogo ? "Aktualisieren" : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Logo löschen?</DialogTitle>
              <DialogDescription>
                Sind Sie sicher, dass Sie dieses Logo löschen möchten? Das Logo wird deaktiviert und nicht mehr auf der Landingpage angezeigt.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Löschen..." : "Löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
