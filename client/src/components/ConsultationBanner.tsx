import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { getAffiliateCode } from '@/hooks/useAffiliateTracking';

/**
 * ConsultationBanner Component
 *
 * Compact banner promoting personal consultation service
 * - Displays price, key benefits, and booking CTA
 * - Responsive: horizontal on desktop, stacked on mobile
 */
export function ConsultationBanner() {
  const { user } = useAuth();

  const createCheckout = trpc.order.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Sie werden zur Zahlungsseite weitergeleitet...");
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen der Checkout-Session");
    },
  });

  const handleBooking = () => {
    if (!user) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/#kontakt')}`;
      return;
    }
    const affiliateCode = getAffiliateCode();
    createCheckout.mutate({
      productId: 'ERSTBERATUNG',
      affiliateCode: affiliateCode || undefined,
    });
  };

  return (
    <section className="py-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-y border-cyan-200 dark:border-cyan-800">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Price & Duration */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Persönliche Erstberatung –{' '}
              <span className="font-bold text-primary text-base">€ 850</span>{' '}
              <span className="text-gray-600 dark:text-gray-400">zzgl. MwSt.</span>{' '}
              <span className="text-gray-500 dark:text-gray-500">| 60 Minuten</span>
            </p>
          </div>

          {/* Center: Benefits */}
          <div className="flex items-center gap-4 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>1:1 Gespräch</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Finanzierungsanalyse</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Sofort buchbar</span>
            </div>
          </div>

          {/* Right: CTA Button */}
          <Button
            onClick={handleBooking}
            disabled={createCheckout.isPending}
            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
          >
            {createCheckout.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lädt...
              </>
            ) : (
              <>
                Erstberatung buchen
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
