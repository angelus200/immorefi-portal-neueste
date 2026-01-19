import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, CheckCircle2, XCircle, Clock, RefreshCw, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "wouter";

export default function Orders() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  
  const { data: orders, isLoading } = trpc.order.myOrders.useQuery(undefined, {
    enabled: !!user,
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
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meine Bestellungen</h1>
            <p className="text-muted-foreground">Übersicht Ihrer gekauften Produkte</p>
          </div>
          {orders && orders.length > 0 && (
            <Link href="/shop">
              <Button>
                Zum Shop
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
        
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.productName}</CardTitle>
                      <CardDescription>
                        Bestellung #{order.id} • {format(new Date(order.createdAt), 'dd. MMMM yyyy', { locale: de })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">€2.990</div>
                      <div className="text-sm text-muted-foreground">
                        {order.paidAt 
                          ? `Bezahlt am ${format(new Date(order.paidAt), 'dd.MM.yyyy HH:mm', { locale: de })}`
                          : 'Zahlung ausstehend'
                        }
                      </div>
                    </div>
                    {order.status === 'completed' && (
                      <Link href="/onboarding">
                        <Button variant="outline">
                          Onboarding starten
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Noch keine Bestellungen</h3>
                <p className="text-muted-foreground mb-4">
                  Sie haben noch keine Produkte gekauft.
                </p>
                <Link href="/shop">
                  <Button>
                    Zum Shop
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
