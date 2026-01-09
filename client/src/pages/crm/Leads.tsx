import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Search, 
  MoreHorizontal, 
  ArrowUpDown,
  UserPlus,
  Filter
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const TENANT_ID = 1;

const statusLabels: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  converted: "Konvertiert",
  lost: "Verloren",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  converted: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
};

function LeadsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: leads, isLoading, refetch } = trpc.lead.list.useQuery({ tenantId: TENANT_ID });
  const { data: contacts } = trpc.contact.list.useQuery({ tenantId: TENANT_ID });
  
  const updateStatus = trpc.lead.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert");
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren");
    },
  });

  const getContactName = (contactId: number | null) => {
    if (!contactId) return "Unbekannt";
    const contact = contacts?.find(c => c.id === contactId);
    return contact?.name || "Unbekannt";
  };

  const getContactEmail = (contactId: number | null) => {
    if (!contactId) return "-";
    const contact = contacts?.find(c => c.id === contactId);
    return contact?.email || "-";
  };

  const filteredLeads = leads?.filter(lead => {
    const contact = contacts?.find(c => c.id === lead.contactId);
    const matchesSearch = !searchTerm || 
      contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.kapitalbedarf?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Interessenten</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Neuer Lead
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, E-Mail oder Kapitalbedarf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="new">Neu</SelectItem>
                <SelectItem value="contacted">Kontaktiert</SelectItem>
                <SelectItem value="qualified">Qualifiziert</SelectItem>
                <SelectItem value="converted">Konvertiert</SelectItem>
                <SelectItem value="lost">Verloren</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead-Übersicht</CardTitle>
          <CardDescription>
            {filteredLeads?.length || 0} Leads gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Laden...
            </div>
          ) : filteredLeads && filteredLeads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-8 -ml-3">
                      Kontakt
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Kapitalbedarf</TableHead>
                  <TableHead>Zeithorizont</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {getContactName(lead.contactId)}
                    </TableCell>
                    <TableCell>{getContactEmail(lead.contactId)}</TableCell>
                    <TableCell>{lead.kapitalbedarf || "-"}</TableCell>
                    <TableCell>{lead.zeithorizont || "-"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => updateStatus.mutate({
                              id: lead.id,
                              tenantId: TENANT_ID,
                              status: "contacted"
                            })}
                          >
                            Als kontaktiert markieren
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus.mutate({
                              id: lead.id,
                              tenantId: TENANT_ID,
                              status: "qualified"
                            })}
                          >
                            Als qualifiziert markieren
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus.mutate({
                              id: lead.id,
                              tenantId: TENANT_ID,
                              status: "converted"
                            })}
                          >
                            Als konvertiert markieren
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus.mutate({
                              id: lead.id,
                              tenantId: TENANT_ID,
                              status: "lost"
                            })}
                            className="text-destructive"
                          >
                            Als verloren markieren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Leads gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Leads() {
  return (
    <DashboardLayout>
      <LeadsContent />
    </DashboardLayout>
  );
}
