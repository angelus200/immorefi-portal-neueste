import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  File,
  FileSpreadsheet,
  Image
} from "lucide-react";

const DOCUMENT_CATEGORIES = [
  { value: "jahresabschluss", label: "Jahresabschlüsse (letzte 3 Jahre)" },
  { value: "bwa", label: "BWA / Summen- und Saldenliste" },
  { value: "objektliste", label: "Objektliste mit Eckdaten" },
  { value: "mieterliste", label: "Aktuelle Mieterliste" },
  { value: "finanzierungen", label: "Übersicht bestehender Finanzierungen" },
  { value: "wertgutachten", label: "Aktuelle Wertgutachten" },
  { value: "gesellschaftsvertrag", label: "Gesellschaftsvertrag / Satzung" },
  { value: "sonstige", label: "Sonstige Dokumente" },
] as const;

type DocumentCategory = typeof DOCUMENT_CATEGORIES[number]["value"];

type UploadedDoc = {
  id: number;
  fileName: string;
  category: DocumentCategory;
  size: number;
  createdAt: Date;
};

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("image")) return Image;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function OnboardingDocumentUpload() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("jahresabschluss");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: documents, refetch } = trpc.user.getOnboardingDocuments.useQuery();
  
  const uploadMutation = trpc.user.uploadOnboardingDocument.useMutation({
    onSuccess: () => {
      toast.success("Dokument erfolgreich hochgeladen");
      refetch();
      setUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error("Fehler beim Hochladen: " + error.message);
      setUploading(false);
      setUploadProgress(0);
    },
  });
  
  const deleteMutation = trpc.user.deleteOnboardingDocument.useMutation({
    onSuccess: () => {
      toast.success("Dokument gelöscht");
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error("Fehler beim Löschen: " + error.message);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Datei zu groß. Maximale Größe: 10 MB");
      return;
    }
    
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Dateityp nicht unterstützt. Erlaubt: PDF, Word, Excel, JPG, PNG");
      return;
    }
    
    setUploading(true);
    setUploadProgress(10);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        setUploadProgress(30);
        
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
        
        setUploadProgress(70);
        
        if (!response.ok) {
          throw new Error("Upload fehlgeschlagen");
        }
        
        const result = await response.json();
        setUploadProgress(90);
        
        // Save document reference in database
        uploadMutation.mutate({
          category: selectedCategory,
          fileName: file.name,
          fileKey: result.key,
          fileUrl: result.url,
          mimeType: file.type,
          size: file.size,
        });
      };
      
      reader.onerror = () => {
        toast.error("Fehler beim Lesen der Datei");
        setUploading(false);
        setUploadProgress(0);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Fehler beim Hochladen");
      setUploading(false);
      setUploadProgress(0);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Möchten Sie dieses Dokument wirklich löschen?")) {
      deleteMutation.mutate({ id });
    }
  };

  const groupedDocuments: Record<DocumentCategory, UploadedDoc[]> = {
    jahresabschluss: [],
    bwa: [],
    objektliste: [],
    mieterliste: [],
    finanzierungen: [],
    wertgutachten: [],
    gesellschaftsvertrag: [],
    sonstige: [],
  };
  
  documents?.forEach((doc: { id: number; fileName: string; category: string; size: number | null; createdAt: Date }) => {
    const category = doc.category as DocumentCategory;
    if (groupedDocuments[category]) {
      groupedDocuments[category].push({
        id: doc.id,
        fileName: doc.fileName,
        category: category,
        size: doc.size || 0,
        createdAt: doc.createdAt,
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dokumentenkategorie</label>
              <Select 
                value={selectedCategory} 
                onValueChange={(v) => setSelectedCategory(v as DocumentCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                uploading ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="hidden"
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <Upload className="h-12 w-12 mx-auto text-primary" />
                  </div>
                  <p className="font-medium">Wird hochgeladen...</p>
                  <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Dokument hochladen</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ziehen Sie eine Datei hierher oder klicken Sie zum Auswählen
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Datei auswählen
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, Word, Excel, JPG, PNG bis 10 MB
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <div className="space-y-4">
        <h3 className="font-semibold">Hochgeladene Dokumente</h3>
        
        {!documents || documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Dokumente hochgeladen</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {DOCUMENT_CATEGORIES.map((category) => {
              const docs = groupedDocuments[category.value];
              if (!docs || docs.length === 0) return null;
              
              return (
                <Card key={category.value}>
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      {category.label}
                    </h4>
                    <div className="space-y-2">
                      {docs.map((doc: UploadedDoc) => {
                        const FileIcon = getFileIcon(doc.category);
                        return (
                          <div 
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileIcon className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium text-sm">{doc.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString("de-DE")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(doc.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Required Documents Checklist */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-4">Empfohlene Dokumente für die Analyse</h4>
          <div className="space-y-2">
            {DOCUMENT_CATEGORIES.slice(0, 7).map((cat) => {
              const hasDoc = groupedDocuments[cat.value]?.length > 0;
              return (
                <div 
                  key={cat.value}
                  className={`flex items-center gap-3 p-2 rounded ${
                    hasDoc ? "bg-green-50 dark:bg-green-950/20" : ""
                  }`}
                >
                  {hasDoc ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-sm ${hasDoc ? "text-green-700 dark:text-green-300" : ""}`}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Je vollständiger Ihre Unterlagen, desto schneller können wir Ihre Analyse erstellen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
