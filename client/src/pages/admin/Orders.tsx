import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

export default function AdminOrders() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });

  const { data: orders, isLoading, refetch } = trpc.order.list.useQuery(undefined, {
    enabled: !!user && (user.role === 'superadmin' || user.role === 'tenant_admin'),
  });

  const markAsPaid = trpc.order.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Bestellung als bezahlt markiert");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user || (user.role !== 'superadmin' && user.role !== 'tenant_admin')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Bezahlt
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Ausstehend
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Fehlgeschlagen
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="secondary">
            <RefreshCw className="w-3 h-3 mr-1" />
            Erstattet
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const completedOrders = orders?.filter(o => o.status === 'completed') || [];
  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const totalRevenue = completedOrders.length * 2990; // €2.990 per analysis
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bestellungen</h1>
          <p className="text-muted-foreground">Übersicht aller Bestellungen und Zahlungen</p>
        </div>
        
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalRevenue.toLocaleString('de-DE')}</div>
              <p className="text-xs text-muted-foreground">
                {completedOrders.length} abgeschlossene Bestellungen
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders.length}</div>
              <p className="text-xs text-muted-foreground">Bezahlte Analysen</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">Offene Zahlungen</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Bestellungen</CardTitle>
            <CardDescription>
              Liste aller Bestellungen mit Status und Details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">Produkt</th>
                      <th className="text-left py-3 px-4 font-medium">Benutzer</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Datum</th>
                      <th className="text-left py-3 px-4 font-medium">Bezahlt am</th>
                      <th className="text-left py-3 px-4 font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono text-sm">#{order.id}</td>
                        <td className="py-3 px-4">{order.productName}</td>
                        <td className="py-3 px-4">
                          {(order as any).user?.name ||
                           (order as any).user?.email ||
                           `User #${order.userId}`}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {order.paidAt
                            ? format(new Date(order.paidAt), 'dd.MM.yyyy HH:mm', { locale: de })
                            : '-'
                          }
                        </td>
                        <td className="py-3 px-4">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsPaid.mutate({ orderId: order.id })}
                              disabled={markAsPaid.isPending}
                            >
                              {markAsPaid.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Als bezahlt markieren
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Noch keine Bestellungen vorhanden</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
