import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  Search, 
  Activity, 
  User, 
  ShoppingCart, 
  FileText, 
  Settings, 
  LogIn, 
  LogOut,
  Upload,
  Download,
  Edit,
  Trash,
  Plus,
  Eye,
  Loader2
} from "lucide-react";

const actionIcons: Record<string, any> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash,
  view: Eye,
  upload: Upload,
  download: Download,
  order: ShoppingCart,
  settings: Settings,
};

const actionLabels: Record<string, string> = {
  login: "Anmeldung",
  logout: "Abmeldung",
  create: "Erstellt",
  update: "Aktualisiert",
  delete: "Gelöscht",
  view: "Angesehen",
  upload: "Hochgeladen",
  download: "Heruntergeladen",
  order: "Bestellung",
  settings: "Einstellungen",
};

const actionColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  login: "default",
  logout: "secondary",
  create: "default",
  update: "secondary",
  delete: "destructive",
  view: "outline",
  upload: "default",
  download: "outline",
  order: "default",
  settings: "secondary",
};

export default function AdminAuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const { data: auditLogs, isLoading } = trpc.admin.getAuditLog.useQuery();

  const filteredLogs = auditLogs?.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit-Log</h1>
          <p className="text-muted-foreground">
            Protokoll aller Benutzeraktivitäten im System
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heute</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auditLogs?.filter((log) => {
                  const today = new Date();
                  const logDate = new Date(log.createdAt);
                  return logDate.toDateString() === today.toDateString();
                }).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Aktivitäten</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anmeldungen</CardTitle>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auditLogs?.filter((log) => log.action === "login").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Änderungen</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auditLogs?.filter((log) => log.action === "update" || log.action === "create").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Erstellt/Aktualisiert</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Löschungen</CardTitle>
              <Trash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auditLogs?.filter((log) => log.action === "delete").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Gelöscht</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitätsprotokoll</CardTitle>
            <CardDescription>
              Alle Benutzeraktionen werden hier protokolliert
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nach Benutzer oder Beschreibung suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alle Aktionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Aktionen</SelectItem>
                  <SelectItem value="login">Anmeldungen</SelectItem>
                  <SelectItem value="logout">Abmeldungen</SelectItem>
                  <SelectItem value="create">Erstellt</SelectItem>
                  <SelectItem value="update">Aktualisiert</SelectItem>
                  <SelectItem value="delete">Gelöscht</SelectItem>
                  <SelectItem value="upload">Uploads</SelectItem>
                  <SelectItem value="download">Downloads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeitpunkt</TableHead>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Aktion</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>IP-Adresse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{log.userName || "System"}</div>
                              <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionColors[log.action] || "outline"} className="gap-1">
                            {getActionIcon(log.action)}
                            {actionLabels[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {log.description}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.ipAddress || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Keine Aktivitäten gefunden</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || actionFilter !== "all"
                    ? "Keine Aktivitäten entsprechen Ihren Filterkriterien"
                    : "Es wurden noch keine Aktivitäten protokolliert"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
