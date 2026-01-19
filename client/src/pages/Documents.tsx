import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import {
  Search,
  Upload,
  FileText,
  Download,
  Trash2,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const TENANT_ID = 1;

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <File className="h-5 w-5 text-muted-foreground" />;
  if (mimeType.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function DocumentsContent() {
  console.log("[Documents] Component rendering");

  const { user } = useAuth();
  console.log("[Documents] User loaded:", user ? `ID=${user.id}, Role=${user.role}` : "null");

  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin" || user?.role === "staff";
  console.log("[Documents] isAdmin:", isAdmin);

  // Early return if user not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  // Queries with safe defaults
  console.log("[Documents] Executing file.list query with TENANT_ID:", TENANT_ID);
  const { data: files = [], isLoading, refetch, error: filesError } = trpc.file.list.useQuery({ tenantId: TENANT_ID });
  console.log("[Documents] Files loaded:", files?.length ?? 0, "files, isLoading:", isLoading, "error:", filesError?.message);

  console.log("[Documents] Executing user.list query, enabled:", isAdmin);
  const { data: users = [] } = trpc.user.list.useQuery(undefined, { enabled: isAdmin });
  console.log("[Documents] Users loaded:", users?.length ?? 0, "users");

  // Upload mutation
  const createFileRecord = trpc.file.createFileRecord.useMutation({
    onSuccess: () => {
      toast.success("Datei erfolgreich hochgeladen");
      refetch();
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedUserId(null);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      toast.error("Fehler beim Speichern: " + error.message);
      setUploading(false);
    },
  });

  // Delete mutation
  const deleteFileMutation = trpc.file.delete.useMutation({
    onSuccess: () => {
      toast.success("Datei gelöscht");
      refetch();
    },
    onError: (error) => {
      toast.error("Fehler beim Löschen: " + error.message);
    },
  });

  // Filter files by search term
  const filteredFiles = (files ?? []).filter(file => {
    if (!searchTerm) return true;
    return file.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Bitte wählen Sie eine Datei aus");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(",")[1];

          if (!base64Data) {
            throw new Error("Fehler beim Lesen der Datei");
          }

          // Upload to server via API
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: selectedFile.name,
              mimeType: selectedFile.type,
              data: base64Data,
            }),
          });

          if (!response.ok) {
            throw new Error("Upload fehlgeschlagen");
          }

          const result = await response.json();

          // Save file record in database
          await createFileRecord.mutateAsync({
            tenantId: TENANT_ID,
            fileName: selectedFile.name,
            fileKey: result.key,
            fileUrl: result.url,
            mimeType: selectedFile.type,
            size: selectedFile.size,
            category: "document",
            userId: isAdmin && selectedUserId ? selectedUserId : user?.id,
          });
        } catch (error) {
          console.error("Upload error:", error);
          const errorMessage = error instanceof Error ? error.message : "Fehler beim Hochladen";
          toast.error(errorMessage);
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Fehler beim Lesen der Datei");
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen");
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/trpc/file.getDownloadUrl?input=${encodeURIComponent(JSON.stringify({ id: fileId, tenantId: TENANT_ID }))}`);
      const data = await response.json();
      if (data.result?.data?.url) {
        window.open(data.result.data.url, '_blank');
      } else {
        throw new Error("Download URL nicht verfügbar");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Fehler beim Herunterladen");
    }
  };

  const handleDelete = async (fileId: number, fileName: string) => {
    if (!confirm(`Möchten Sie die Datei "${fileName}" wirklich löschen?`)) {
      return;
    }
    deleteFileMutation.mutate({ id: fileId, tenantId: TENANT_ID });
  };

  // Show error state
  if (filesError) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <p className="text-destructive font-medium mb-2">Fehler beim Laden der Dateien</p>
          <p className="text-sm text-muted-foreground">{filesError.message}</p>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dokumente</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Dateien und Dokumente</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Hochladen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Dateien</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDFs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(files ?? []).filter(f => f.mimeType?.includes("pdf")).length}
            </div>
            <p className="text-xs text-muted-foreground">Dokumente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilder</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(files ?? []).filter(f => f.mimeType?.startsWith("image/")).length}
            </div>
            <p className="text-xs text-muted-foreground">Dateien</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen nach Dateiname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Datei-Übersicht</CardTitle>
          <CardDescription>{filteredFiles.length} Dateien gefunden</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laden...</div>
          ) : filteredFiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Hochgeladen</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.mimeType)}
                        <span className="font-medium">{file.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.mimeType?.split("/")[1]?.toUpperCase() ?? "-"}
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString("de-DE") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file.id, file.fileName ?? '')}
                        title="Herunterladen"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.id, file.fileName ?? '')}
                        disabled={deleteFileMutation.isPending}
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Dateien gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dokument hochladen</DialogTitle>
            <DialogDescription>
              Wählen Sie eine Datei zum Hochladen aus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="customer">Kunde zuordnen (optional)</Label>
                <Select
                  value={selectedUserId?.toString() ?? "none"}
                  onValueChange={(value) => setSelectedUserId(value && value !== "none" ? parseInt(value) : null)}
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Keinem Kunden zuordnen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keinem Kunden zuordnen</SelectItem>
                    {(users ?? []).filter(u => u.role === 'client').map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{u.name ?? u.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="file">Datei</Label>
              <input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Erlaubte Formate: PDF, JPG, PNG, DOCX
              </p>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Ausgewählt: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFile(null);
                setSelectedUserId(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={uploading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Wird hochgeladen..." : "Hochladen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Documents() {
  return (
    <DashboardLayout>
      <DocumentsContent />
    </DashboardLayout>
  );
}
