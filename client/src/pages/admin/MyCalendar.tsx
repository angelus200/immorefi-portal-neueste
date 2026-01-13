import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, Save, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

function MyCalendarContent() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: myCalendar, isLoading } = trpc.staffCalendar.getMyCalendar.useQuery();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (myCalendar) {
      setName(myCalendar.name || '');
      setDescription(myCalendar.description || '');
      setCalendlyUrl(myCalendar.calendlyUrl || '');
      setAvatarUrl(myCalendar.avatarUrl || '');
      setIsActive(myCalendar.isActive);
    } else if (user) {
      // Set default name from user
      setName(`${user.name || 'Unbekannt'} - Erstberatung`);
    }
  }, [myCalendar, user]);

  const upsertMutation = trpc.staffCalendar.upsert.useMutation({
    onSuccess: () => {
      toast.success('Kalender erfolgreich gespeichert');
      utils.staffCalendar.getMyCalendar.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    upsertMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      calendlyUrl: calendlyUrl.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      isActive,
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Bitte melden Sie sich an</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mein Kalender</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihren Calendly-Buchungslink und Ihre Verfügbarkeit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Kalendereinstellungen</CardTitle>
            <CardDescription>
              Konfigurieren Sie Ihren Calendly-Link, damit Kunden Termine mit Ihnen buchen können
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Thomas Gross - Erstberatung"
                required
              />
              <p className="text-sm text-muted-foreground">
                Dieser Name wird Kunden bei der Terminauswahl angezeigt
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. 30 Minuten Erstgespräch zur Immobilien-Refinanzierung"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Eine kurze Beschreibung des Termins
              </p>
            </div>

            {/* Calendly URL */}
            <div className="space-y-2">
              <Label htmlFor="calendlyUrl">Calendly Buchungslink</Label>
              <Input
                id="calendlyUrl"
                type="url"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/ihr-name/termin"
              />
              <p className="text-sm text-muted-foreground">
                Ihr persönlicher Calendly-Buchungslink (z.B. https://calendly.com/ihr-name/30min)
              </p>
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Profilbild URL (optional)</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/profilbild.jpg"
              />
              <p className="text-sm text-muted-foreground">
                URL zu Ihrem Profilbild (wird auf der Buchungsseite angezeigt)
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base">
                  Kalender aktivieren
                </Label>
                <p className="text-sm text-muted-foreground">
                  Wenn deaktiviert, können keine neuen Termine gebucht werden
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {calendlyUrl && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vorschau
              </CardTitle>
              <CardDescription>
                So wird Ihr Kalender auf der Buchungsseite angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-white p-4 border">
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-16 w-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{name || 'Ihr Name'}</h3>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                    {!isActive && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          <EyeOff className="h-3 w-3" />
                          Nicht verfügbar
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={upsertMutation.isPending || !name.trim()}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {upsertMutation.isPending ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </form>

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 So funktioniert's</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Erstellen Sie einen Event-Typ in Ihrem Calendly-Account (z.B. "30 Min Meeting")
            </li>
            <li>Kopieren Sie den Buchungslink aus Calendly (z.B. calendly.com/ihr-name/30min)</li>
            <li>Fügen Sie den Link oben ein und speichern Sie</li>
            <li>
              Kunden können nun über die Buchungsseite Termine mit Ihnen vereinbaren
            </li>
            <li>
              Buchungen werden automatisch in Ihrem Calendly und im Portal synchronisiert
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MyCalendar() {
  return (
    <DashboardLayout>
      <MyCalendarContent />
    </DashboardLayout>
  );
}
