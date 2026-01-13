import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect } from "react";

function BookingContent() {
  const { user } = useAuth();
  const { data: staffCalendars = [], isLoading: calendarsLoading } = trpc.staffCalendar.list.useQuery();
  const { data: myBookings = [], isLoading: bookingsLoading } = trpc.booking.myBookings.useQuery();

  // Load Calendly widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatDateTime = (date: Date | string) => {
    return new Intl.DateTimeFormat('de-CH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'pending':
        return 'Ausstehend';
      case 'cancelled':
        return 'Abgesagt';
      case 'completed':
        return 'Abgeschlossen';
      case 'no_show':
        return 'Nicht erschienen';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Bitte melden Sie sich an</h2>
          <p className="text-gray-600 mb-6">Sie müssen angemeldet sein, um Termine zu buchen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Termin buchen</h1>
        <p className="text-muted-foreground mt-2">
          Buchen Sie einen Termin mit einem unserer Berater
        </p>
      </div>

      {/* Upcoming Bookings */}
      {myBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Meine Termine</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {myBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{booking.title}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(booking.startTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {booking.description && (
                    <p className="text-sm text-gray-600">{booking.description}</p>
                  )}
                  {booking.meetingUrl && booking.status === 'confirmed' && (
                    <div className="pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(booking.meetingUrl!, '_blank')}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Zum Online-Meeting
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Consultants */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Verfügbare Berater</h2>

        {calendarsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground mt-4">Laden...</p>
          </div>
        ) : staffCalendars.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Berater verfügbar</h3>
              <p className="text-muted-foreground">
                Derzeit sind keine Berater für Terminbuchungen verfügbar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {staffCalendars.map((calendar) => (
              <Card key={calendar.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex items-start gap-4">
                    {calendar.avatarUrl ? (
                      <img
                        src={calendar.avatarUrl}
                        alt={calendar.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-xl">{calendar.name}</CardTitle>
                      {calendar.description && (
                        <CardDescription className="mt-2 text-base">
                          {calendar.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {calendar.calendlyUrl ? (
                    <div
                      className="calendly-inline-widget"
                      data-url={calendar.calendlyUrl}
                      style={{ minWidth: '320px', height: '700px' }}
                    />
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Calendly-Link nicht verfügbar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Booking() {
  return (
    <DashboardLayout>
      <BookingContent />
    </DashboardLayout>
  );
}
