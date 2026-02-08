/**
 * Admin Affiliates Management
 * Admin view for managing all affiliates
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Loader2,
  Users,
  TrendingUp,
  Euro,
  CheckCircle2,
  XCircle,
  Pause,
  Ban,
  Play,
} from 'lucide-react';

export default function Affiliates() {
  const [statusFilter, setStatusFilter] = useState<'active' | 'paused' | 'banned' | undefined>(
    undefined
  );
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'paused' | 'banned'>('active');

  // Get affiliates list
  const { data, isLoading, refetch } = trpc.affiliate.adminList.useQuery({
    status: statusFilter,
    limit: 100,
  });

  // Approve payout mutation
  const approvePayoutMutation = trpc.affiliate.adminApprovePayout.useMutation({
    onSuccess: () => {
      toast.success('Auszahlung genehmigt');
      setShowPayoutDialog(false);
      setPayoutAmount('');
      setSelectedAffiliate(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Genehmigen');
    },
  });

  // Update status mutation
  const updateStatusMutation = trpc.affiliate.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status aktualisiert');
      setShowStatusDialog(false);
      setSelectedAffiliate(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Aktualisieren');
    },
  });

  const handleApprovePayout = () => {
    if (!selectedAffiliate || !payoutAmount) return;
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Bitte geben Sie einen gültigen Betrag ein');
      return;
    }
    approvePayoutMutation.mutate({
      affiliateId: selectedAffiliate.id,
      amount,
    });
  };

  const handleUpdateStatus = () => {
    if (!selectedAffiliate) return;
    updateStatusMutation.mutate({
      affiliateId: selectedAffiliate.id,
      status: newStatus,
    });
  };

  const openPayoutDialog = (affiliate: any) => {
    setSelectedAffiliate(affiliate);
    const pendingBalance =
      parseFloat(affiliate.totalEarned) - parseFloat(affiliate.totalPaid);
    setPayoutAmount(pendingBalance.toFixed(2));
    setShowPayoutDialog(true);
  };

  const openStatusDialog = (affiliate: any) => {
    setSelectedAffiliate(affiliate);
    setNewStatus(affiliate.status);
    setShowStatusDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'banned':
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'paused':
        return 'Pausiert';
      case 'banned':
        return 'Gesperrt';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const affiliates = data?.affiliates || [];

  // Calculate totals
  const totalAffiliates = affiliates.length;
  const totalClicks = affiliates.reduce((sum, a) => sum + (a.totalClicks || 0), 0);
  const totalConversions = affiliates.reduce((sum, a) => sum + (a.totalConversions || 0), 0);
  const totalEarnings = affiliates.reduce(
    (sum, a) => sum + parseFloat(a.totalEarned || '0'),
    0
  );
  const totalPaid = affiliates.reduce((sum, a) => sum + parseFloat(a.totalPaid || '0'), 0);
  const totalPending = totalEarnings - totalPaid;

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Affiliate Management</h1>
        <p className="text-muted-foreground">Verwalten Sie alle Affiliates und Auszahlungen</p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Affiliates</p>
                <p className="text-3xl font-bold">{totalAffiliates}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-3xl font-bold">{totalConversions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Provisionen gesamt</p>
                <p className="text-3xl font-bold">€{totalEarnings.toFixed(2)}</p>
              </div>
              <Euro className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offene Auszahlungen</p>
                <p className="text-3xl font-bold text-orange-600">€{totalPending.toFixed(2)}</p>
              </div>
              <Euro className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Status</Label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(v) => setStatusFilter(v === 'all' ? undefined : (v as any))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="paused">Pausiert</SelectItem>
                  <SelectItem value="banned">Gesperrt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliates</CardTitle>
          <CardDescription>{totalAffiliates} Affiliates gefunden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {affiliates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Affiliates gefunden</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Code</th>
                      <th className="text-left py-3 px-4 font-medium">User ID</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Klicks</th>
                      <th className="text-right py-3 px-4 font-medium">Conversions</th>
                      <th className="text-right py-3 px-4 font-medium">Verdienst</th>
                      <th className="text-right py-3 px-4 font-medium">Ausgezahlt</th>
                      <th className="text-right py-3 px-4 font-medium">Offen</th>
                      <th className="text-right py-3 px-4 font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((affiliate) => {
                      const pending =
                        parseFloat(affiliate.totalEarned) - parseFloat(affiliate.totalPaid);
                      return (
                        <tr key={affiliate.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{affiliate.affiliateCode}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {affiliate.clerkUserId.substring(0, 12)}...
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(affiliate.status)}
                              <span className="text-sm">{getStatusLabel(affiliate.status)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">{affiliate.totalClicks || 0}</td>
                          <td className="py-3 px-4 text-right">{affiliate.totalConversions || 0}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            €{parseFloat(affiliate.totalEarned).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">
                            €{parseFloat(affiliate.totalPaid).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-orange-600">
                            €{pending.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPayoutDialog(affiliate)}
                                disabled={pending < 50}
                              >
                                Auszahlen
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStatusDialog(affiliate)}
                              >
                                Status
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auszahlung genehmigen</DialogTitle>
            <DialogDescription>
              Affiliate: <span className="font-mono">{selectedAffiliate?.affiliateCode}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Auszahlungsbetrag (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            {selectedAffiliate?.payoutMethod && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Auszahlungsmethode</p>
                <p className="font-medium">
                  {selectedAffiliate.payoutMethod === 'bank_transfer'
                    ? 'Banküberweisung'
                    : 'PayPal'}
                </p>
                {selectedAffiliate.payoutDetails && (
                  <p className="text-sm mt-1">{selectedAffiliate.payoutDetails}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleApprovePayout} disabled={approvePayoutMutation.isPending}>
              {approvePayoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird genehmigt...
                </>
              ) : (
                'Auszahlung genehmigen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status ändern</DialogTitle>
            <DialogDescription>
              Affiliate: <span className="font-mono">{selectedAffiliate?.affiliateCode}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Neuer Status</Label>
            <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Aktiv
                  </div>
                </SelectItem>
                <SelectItem value="paused">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Pausiert
                  </div>
                </SelectItem>
                <SelectItem value="banned">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    Gesperrt
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird aktualisiert...
                </>
              ) : (
                'Status ändern'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
