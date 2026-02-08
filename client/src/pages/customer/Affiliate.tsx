/**
 * Affiliate Dashboard
 * Customer view for affiliate program
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { useUser, SignInButton } from '@clerk/clerk-react';
import {
  Loader2,
  Copy,
  CheckCircle2,
  TrendingUp,
  MousePointer,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function Affiliate() {
  const { user, loading: authLoading } = useAuth();
  const { isSignedIn } = useUser();
  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'paypal'>('bank_transfer');
  const [payoutDetails, setPayoutDetails] = useState('');

  // Get dashboard data (works without login - shows info page)
  const { data: dashboard, isLoading, refetch } = trpc.affiliate.getDashboard.useQuery();

  // Activate affiliate mutation
  const activateMutation = trpc.affiliate.activate.useMutation({
    onSuccess: (data) => {
      if (data.alreadyActive) {
        toast.info('Sie sind bereits als Affiliate registriert');
      } else {
        toast.success('Affiliate-Programm aktiviert!');
      }
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Aktivieren');
    },
  });

  // Update payout mutation
  const updatePayoutMutation = trpc.affiliate.updatePayout.useMutation({
    onSuccess: () => {
      toast.success('Auszahlungsmethode aktualisiert');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Aktualisieren');
    },
  });

  // Request payout mutation
  const requestPayoutMutation = trpc.affiliate.requestPayout.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCopyLink = () => {
    if (!dashboard?.affiliateCode) return;
    const link = `${window.location.origin}?ref=${dashboard.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Link kopiert!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleUpdatePayout = () => {
    if (!payoutDetails.trim()) {
      toast.error('Bitte geben Sie Ihre Auszahlungsdetails ein');
      return;
    }
    updatePayoutMutation.mutate({
      payoutMethod,
      payoutDetails: payoutDetails.trim(),
    });
  };

  const handleRequestPayout = () => {
    requestPayoutMutation.mutate();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not an affiliate yet
  if (!dashboard?.isAffiliate) {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Affiliate Programm</CardTitle>
            <CardDescription className="text-lg">
              Verdienen Sie 5% Provision auf jeden erfolgreichen Abschluss
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-primary/5 rounded-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">€149,50</div>
                <p className="text-sm text-muted-foreground">pro Analyse-Verkauf</p>
                <p className="text-xs text-muted-foreground mt-1">(5% von €2.990)</p>
              </div>
              <div className="p-6 bg-primary/5 rounded-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">€42,50</div>
                <p className="text-sm text-muted-foreground">pro Erstberatung</p>
                <p className="text-xs text-muted-foreground mt-1">(5% von €850)</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Kostenlose Teilnahme</p>
                  <p className="text-sm text-muted-foreground">Keine Gebühren, keine Mindestlaufzeit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Transparente Abrechnung</p>
                  <p className="text-sm text-muted-foreground">
                    Sie sehen alle Klicks, Conversions und Provisionen in Echtzeit
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Auszahlung ab €50</p>
                  <p className="text-sm text-muted-foreground">
                    Per Banküberweisung oder PayPal
                  </p>
                </div>
              </div>
            </div>

            {isSignedIn ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
              >
                {activateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Wird aktiviert...
                  </>
                ) : (
                  'Jetzt Affiliate werden'
                )}
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button size="lg" className="w-full">
                  Anmelden um Affiliate zu werden
                </Button>
              </SignInButton>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affiliate Dashboard
  const referralLink = `${window.location.origin}?ref=${dashboard.affiliateCode}`;
  const canRequestPayout = (dashboard.pendingBalance || 0) >= 50;

  const getCommissionStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'approved':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getCommissionStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Bezahlt';
      case 'approved':
        return 'Genehmigt';
      case 'cancelled':
        return 'Storniert';
      default:
        return 'Ausstehend';
    }
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Empfehlungen und Provisionen</p>
      </div>

      {/* Status Badge */}
      {dashboard.status !== 'active' && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Ihr Affiliate-Status: {dashboard.status}</p>
                <p className="text-sm text-muted-foreground">
                  Bitte kontaktieren Sie den Support für weitere Informationen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Ihr Referral-Link</CardTitle>
          <CardDescription>Teilen Sie diesen Link, um Provisionen zu verdienen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={handleCopyLink} variant="outline">
              {copiedLink ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Code: <span className="font-mono font-semibold">{dashboard.affiliateCode}</span>
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Klicks gesamt</p>
                <p className="text-3xl font-bold">{dashboard.totalClicks}</p>
              </div>
              <MousePointer className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-3xl font-bold">{dashboard.totalConversions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verdienst gesamt</p>
                <p className="text-3xl font-bold">€{dashboard.totalEarned.toFixed(2)}</p>
              </div>
              <Euro className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Provisionen</CardTitle>
          <CardDescription>Ihre neuesten Empfehlungsvergütungen</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard.recentCommissions && dashboard.recentCommissions.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentCommissions.map((commission: any) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getCommissionStatusIcon(commission.status)}
                    <div>
                      <p className="font-medium">
                        {commission.productType === 'analyse' ? 'Analyse' : 'Erstberatung'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(commission.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">€{parseFloat(commission.commissionAmount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCommissionStatusLabel(commission.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Noch keine Provisionen vorhanden</p>
              <p className="text-sm mt-2">Teilen Sie Ihren Referral-Link, um zu starten!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auszahlungsmethode</CardTitle>
          <CardDescription>Legen Sie fest, wie Sie Ihre Provisionen erhalten möchten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Methode wählen</Label>
            <RadioGroup value={payoutMethod} onValueChange={(v: any) => setPayoutMethod(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank" />
                <Label htmlFor="bank" className="cursor-pointer">
                  Banküberweisung (IBAN)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="cursor-pointer">
                  PayPal
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details">
              {payoutMethod === 'bank_transfer' ? 'IBAN' : 'PayPal E-Mail'}
            </Label>
            <Input
              id="details"
              value={payoutDetails}
              onChange={(e) => setPayoutDetails(e.target.value)}
              placeholder={
                payoutMethod === 'bank_transfer' ? 'DE89 3704 0044 0532 0130 00' : 'ihre@email.com'
              }
            />
            {dashboard.payoutDetails && (
              <p className="text-xs text-muted-foreground mt-1">
                Aktuell hinterlegt: {dashboard.payoutDetails.substring(0, 10)}...
              </p>
            )}
          </div>

          <Button onClick={handleUpdatePayout} disabled={updatePayoutMutation.isPending}>
            {updatePayoutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              'Speichern'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Request Payout */}
      <Card>
        <CardHeader>
          <CardTitle>Auszahlung anfordern</CardTitle>
          <CardDescription>Mindestbetrag: €50,00</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Verfügbares Guthaben</p>
              <p className="text-3xl font-bold text-primary">
                €{dashboard.pendingBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleRequestPayout}
            disabled={!canRequestPayout || requestPayoutMutation.isPending || !dashboard.payoutDetails}
            className="w-full"
            size="lg"
          >
            {requestPayoutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Wird angefordert...
              </>
            ) : !dashboard.payoutDetails ? (
              'Bitte erst Auszahlungsmethode hinterlegen'
            ) : !canRequestPayout ? (
              'Mindestbetrag noch nicht erreicht (€50)'
            ) : (
              'Auszahlung anfordern'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Auszahlungen werden innerhalb von 7 Werktagen bearbeitet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
