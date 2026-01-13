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
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from './DashboardLayout';

type ContactType = 'kunde' | 'partner' | 'lieferant';

const typeLabels: Record<ContactType, string> = {
  kunde: 'Kunde',
  partner: 'Partner',
  lieferant: 'Lieferant',
};

const typeColors: Record<ContactType, string> = {
  kunde: 'bg-blue-500',
  partner: 'bg-purple-500',
  lieferant: 'bg-orange-500',
};

function ContactsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<ContactType>('kunde');
  const [street, setStreet] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const utils = trpc.useUtils();
  const { data: contacts = [], isLoading } = trpc.contact.list.useQuery({ tenantId: 1 });

  const createMutation = trpc.contact.create.useMutation({
    onSuccess: () => {
      toast.success('Kontakt erfolgreich erstellt');
      utils.contact.list.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen: ' + error.message);
    },
  });

  const updateMutation = trpc.contact.update.useMutation({
    onSuccess: () => {
      toast.success('Kontakt erfolgreich aktualisiert');
      utils.contact.list.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });

  const deleteMutation = trpc.contact.delete.useMutation({
    onSuccess: () => {
      toast.success('Kontakt erfolgreich gelöscht');
      utils.contact.list.invalidate();
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });

  const syncToGHLMutation = trpc.contact.syncToGHL.useMutation({
    onSuccess: () => {
      toast.success('Kontakt erfolgreich zu GHL synchronisiert');
      utils.contact.list.invalidate();
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
    setType('kunde');
    setStreet('');
    setZip('');
    setCity('');
    setCountry('');
    setWebsite('');
    setNotes('');
    setSelectedContact(null);
  };

  const handleCreate = () => {
    createMutation.mutate({
      tenantId: 1,
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      type,
      street: street || undefined,
      zip: zip || undefined,
      city: city || undefined,
      country: country || undefined,
      website: website || undefined,
      notes: notes || undefined,
    });
  };

  const handleEdit = (contact: any) => {
    setSelectedContact(contact);
    setName(contact.name);
    setEmail(contact.email);
    setPhone(contact.phone || '');
    setCompany(contact.company || '');
    setType(contact.type);
    setStreet(contact.street || '');
    setZip(contact.zip || '');
    setCity(contact.city || '');
    setCountry(contact.country || '');
    setWebsite(contact.website || '');
    setNotes(contact.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedContact) return;
    updateMutation.mutate({
      id: selectedContact.id,
      tenantId: 1,
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      type,
      street: street || undefined,
      zip: zip || undefined,
      city: city || undefined,
      country: country || undefined,
      website: website || undefined,
      notes: notes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Möchten Sie diesen Kontakt wirklich löschen?')) {
      deleteMutation.mutate({ id, tenantId: 1 });
    }
  };

  const handleSyncToGHL = (id: number) => {
    syncToGHLMutation.mutate({ id, tenantId: 1 });
  };

  const openGHLContact = (ghlContactId: string) => {
    const ghlUrl = `https://app.gohighlevel.com/v2/location/0beKz0TSeMQXqUf2fDg7/contacts/detail/${ghlContactId}`;
    window.open(ghlUrl, '_blank');
  };

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    const matchesSearch = searchQuery === '' ||
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kontakte</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Geschäftskontakte</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Kontakt
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
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="kunde">Kunden</TabsTrigger>
              <TabsTrigger value="partner">Partner</TabsTrigger>
              <TabsTrigger value="lieferant">Lieferanten</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Lädt...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || typeFilter !== 'all' ? 'Keine Kontakte gefunden' : 'Noch keine Kontakte vorhanden'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Stadt</TableHead>
                <TableHead>GHL</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.company || '-'}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[contact.type as ContactType]}>
                      {typeLabels[contact.type as ContactType]}
                    </Badge>
                  </TableCell>
                  <TableCell>{contact.city || '-'}</TableCell>
                  <TableCell>
                    {contact.ghlContactId ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Sync
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openGHLContact(contact.ghlContactId!)}
                          title="In GHL öffnen"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">
                        Nicht sync
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSyncToGHL(contact.id)}
                        title="Zu GHL synchronisieren"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(contact)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(contact.id)}
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
            <DialogTitle>Neuer Kontakt</DialogTitle>
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
                <Label htmlFor="email">E-Mail *</Label>
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
            <div>
              <Label htmlFor="type">Typ</Label>
              <Select value={type} onValueChange={(v) => setType(v as ContactType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kunde">Kunde</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="lieferant">Lieferant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="street">Straße</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Musterstraße 123"
                />
              </div>
              <div>
                <Label htmlFor="zip">PLZ</Label>
                <Input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Berlin"
                />
              </div>
              <div>
                <Label htmlFor="country">Land</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Deutschland"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Interne Notizen..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={!name || !email}>
              Kontakt erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kontakt bearbeiten</DialogTitle>
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
                <Label htmlFor="edit-email">E-Mail *</Label>
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
            <div>
              <Label htmlFor="edit-type">Typ</Label>
              <Select value={type} onValueChange={(v) => setType(v as ContactType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kunde">Kunde</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="lieferant">Lieferant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-street">Straße</Label>
                <Input
                  id="edit-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-zip">PLZ</Label>
                <Input
                  id="edit-zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-city">Stadt</Label>
                <Input
                  id="edit-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Land</Label>
                <Input
                  id="edit-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notizen</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdate} disabled={!name || !email}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Contacts() {
  return (
    <DashboardLayout>
      <ContactsContent />
    </DashboardLayout>
  );
}
