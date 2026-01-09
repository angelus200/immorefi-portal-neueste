import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";
import { Settings as SettingsIcon, Building2, Palette, FileText, Bell } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

function SettingsContent() {
  const [tenantSettings, setTenantSettings] = useState({
    name: "Non-Dom Group",
    logoUrl: "",
    primaryColor: "#00B4D8",
    secondaryColor: "#FF6B6B",
    legalImprint: "",
    legalPrivacy: "",
  });

  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    emailDealUpdate: true,
    emailTaskDue: false,
  });

  const handleSaveGeneral = () => {
    toast.success("Einstellungen gespeichert");
  };

  const handleSaveBranding = () => {
    toast.success("Branding aktualisiert");
  };

  const handleSaveLegal = () => {
    toast.success("Rechtliche Informationen gespeichert");
  };

  const handleSaveNotifications = () => {
    toast.success("Benachrichtigungseinstellungen gespeichert");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Tenant-Einstellungen</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2">
            <FileText className="h-4 w-4" />
            Rechtliches
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Einstellungen</CardTitle>
              <CardDescription>
                Grundlegende Informationen zu Ihrem Tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Unternehmensname</Label>
                <Input
                  id="name"
                  value={tenantSettings.name}
                  onChange={(e) => setTenantSettings({ ...tenantSettings, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={tenantSettings.logoUrl}
                  onChange={(e) => setTenantSettings({ ...tenantSettings, logoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Empfohlene Größe: 200x50 Pixel, PNG oder SVG
                </p>
              </div>

              <Button onClick={handleSaveGeneral}>
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Passen Sie das Erscheinungsbild Ihres Portals an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primärfarbe</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={tenantSettings.primaryColor}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={tenantSettings.primaryColor}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={tenantSettings.secondaryColor}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={tenantSettings.secondaryColor}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-3">Vorschau</p>
                <div className="flex gap-4">
                  <div 
                    className="h-12 w-24 rounded flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: tenantSettings.primaryColor }}
                  >
                    Primär
                  </div>
                  <div 
                    className="h-12 w-24 rounded flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: tenantSettings.secondaryColor }}
                  >
                    Sekundär
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveBranding}>
                Branding speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Settings */}
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Rechtliche Informationen</CardTitle>
              <CardDescription>
                Impressum und Datenschutzerklärung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="imprint">Impressum</Label>
                <Textarea
                  id="imprint"
                  rows={6}
                  placeholder="Ihr Impressum hier eingeben..."
                  value={tenantSettings.legalImprint}
                  onChange={(e) => setTenantSettings({ ...tenantSettings, legalImprint: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacy">Datenschutzerklärung</Label>
                <Textarea
                  id="privacy"
                  rows={6}
                  placeholder="Ihre Datenschutzerklärung hier eingeben..."
                  value={tenantSettings.legalPrivacy}
                  onChange={(e) => setTenantSettings({ ...tenantSettings, legalPrivacy: e.target.value })}
                />
              </div>

              <Button onClick={handleSaveLegal}>
                Rechtliches speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie, wann Sie benachrichtigt werden möchten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Neuer Lead</Label>
                    <p className="text-sm text-muted-foreground">
                      E-Mail bei neuen Lead-Anfragen erhalten
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNewLead}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewLead: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deal-Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      E-Mail bei Änderungen an Deals erhalten
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailDealUpdate}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailDealUpdate: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fällige Aufgaben</Label>
                    <p className="text-sm text-muted-foreground">
                      E-Mail-Erinnerung bei fälligen Aufgaben
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailTaskDue}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailTaskDue: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>
                Benachrichtigungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  );
}
