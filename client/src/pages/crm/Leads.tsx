import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from './DashboardLayout';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

const statusLabels: Record<LeadStatus, string> = {
  new: 'Neu',
  contacted: 'Kontaktiert',
  qualified: 'Qualifiziert',
  converted: 'Konvertiert',
  lost: 'Verloren',
};

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-gray-500',
  contacted: 'bg-blue-500',
  qualified: 'bg-green-500',
  converted: 'bg-emerald-500',
  lost: 'bg-red-500',
};

function LeadsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [capitalNeed, setCapitalNeed] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');

  const utils = trpc.useUtils();
  const { data: leads = [], isLoading } = trpc.lead.list.useQuery({ tenantId: 1 });

  const createMutation = trpc.lead.create.useMutation({
    onSuccess: () => {
      toast.success('Lead erfolgreich erstellt');
      utils.lead.list.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen: ' + error.message);
    },
  });

  const updateMutation = trpc.lead.update.useMutation({
    onSuccess: () => {
      toast.success('Lead erfolgreich aktualisiert');
      utils.lead.list.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });

  const deleteMutation = trpc.lead.delete.useMutation({
    onSuccess: () => {
      toast.success('Lead erfolgreich gelöscht');
      utils.lead.list.invalidate();
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });

  const convertMutation = trpc.lead.convertToContact.useMutation({
    onSuccess: () => {
      toast.success('Lead erfolgreich zu Kontakt konvertiert');
      utils.lead.list.invalidate();
    },
    onError: (error) => {
      toast.error('Fehler bei Konvertierung: ' + error.message);
    },
  });

  const syncToGHLMutation = trpc.lead.syncToGHL.useMutation({
    onSuccess: () => {
      toast.success('Lead erfolgreich zu GHL synchronisiert');
      utils.lead.list.invalidate();
    },
    onError: (error) => {
      toast.error('GHL Sync Fehler: ' + error.message);
    },
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setCapitalNeed('');
    setTimeHorizon('');
    setDescription('');
    setNotes('');
    setStatus('new');
    setSelectedLead(null);
  };

  const handleCreate = () => {
    createMutation.mutate({
      tenantId: 1,
      name,
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      capitalNeed: capitalNeed || undefined,
      timeHorizon: timeHorizon || undefined,
      description: description || undefined,
      notes: notes || undefined,
      source: 'manual',
    });
  };

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setName(lead.name || '');
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setCompany(lead.company || '');
    setCapitalNeed(lead.capitalNeed || '');
    setTimeHorizon(lead.timeHorizon || '');
    setDescription(lead.description || '');
    setNotes(lead.notes || '');
    setStatus(lead.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedLead) return;
    updateMutation.mutate({
      id: selectedLead.id,
      tenantId: 1,
      name,
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      capitalNeed: capitalNeed || undefined,
      timeHorizon: timeHorizon || undefined,
      description: description || undefined,
      notes: notes || undefined,
      status,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Möchten Sie diesen Lead wirklich löschen?')) {
      deleteMutation.mutate({ id, tenantId: 1 });
    }
  };

  const handleConvert = (id: number) => {
    if (confirm('Lead zu Kontakt konvertieren?')) {
      convertMutation.mutate({ id, tenantId: 1 });
    }
  };

  const handleSyncToGHL = (id: number) => {
    syncToGHLMutation.mutate({ id, tenantId: 1 });
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Leads und synchronisieren Sie mit GoHighLevel</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Lead
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nach Name, E-Mail oder Firma suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="new">Neu</TabsTrigger>
              <TabsTrigger value="contacted">Kontaktiert</TabsTrigger>
              <TabsTrigger value="qualified">Qualifiziert</TabsTrigger>
              <TabsTrigger value="converted">Konvertiert</TabsTrigger>
              <TabsTrigger value="lost">Verloren</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Lädt...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all' ? 'Keine Leads gefunden' : 'Noch keine Leads vorhanden'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Kapitalbedarf</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GHL Sync</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email || '-'}</TableCell>
                  <TableCell>{lead.company || '-'}</TableCell>
                  <TableCell>{lead.capitalNeed || '-'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[lead.status as LeadStatus]}>
                      {statusLabels[lead.status as LeadStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.ghlContactId ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Synchronisiert
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">
                        Nicht sync
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {lead.status !== 'converted' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleConvert(lead.id)}
                          title="Zu Kontakt konvertieren"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSyncToGHL(lead.id)}
                        title="Zu GHL synchronisieren"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(lead)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuer Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
              <div>
                <Label htmlFor="company">Firma</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Musterfirma GmbH"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capitalNeed">Kapitalbedarf</Label>
                <Input
                  id="capitalNeed"
                  value={capitalNeed}
                  onChange={(e) => setCapitalNeed(e.target.value)}
                  placeholder="z.B. 500.000 - 1.000.000 EUR"
                />
              </div>
              <div>
                <Label htmlFor="timeHorizon">Zeithorizont</Label>
                <Input
                  id="timeHorizon"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  placeholder="z.B. 3-6 Monate"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Projektbeschreibung..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Interne Notizen</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Interne Notizen..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={!name}>
              Lead erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-Mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Telefon</Label>
                <Input
                  id="edit-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Firma</Label>
                <Input
                  id="edit-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-capitalNeed">Kapitalbedarf</Label>
                <Input
                  id="edit-capitalNeed"
                  value={capitalNeed}
                  onChange={(e) => setCapitalNeed(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-timeHorizon">Zeithorizont</Label>
                <Input
                  id="edit-timeHorizon"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Neu</SelectItem>
                  <SelectItem value="contacted">Kontaktiert</SelectItem>
                  <SelectItem value="qualified">Qualifiziert</SelectItem>
                  <SelectItem value="converted">Konvertiert</SelectItem>
                  <SelectItem value="lost">Verloren</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Beschreibung</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Interne Notizen</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdate} disabled={!name}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
