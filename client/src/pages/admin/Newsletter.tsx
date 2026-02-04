import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mail, Download, Trash2, Search, Users, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function NewsletterAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch subscribers
  const { data: allSubscribers = [], isLoading } = trpc.newsletter.list.useQuery();
  const { data: activeSubscribers = [] } = trpc.newsletter.listActive.useQuery();

  const subscribers = showActiveOnly ? activeSubscribers : allSubscribers;

  // Delete mutation
  const deleteMutation = trpc.newsletter.delete.useMutation({
    onSuccess: () => {
      toast.success('Abonnent erfolgreich gelöscht');
      utils.newsletter.list.invalidate();
      utils.newsletter.listActive.invalidate();
      setDeleteEmail(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Löschen');
    },
  });

  // Filter subscribers based on search
  const filteredSubscribers = subscribers.filter((sub) => {
    const query = searchQuery.toLowerCase();
    return (
      sub.email.toLowerCase().includes(query) ||
      (sub.firstName && sub.firstName.toLowerCase().includes(query))
    );
  });

  // CSV Export
  const handleExportCSV = () => {
    const csvData = [
      ['Email', 'Vorname', 'Angemeldet am', 'Status', 'GHL Contact ID', 'Abgemeldet am'].join(','),
      ...filteredSubscribers.map((sub) => [
        sub.email,
        sub.firstName || '',
        sub.subscribedAt ? format(new Date(sub.subscribedAt), 'dd.MM.yyyy HH:mm') : '',
        sub.unsubscribedAt ? 'Abgemeldet' : 'Aktiv',
        sub.ghlContactId || '',
        sub.unsubscribedAt ? format(new Date(sub.unsubscribedAt), 'dd.MM.yyyy HH:mm') : '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success('CSV-Export erfolgreich');
  };

  const handleDelete = (email: string) => {
    setDeleteEmail(email);
  };

  const confirmDelete = () => {
    if (deleteEmail) {
      deleteMutation.mutate({ email: deleteEmail });
    }
  };

  const activeCount = allSubscribers.filter((sub) => !sub.unsubscribedAt).length;
  const unsubscribedCount = allSubscribers.filter((sub) => sub.unsubscribedAt).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Newsletter-Abonnenten
          </h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Ihre Newsletter-Abonnenten
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Gesamt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSubscribers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                Aktiv
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                Abgemeldet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Abonnenten-Liste</CardTitle>
                <CardDescription>
                  {filteredSubscribers.length} von {subscribers.length} Abonnenten
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showActiveOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                >
                  {showActiveOnly ? 'Alle anzeigen' : 'Nur Aktive'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={filteredSubscribers.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email oder Name suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Lädt...</div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Keine Abonnenten gefunden
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Vorname</TableHead>
                      <TableHead>Angemeldet am</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quelle</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">
                          {subscriber.email}
                        </TableCell>
                        <TableCell>{subscriber.firstName || '-'}</TableCell>
                        <TableCell>
                          {subscriber.subscribedAt
                            ? format(new Date(subscriber.subscribedAt), 'dd.MM.yyyy HH:mm', {
                                locale: de,
                              })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {subscriber.unsubscribedAt ? (
                            <Badge variant="destructive">Abgemeldet</Badge>
                          ) : (
                            <Badge variant="default">Aktiv</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscriber.source}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subscriber.email)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEmail} onOpenChange={() => setDeleteEmail(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abonnent löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Abonnenten <strong>{deleteEmail}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
