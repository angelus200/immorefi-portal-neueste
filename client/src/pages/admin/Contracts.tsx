import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Upload,
  Users,
  CheckCircle,
  Clock,
  Eye,
  UserPlus,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ContractGenerator } from "@/components/ContractGenerator";

const CONTRACT_TYPES = {
  analysis: "Analyse & Strukturierungsdiagnose",
  fund_structuring: "Fondsstrukturierung",
  cln_amc: "CLN/AMC Strukturierung",
  mandate: "Mandatsvertrag",
  nda: "Geheimhaltungsvereinbarung",
  other: "Sonstiges",
};

const CONTRACT_STATUS = {
  draft: { label: "Entwurf", color: "bg-gray-500" },
  active: { label: "Aktiv", color: "bg-green-500" },
  archived: { label: "Archiviert", color: "bg-yellow-500" },
};

export default function AdminContracts() {
  const { user, loading: authLoading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assignNote, setAssignNote] = useState("");
  
  // Form state for new contract
  const [newContract, setNewContract] = useState({
    name: "",
    type: "analysis" as keyof typeof CONTRACT_TYPES,
    description: "",
    version: "1.0",
    governingLaw: "Schweizer Recht (Schweizer Obligationenrecht)",
    arbitrationClause: "Für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist ein Schiedsgericht nach den Regeln der Schweizerischen Handelskammer zuständig. Der ordentliche Rechtsweg ist ausgeschlossen.",
  });
  
  // Default tenant ID (in production, this would come from context)
  const tenantId = 1;
  
  // Queries
  const { data: contracts, isLoading: contractsLoading, refetch: refetchContracts } = trpc.contract.list.useQuery({ tenantId });
  const { data: users } = trpc.user.list.useQuery();
  const { data: acceptances } = trpc.contract.getAcceptances.useQuery({ tenantId });
  
  // Mutations
  const createContract = trpc.contract.create.useMutation({
    onSuccess: () => {
      toast.success("Vertrag erfolgreich erstellt");
      setIsCreateOpen(false);
      refetchContracts();
      setNewContract({
        name: "",
        type: "analysis",
        description: "",
        version: "1.0",
        governingLaw: "Schweizer Recht (Schweizer Obligationenrecht)",
        arbitrationClause: "Für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist ein Schiedsgericht nach den Regeln der Schweizerischen Handelskammer zuständig. Der ordentliche Rechtsweg ist ausgeschlossen.",
      });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const updateContract = trpc.contract.update.useMutation({
    onSuccess: () => {
      toast.success("Vertrag aktualisiert");
      refetchContracts();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const assignContract = trpc.contract.assign.useMutation({
    onSuccess: () => {
      toast.success("Vertrag erfolgreich zugewiesen");
      setIsAssignOpen(false);
      setSelectedContract(null);
      setSelectedUserId("");
      setAssignNote("");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const handleCreateContract = () => {
    // In production, you would first upload the file and get the fileKey
    // For now, we'll use a placeholder
    createContract.mutate({
      tenantId,
      ...newContract,
      fileKey: `contracts/${Date.now()}-${newContract.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      fileName: `${newContract.name}.pdf`,
    });
  };
  
  const handleAssignContract = () => {
    if (!selectedContract || !selectedUserId) return;
    
    assignContract.mutate({
      contractId: selectedContract,
      userId: parseInt(selectedUserId),
      tenantId,
      note: assignNote || undefined,
    });
  };
  
  const handleActivateContract = (contractId: number) => {
    updateContract.mutate({
      id: contractId,
      tenantId,
      status: "active",
    });
  };
  
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user || (user.role !== "superadmin" && user.role !== "tenant_admin")) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Keine Berechtigung für diese Seite.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  // Count acceptances per contract
  const acceptanceCountByContract = acceptances?.reduce((acc, a) => {
    acc[a.contractId] = (acc[a.contractId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vertragsverwaltung</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Vertragsvorlagen und weisen Sie diese Kunden zu
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsGeneratorOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Vertrag aus Vorlage
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Neuer Vertrag
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neuen Vertrag erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie eine neue Vertragsvorlage. Diese kann anschließend Kunden zugewiesen werden.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Vertragsname</Label>
                  <Input
                    id="name"
                    value={newContract.name}
                    onChange={(e) => setNewContract({ ...newContract, name: e.target.value })}
                    placeholder="z.B. Mandatsvertrag Fondsstrukturierung"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Vertragstyp</Label>
                    <Select
                      value={newContract.type}
                      onValueChange={(value) => setNewContract({ ...newContract, type: value as keyof typeof CONTRACT_TYPES })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONTRACT_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={newContract.version}
                      onChange={(e) => setNewContract({ ...newContract, version: e.target.value })}
                      placeholder="1.0"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={newContract.description}
                    onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                    placeholder="Kurze Beschreibung des Vertrags..."
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="governingLaw">Anwendbares Recht</Label>
                  <Input
                    id="governingLaw"
                    value={newContract.governingLaw}
                    onChange={(e) => setNewContract({ ...newContract, governingLaw: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arbitrationClause">Schiedsklausel</Label>
                  <Textarea
                    id="arbitrationClause"
                    value={newContract.arbitrationClause}
                    onChange={(e) => setNewContract({ ...newContract, arbitrationClause: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Vertragsdokument (PDF)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      PDF-Datei hier ablegen oder klicken zum Hochladen
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Funktion wird in Kürze verfügbar sein)
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateContract} disabled={!newContract.name || createContract.isPending}>
                  {createContract.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Vertrag erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Verträge</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Verträge</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contracts?.filter(c => c.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anerkennungen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptances?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contracts?.filter(c => c.status === "draft").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vertragsvorlagen</CardTitle>
            <CardDescription>
              Alle Vertragsvorlagen mit Status und Zuweisungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : contracts && contracts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Anerkennungen</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.name}</TableCell>
                      <TableCell>{CONTRACT_TYPES[contract.type as keyof typeof CONTRACT_TYPES] || contract.type}</TableCell>
                      <TableCell>{contract.version || "1.0"}</TableCell>
                      <TableCell>
                        <Badge className={CONTRACT_STATUS[contract.status as keyof typeof CONTRACT_STATUS]?.color || "bg-gray-500"}>
                          {CONTRACT_STATUS[contract.status as keyof typeof CONTRACT_STATUS]?.label || contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{acceptanceCountByContract[contract.id] || 0}</TableCell>
                      <TableCell>
                        {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString("de-DE") : "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {contract.status === "draft" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleActivateContract(contract.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedContract(contract.id);
                            setIsAssignOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Noch keine Verträge vorhanden</p>
                <p className="text-sm">Erstellen Sie Ihren ersten Vertrag</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Acceptances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vertragsanerkennungen</CardTitle>
            <CardDescription>
              Übersicht aller Kunden-Anerkennungen (Schweizer Recht, B2B)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {acceptances && acceptances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Vertrag</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Anerkannt am</TableHead>
                    <TableHead>Bestätigungstext</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acceptances.map((acceptance) => (
                    <TableRow key={acceptance.id}>
                      <TableCell>
                        {users?.find(u => u.id === acceptance.userId)?.name || `User #${acceptance.userId}`}
                      </TableCell>
                      <TableCell>
                        {contracts?.find(c => c.id === acceptance.contractId)?.name || `Vertrag #${acceptance.contractId}`}
                      </TableCell>
                      <TableCell>{acceptance.contractVersion || "-"}</TableCell>
                      <TableCell>
                        {acceptance.acceptedAt ? new Date(acceptance.acceptedAt).toLocaleString("de-DE") : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {acceptance.confirmationText}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Noch keine Anerkennungen vorhanden</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Assign Dialog */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vertrag zuweisen</DialogTitle>
              <DialogDescription>
                Weisen Sie diesen Vertrag einem Kunden zur Anerkennung zu.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="userId">Kunde auswählen</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.filter(u => u.role === "client").map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || user.email || `User #${user.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Hinweis (optional)</Label>
                <Textarea
                  id="note"
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Optionaler Hinweis für den Kunden..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAssignContract} disabled={!selectedUserId || assignContract.isPending}>
                {assignContract.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Zuweisen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contract Generator */}
        <ContractGenerator
          open={isGeneratorOpen}
          onOpenChange={setIsGeneratorOpen}
          onContractCreated={(contract) => {
            toast.success("Vertrag aus Vorlage erstellt");
            refetchContracts();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
