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
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Activity, User, FileText, Settings } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const TENANT_ID = 1;

function AuditContent() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: auditLogs, isLoading } = trpc.audit.list.useQuery({ tenantId: TENANT_ID, limit: 100 });
  const { data: users } = trpc.user.list.useQuery();

  const getUserName = (userId: number | null) => {
    if (!userId) return "System";
    const user = users?.find(u => u.id === userId);
    return user?.name || "Unbekannt";
  };

  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(log.userId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const actionLabels: Record<string, string> = {
    create: "Erstellt",
    update: "Aktualisiert",
    delete: "Gelöscht",
    move: "Verschoben",
    upload: "Hochgeladen",
    download: "Heruntergeladen",
  };

  const actionColors: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    move: "bg-yellow-100 text-yellow-800",
    upload: "bg-purple-100 text-purple-800",
    download: "bg-gray-100 text-gray-800",
  };

  const entityIcons: Record<string, typeof Activity> = {
    lead: User,
    deal: Activity,
    contact: User,
    file: FileText,
    tenant: Settings,
    membership: User,
    pipeline_stage: Activity,
    task: Activity,
    note: FileText,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Verfolgen Sie alle Änderungen im System</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen nach Aktion, Entität oder Benutzer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitätsprotokoll</CardTitle>
          <CardDescription>
            {filteredLogs?.length || 0} Einträge gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Laden...
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Entität</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const EntityIcon = entityIcons[log.entityType] || Activity;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {getUserName(log.userId).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{getUserName(log.userId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                          {actionLabels[log.action] || log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EntityIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{log.entityType}</span>
                          <span className="text-muted-foreground">#{log.entityId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground">
                          {log.action} {log.entityType}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Audit-Einträge gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAudit() {
  return (
    <DashboardLayout>
      <AuditContent />
    </DashboardLayout>
  );
}
