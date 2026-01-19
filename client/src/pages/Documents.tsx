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
  Filter
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin" || user?.role === "staff";

  const { data: files, isLoading, refetch } = trpc.file.list.useQuery({ tenantId: TENANT_ID });
  const { data: users = [] } = trpc.user.list.useQuery(undefined, { enabled: isAdmin });
  
  const createFileRecord = trpc.file.createFileRecord.useMutation({
    onSuccess: () => {
      toast.success("Datei hochgeladen");
      refetch();
      setIsUploadDialogOpen(false);
      setSelectedUserId("");
    },
    onError: (error) => {
      toast.error("Fehler beim Speichern: " + error.message);
    },
  });

  const deleteFile = trpc.file.delete.useMutation({
    onSuccess: () => {
      toast.success("Datei gelöscht");
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const filteredFiles = files?.filter(file => {
    const matchesSearch = !searchTerm ||
      file.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = filterUserId === "all" ||
      (filterUserId === "unassigned" && !file.userId) ||
      file.userId?.toString() === filterUserId;
    return matchesSearch && matchesUser;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(",")[1];

          // Upload to server via API
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: file.type,
              data: base64Data,
            }),
          });

          if (!response.ok) {
            throw new Error("Upload fehlgeschlagen");
          }

          const result = await response.json();

          // Save document reference in database
          await createFileRecord.mutateAsync({
            tenantId: TENANT_ID,
            fileName: file.name,
            fileKey: result.key,
            fileUrl: result.url,
            mimeType: file.type,
            size: file.size,
            category: "document",
            userId: isAdmin
              ? (selectedUserId ? parseInt(selectedUserId) : undefined)
              : user?.id,
          });

          // Success notification and refresh list
          toast.success("Datei erfolgreich hochgeladen");
          setIsUploadDialogOpen(false);
          setSelectedUserId("");
          refetch();
        } catch (error) {
          console.error("Upload error:", error);
          const errorMessage = error instanceof Error ? error.message : "Fehler beim Hochladen";
          toast.error(errorMessage);
        }

        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        toast.error("Fehler beim Lesen der Datei");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Fehler beim Hochladen";
      toast.error(errorMessage);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      // Call the tRPC endpoint directly via fetch
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
    deleteFile.mutate({ id: fileId, tenantId: TENANT_ID });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dokumente</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Dateien und Dokumente</p>
        </div>
        <div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files?.length || 0}</div>
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
              {files?.filter(f => f.mimeType?.includes("pdf")).length || 0}
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
              {files?.filter(f => f.mimeType?.startsWith("image/")).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Dateien</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Dateiname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {isAdmin && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select value={filterUserId} onValueChange={setFilterUserId}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Filter nach Kunde" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Dokumente</SelectItem>
                    <SelectItem value="unassigned">Nicht zugeordnet</SelectItem>
                    {users.filter(u => u.role === 'client').map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Datei-Übersicht</CardTitle>
          <CardDescription>{filteredFiles?.length || 0} Dateien gefunden</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laden...</div>
          ) : filteredFiles && filteredFiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {isAdmin && <TableHead>Kunde</TableHead>}
                  <TableHead>Typ</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Hochgeladen</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => {
                  const fileUser = users.find(u => u.id === file.userId);
                  return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.mimeType)}
                        <span className="font-medium">{file.fileName}</span>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-muted-foreground">
                        {fileUser ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {fileUser.name || fileUser.email}
                          </div>
                        ) : (
                          <span className="text-xs italic">Nicht zugeordnet</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">
                      {file.mimeType?.split("/")[1]?.toUpperCase() || "-"}
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString("de-DE") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file.id, file.fileName || '')}
                        title="Herunterladen"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.id, file.fileName || '')}
                        disabled={deleteFile.isPending}
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
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
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dokument hochladen</DialogTitle>
            <DialogDescription>
              {isAdmin
                ? "Wählen Sie optional einen Kunden aus, dem dieses Dokument zugeordnet werden soll."
                : "Laden Sie ein Dokument hoch."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="customer">Kunde (optional)</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Keinem Kunden zuordnen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Keinem Kunden zuordnen</SelectItem>
                    {users.filter(u => u.role === 'client').map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{user.name || user.email}</span>
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
                onChange={handleUpload}
                accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Erlaubte Formate: PDF, JPG, PNG, DOCX
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setSelectedUserId("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Abbrechen
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
