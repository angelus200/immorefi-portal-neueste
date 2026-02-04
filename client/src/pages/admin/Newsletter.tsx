import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Mail, Download, Trash2, Search, Users, UserCheck, UserX, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function NewsletterAdmin() {
  const [activeTab, setActiveTab] = useState('subscribers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  // Newsletter send form state
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  const utils = trpc.useUtils();

  // Fetch subscribers
  const { data: allSubscribers = [], isLoading } = trpc.newsletter.list.useQuery();
  const { data: activeSubscribers = [] } = trpc.newsletter.listActive.useQuery();

  const subscribers = showActiveOnly ? activeSubscribers : allSubscribers;
  const activeCount = allSubscribers.filter((sub) => !sub.unsubscribedAt).length;
  const unsubscribedCount = allSubscribers.filter((sub) => sub.unsubscribedAt).length;

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

  // Send mutation
  const sendMutation = trpc.newsletter.send.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSubject('');
      setHtmlContent('');
      setShowSendConfirm(false);
      setActiveTab('subscribers');
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Versand');
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

  const handleSendNewsletter = () => {
    if (!subject.trim()) {
      toast.error('Bitte Betreff eingeben');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error('Bitte Inhalt eingeben');
      return;
    }
    setShowSendConfirm(true);
  };

  const confirmSend = () => {
    sendMutation.mutate({
      subject: subject.trim(),
      htmlContent: htmlContent.trim(),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Newsletter-Verwaltung
          </h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Abonnenten und versenden Sie Newsletter
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="subscribers">Abonnenten</TabsTrigger>
            <TabsTrigger value="send">Newsletter versenden</TabsTrigger>
          </TabsList>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="mt-6">
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
          </TabsContent>

          {/* Send Newsletter Tab */}
          <TabsContent value="send" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter erstellen</CardTitle>
                  <CardDescription>
                    Erstellen Sie einen Newsletter für {activeCount} aktive Abonnenten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Betreff</label>
                    <Input
                      placeholder="Newsletter Betreff..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* HTML Content */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Inhalt (HTML)</label>
                    <Textarea
                      placeholder="<h1>Überschrift</h1><p>Ihr Newsletter-Text...</p>"
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Sie können HTML verwenden (z.B. &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a&gt;)
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="outline"
                      disabled={!htmlContent.trim()}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? 'Editor' : 'Vorschau'}
                    </Button>
                    <Button
                      onClick={handleSendNewsletter}
                      disabled={sendMutation.isPending || activeCount === 0}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendMutation.isPending
                        ? 'Wird gesendet...'
                        : `An ${activeCount} Abonnenten senden`}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Vorschau</CardTitle>
                  <CardDescription>
                    So sieht Ihr Newsletter aus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showPreview ? (
                    <div
                      className="border rounded-lg p-4 bg-white min-h-[400px]"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  ) : (
                    <div className="border rounded-lg p-4 bg-muted min-h-[400px] font-mono text-sm whitespace-pre-wrap">
                      {htmlContent || 'Kein Inhalt vorhanden'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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

      {/* Send Confirmation Dialog */}
      <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Newsletter jetzt versenden?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Newsletter wird an <strong>{activeCount} aktive Abonnenten</strong> versendet.
              <br />
              <br />
              <strong>Betreff:</strong> {subject}
              <br />
              <br />
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSend}
              disabled={sendMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {sendMutation.isPending ? 'Wird gesendet...' : 'Jetzt versenden'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
