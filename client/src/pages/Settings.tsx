import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Loader2,
  Save
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Query user data with preferences
  const { data: userData } = trpc.auth.me.useQuery();

  // Mutation to save preferences
  const updatePreferences = trpc.user.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Einstellungen gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern der Einstellungen");
    },
  });

  // Load preferences from user data when available
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmailNotifications(userData.emailNotifications ?? true);
      setMarketingEmails(userData.marketingEmails ?? false);
    }
  }, [userData]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Bitte melden Sie sich an.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = () => {
    updatePreferences.mutate({
      name,
      emailNotifications,
      marketingEmails,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kontoeinstellungen und Präferenzen
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profil</CardTitle>
            </div>
            <CardDescription>
              Ihre persönlichen Informationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ihr Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue={user.email || ""} 
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Die E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Benachrichtigungen</CardTitle>
            </div>
            <CardDescription>
              Verwalten Sie Ihre Benachrichtigungseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-Mail-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie Updates zu Ihren Projekten per E-Mail
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing-E-Mails</Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie Informationen zu neuen Produkten und Angeboten
                </p>
              </div>
              <Switch
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Sicherheit</CardTitle>
            </div>
            <CardDescription>
              Verwalten Sie Ihre Sicherheitseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Anmeldung</Label>
                <p className="text-sm text-muted-foreground">
                  Sie sind über Manus OAuth angemeldet
                </p>
              </div>
              <Button variant="outline" disabled>
                Verbunden
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Letzte Anmeldung</Label>
                <p className="text-sm text-muted-foreground">
                  {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString("de-DE") : "Unbekannt"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Sprache & Region</CardTitle>
            </div>
            <CardDescription>
              Sprach- und Regionseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sprache</Label>
                <p className="text-sm text-muted-foreground">
                  Deutsch (Deutschland)
                </p>
              </div>
              <Button variant="outline" disabled>
                Ändern
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updatePreferences.isPending}>
            {updatePreferences.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Einstellungen speichern
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
