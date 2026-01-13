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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from './DashboardLayout';

const stageConfig = [
  { key: 'new', label: 'Neu', color: '#6B7280' },
  { key: 'qualified', label: 'Qualifiziert', color: '#3B82F6' },
  { key: 'proposal', label: 'Angebot', color: '#F59E0B' },
  { key: 'negotiation', label: 'Verhandlung', color: '#8B5CF6' },
  { key: 'won', label: 'Gewonnen', color: '#10B981' },
  { key: 'lost', label: 'Verloren', color: '#EF4444' },
];

function PipelineContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [draggedDeal, setDraggedDeal] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [contactId, setContactId] = useState<number>(0);
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState('50');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState('new');

  const utils = trpc.useUtils();
  const { data: deals = [], isLoading: dealsLoading } = trpc.deal.list.useQuery({ tenantId: 1 });
  const { data: contacts = [] } = trpc.contact.list.useQuery({ tenantId: 1 });
  const { data: stages = [] } = trpc.pipeline.stages.useQuery({ tenantId: 1 });

  const createMutation = trpc.deal.create.useMutation({
    onSuccess: () => {
      toast.success('Deal erfolgreich erstellt');
      utils.deal.list.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen: ' + error.message);
    },
  });

  const updateMutation = trpc.deal.update.useMutation({
    onSuccess: () => {
      toast.success('Deal erfolgreich aktualisiert');
      utils.deal.list.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });

  const deleteMutation = trpc.deal.delete.useMutation({
    onSuccess: () => {
      toast.success('Deal erfolgreich gelöscht');
      utils.deal.list.invalidate();
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });

  const updateStageMutation = trpc.deal.updateStage.useMutation({
    onSuccess: () => {
      toast.success('Deal verschoben');
      utils.deal.list.invalidate();
    },
    onError: (error) => {
      toast.error('Fehler beim Verschieben: ' + error.message);
    },
  });

  const resetForm = () => {
    setName('');
    setContactId(0);
    setValue('');
    setProbability('50');
    setExpectedCloseDate('');
    setNotes('');
    setStage('new');
    setSelectedDeal(null);
  };

  const handleCreate = () => {
    const firstStage = stages[0];
    if (!firstStage) {
      toast.error('Keine Pipeline-Stages gefunden');
      return;
    }

    createMutation.mutate({
      tenantId: 1,
      contactId,
      stageId: firstStage.id,
      name,
      value: value ? parseFloat(value) : undefined,
      stage: stage as any,
      probability: parseInt(probability),
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
      notes: notes || undefined,
    });
  };

  const handleEdit = (deal: any) => {
    setSelectedDeal(deal);
    setName(deal.name);
    setContactId(deal.contactId);
    setValue(deal.value?.toString() || '');
    setProbability(deal.probability?.toString() || '50');
    setExpectedCloseDate(deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '');
    setNotes(deal.notes || '');
    setStage(deal.stage || 'new');
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedDeal) return;

    updateMutation.mutate({
      id: selectedDeal.id,
      tenantId: 1,
      name,
      value: value ? parseFloat(value) : undefined,
      stage: stage as any,
      probability: parseInt(probability),
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
      notes: notes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Möchten Sie diesen Deal wirklich löschen?')) {
      deleteMutation.mutate({ id, tenantId: 1 });
    }
  };

  const handleDragStart = (dealId: number) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageKey: string) => {
    if (draggedDeal) {
      const targetStageIndex = stageConfig.findIndex(s => s.key === stageKey);
      const targetStage = stages[targetStageIndex];

      if (targetStage) {
        updateStageMutation.mutate({
          id: draggedDeal,
          tenantId: 1,
          stageId: targetStage.id,
          stage: stageKey as any,
        });
      }
      setDraggedDeal(null);
    }
  };

  const getDealsByStage = (stageKey: string) => {
    return deals.filter(d => d.stage === stageKey) || [];
  };

  const getContactName = (contactId: number) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Unbekannt';
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Deal Pipeline</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Deals im Kanban-Board</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Deal
        </Button>
      </div>

      {dealsLoading ? (
        <div className="text-center py-8 text-gray-500">Lädt...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stageConfig.map((stageConf) => {
            const stageDeals = getDealsByStage(stageConf.key);
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div
                key={stageConf.key}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stageConf.key)}
              >
                <Card className="h-full bg-gray-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: stageConf.color }}
                        />
                        <CardTitle className="text-sm font-medium">
                          {stageConf.label}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {stageDeals.length}
                        </Badge>
                      </div>
                    </div>
                    {totalValue > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Gesamt: {formatCurrency(totalValue)}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal.id)}
                        className={`bg-white border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow ${
                          draggedDeal === deal.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{deal.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {getContactName(deal.contactId)}
                              </p>
                              <div className="mt-2 space-y-1">
                                {deal.value && (
                                  <p className="text-sm font-semibold text-blue-600">
                                    {formatCurrency(deal.value)}
                                  </p>
                                )}
                                {deal.probability !== null && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <TrendingUp className="h-3 w-3" />
                                    {deal.probability}% Wahrscheinlichkeit
                                  </div>
                                )}
                                {deal.expectedCloseDate && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(deal.expectedCloseDate).toLocaleDateString('de-DE')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(deal)}
                              className="h-6 w-6 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(deal.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg bg-white">
                        Keine Deals
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neuer Deal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Deal Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Immobilienfinanzierung Projekt XY"
              />
            </div>
            <div>
              <Label htmlFor="contact">Kontakt *</Label>
              <Select value={contactId.toString()} onValueChange={(v) => setContactId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Kontakt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name} ({contact.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Deal-Wert (EUR)</Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="500000"
                />
              </div>
              <div>
                <Label htmlFor="probability">Wahrscheinlichkeit (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="expectedCloseDate">Erwartetes Abschlussdatum</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Interne Notizen zum Deal..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={!name || !contactId}>
              Deal erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deal bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">Deal Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-stage">Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageConfig.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-value">Deal-Wert (EUR)</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-probability">Wahrscheinlichkeit (%)</Label>
                <Input
                  id="edit-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-expectedCloseDate">Erwartetes Abschlussdatum</Label>
              <Input
                id="edit-expectedCloseDate"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
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
            <Button onClick={handleUpdate} disabled={!name}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Pipeline() {
  return (
    <DashboardLayout>
      <PipelineContent />
    </DashboardLayout>
  );
}
