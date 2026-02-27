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
    <section className="py-6 bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Price & Duration */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
              {/* "Jetzt verfügbar" Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                Jetzt verfügbar
              </span>
              <p className="text-sm text-white">
                Persönliche Erstberatung –{' '}
                <span className="font-bold text-2xl underline decoration-2 underline-offset-4">€ 850</span>{' '}
                <span className="text-white/90">zzgl. MwSt.</span>{' '}
                <span className="text-white/80">| 60 Minuten</span>
              </p>
            </div>
          </div>

          {/* Center: Benefits */}
          <div className="flex items-center gap-4 text-xs text-white">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>1:1 Gespräch</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>Finanzierungsanalyse</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>Sofort buchbar</span>
            </div>
          </div>

          {/* Right: CTA Button */}
          <Button
            onClick={handleBooking}
            disabled={createCheckout.isPending}
            className="bg-white text-cyan-600 hover:bg-cyan-50 whitespace-nowrap font-semibold shadow-md"
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
