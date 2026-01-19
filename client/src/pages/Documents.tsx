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
  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin" || user?.role === "staff";

  // Query 1: Files
  const { data: files, isLoading: filesLoading, error: filesError } = trpc.file.list.useQuery({ tenantId: TENANT_ID });

  // Query 2: Users (nur für Admins)
  const { data: users, isLoading: usersLoading, error: usersError } = trpc.user.list.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">DocumentsContent Debug</h1>

      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">User Info</h2>
        <div>Email: {user?.email || "undefined"}</div>
        <div>Role: {user?.role || "undefined"}</div>
        <div>Is Admin: {isAdmin ? "YES" : "NO"}</div>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Files Query</h2>
        <div>Loading: {filesLoading ? "YES" : "NO"}</div>
        <div>Error: {filesError?.message || "NONE"}</div>
        <div>Count: {files?.length ?? "undefined"}</div>
        <div>Data: {files ? "EXISTS" : "undefined"}</div>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Users Query</h2>
        <div>Loading: {usersLoading ? "YES" : "NO"}</div>
        <div>Error: {usersError?.message || "NONE"}</div>
        <div>Count: {users?.length ?? "undefined"}</div>
        <div>Data: {users ? "EXISTS" : "undefined"}</div>
      </div>
    </div>
  );
}

// ORIGINAL DocumentsContent GELÖSCHT (siehe Git History: Commit 02681c0)
// Wurde entfernt wegen JSX Syntax-Fehler beim Build
// Kann bei Bedarf aus Git wiederhergestellt werden

export default function Documents() {
  return (
    <DashboardLayout>
      <DocumentsContent />
    </DashboardLayout>
  );
}
