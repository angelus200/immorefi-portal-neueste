import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, Users, Calculator, FileText, CheckSquare, Settings, Shield, BarChart3, Receipt, ClipboardList } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

const anwenderKapitel: Chapter[] = [
  {
    id: "einfuehrung",
    title: "1. Einführung",
    icon: <BookOpen className="w-4 h-4" />,
    content: `
## 1.1 Was ist das ImmoRefi Portal?

Das ImmoRefi Portal ist eine umfassende Plattform für Immobilien-Refinanzierung. Es ermöglicht Ihnen:

- **Finanzierungsberechnungen durchzuführen** - Berechnen Sie verschiedene Refinanzierungsszenarien
- **Dokumente sicher zu verwalten** - Laden Sie alle relevanten Unterlagen hoch
- **Verträge digital zu unterzeichnen** - Unterschreiben Sie Verträge bequem online
- **Mit Ihrem Berater zu kommunizieren** - Direkter Kontakt über das Portal
- **Den Status Ihrer Anträge zu verfolgen** - Immer auf dem neuesten Stand

## 1.2 Systemanforderungen

| Komponente | Anforderung |
|------------|-------------|
| **Browser** | Chrome, Firefox, Safari, Edge (aktuelle Version) |
| **Internet** | Stabile Breitbandverbindung |
| **Bildschirm** | Mindestens 1280 x 720 Pixel |
| **Mobil** | iOS 14+ / Android 10+ für mobile Nutzung |

## 1.3 Datensicherheit

Ihre Daten werden verschlüsselt übertragen und gespeichert. Das Portal entspricht den aktuellen Datenschutzrichtlinien (DSGVO).
    `
  },
  {
    id: "erste-schritte",
    title: "2. Erste Schritte",
    icon: <Users className="w-4 h-4" />,
    content: `
## 2.1 Registrierung

So erstellen Sie Ihr Konto:

1. Öffnen Sie **portal.immoportal.app** in Ihrem Browser
2. Klicken Sie auf **"Registrieren"**
3. Geben Sie Ihre **E-Mail-Adresse** ein
4. Erstellen Sie ein **sicheres Passwort** (mindestens 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen)
5. **Bestätigen Sie Ihre E-Mail** über den zugesandten Link
6. **Vervollständigen Sie Ihr Profil** mit Ihren persönlichen Daten

## 2.2 Anmeldung

Nach der Registrierung können Sie sich jederzeit anmelden:

1. Gehen Sie zu **portal.immoportal.app**
2. Geben Sie Ihre **E-Mail** und **Passwort** ein
3. Klicken Sie auf **"Anmelden"**

> **Tipp:** Aktivieren Sie "Angemeldet bleiben" für schnelleren Zugang auf Ihrem persönlichen Gerät.

## 2.3 Passwort vergessen

Falls Sie Ihr Passwort vergessen haben:

1. Klicken Sie auf **"Passwort vergessen?"**
2. Geben Sie Ihre **E-Mail-Adresse** ein
3. Prüfen Sie Ihr **Postfach** (auch den Spam-Ordner!)
4. Klicken Sie den **Link** in der E-Mail
5. Setzen Sie ein **neues Passwort**

Das neue Passwort ist sofort aktiv.
    `
  },
  {
    id: "dashboard",
    title: "3. Dashboard",
    icon: <BarChart3 className="w-4 h-4" />,
    content: `
## 3.1 Übersicht

Das Dashboard ist Ihre zentrale Anlaufstelle nach dem Login. Hier sehen Sie auf einen Blick:

- **Aktuelle Finanzierungsanfragen** und deren Status
- **Offene Aufgaben** und Fristen
- **Nachrichten** von Ihrem Berater
- **Wichtige Kennzahlen** Ihrer Immobilien

## 3.2 Navigation

Die Hauptnavigation befindet sich auf der linken Seite:

| Menüpunkt | Funktion |
|-----------|----------|
| **Dashboard** | Übersicht und Schnellzugriff |
| **Finanzrechner** | Berechnungstools für Refinanzierung |
| **Dokumente** | Ihre hochgeladenen Unterlagen |
| **Verträge** | Aktive und abgeschlossene Verträge |
| **Aufgaben** | To-Dos und Fristen |
| **Einstellungen** | Profil und Benachrichtigungen |

## 3.3 Schnellaktionen

Auf dem Dashboard finden Sie Schnellaktionen für häufige Aufgaben:

- **Neue Berechnung starten**
- **Dokument hochladen**
- **Nachricht senden**
- **Termin vereinbaren**
    `
  },
  {
    id: "finanzrechner",
    title: "4. Finanzrechner",
    icon: <Calculator className="w-4 h-4" />,
    content: `
## 4.1 Refinanzierungsrechner

Mit dem Refinanzierungsrechner können Sie verschiedene Szenarien durchspielen:

1. Geben Sie den **aktuellen Immobilienwert** ein
2. Tragen Sie die **bestehende Restschuld** ein
3. Wählen Sie die **gewünschte Laufzeit** (5-30 Jahre)
4. Vergleichen Sie **verschiedene Zinssätze**
5. Sehen Sie die **monatliche Rate** und **Gesamtkosten**

## 4.2 Tilgungsplan

Der Tilgungsplan zeigt Ihnen detailliert:

- **Monatliche Zins- und Tilgungsanteile** - Wie viel geht in Zinsen, wie viel in die Tilgung?
- **Restschuld nach jedem Jahr** - Wie entwickelt sich Ihre Schuld?
- **Gesamtzinsen über die Laufzeit** - Was kostet Sie das Darlehen insgesamt?
- **Optionale Sondertilgungen** - Wie wirken sich Extra-Zahlungen aus?

## 4.3 Ergebnisse speichern

Sie können Ihre Berechnungen speichern und später wieder aufrufen:

1. Führen Sie eine Berechnung durch
2. Klicken Sie auf **"Berechnung speichern"**
3. Vergeben Sie einen **aussagekräftigen Namen**
4. Finden Sie gespeicherte Berechnungen unter **"Meine Berechnungen"**

## 4.4 Vergleichsansicht

Vergleichen Sie bis zu 3 Szenarien nebeneinander:

1. Speichern Sie mehrere Berechnungen
2. Wählen Sie **"Vergleichen"**
3. Wählen Sie die zu vergleichenden Szenarien
4. Sehen Sie alle wichtigen Kennzahlen im direkten Vergleich
    `
  },
  {
    id: "dokumente",
    title: "5. Dokumente & Verträge",
    icon: <FileText className="w-4 h-4" />,
    content: `
## 5.1 Dokumente hochladen

So laden Sie Dokumente hoch:

1. Gehen Sie zu **"Dokumente"**
2. Klicken Sie auf **"Dokument hochladen"**
3. Wählen Sie die **Datei** von Ihrem Computer (Drag & Drop möglich)
4. Wählen Sie die **Dokumentenkategorie**
5. Bestätigen Sie den **Upload**

**Unterstützte Formate:** PDF, JPG, PNG
**Maximale Dateigröße:** 10 MB pro Datei

## 5.2 Dokumentenkategorien

| Kategorie | Beispiele |
|-----------|-----------|
| **Einkommensnachweise** | Gehaltsabrechnungen (letzte 3 Monate), Steuerbescheide, Rentenbescheid |
| **Immobilienunterlagen** | Grundbuchauszug, Kaufvertrag, Exposé, Flurkarte, Energieausweis |
| **Finanzierungsunterlagen** | Bestehende Darlehensverträge, Kontoauszüge, Schufa-Auskunft |
| **Persönliche Dokumente** | Personalausweis (Vorder- & Rückseite), Meldebestätigung, Heiratsurkunde |

## 5.3 Verträge einsehen

Im Bereich "Verträge" finden Sie alle Ihre Vereinbarungen:

- **Aktive Verträge** - Laufende Finanzierungen
- **Entwürfe** - Noch nicht unterschriebene Verträge
- **Abgeschlossene Verträge** - Archivierte Vereinbarungen

## 5.4 Digitale Unterschrift

So unterschreiben Sie einen Vertrag digital:

1. Öffnen Sie den **Vertrag**
2. Lesen Sie alle Seiten **sorgfältig durch**
3. Klicken Sie auf **"Jetzt unterschreiben"**
4. Bestätigen Sie mit Ihrem **Passwort** oder **SMS-Code**
5. Der unterschriebene Vertrag wird automatisch **gespeichert**
    `
  },
  {
    id: "aufgaben",
    title: "6. Aufgaben",
    icon: <CheckSquare className="w-4 h-4" />,
    content: `
## 6.1 Aufgabenübersicht

Hier sehen Sie alle offenen Aufgaben, die für Ihre Finanzierung erledigt werden müssen:

- **Fehlende Dokumente einreichen** - Welche Unterlagen werden noch benötigt?
- **Informationen vervollständigen** - Welche Angaben fehlen?
- **Verträge prüfen und unterschreiben** - Was wartet auf Ihre Unterschrift?
- **Termine bestätigen** - Welche Termine stehen an?

## 6.2 Aufgaben erledigen

So erledigen Sie eine Aufgabe:

1. Klicken Sie auf die **Aufgabe** in der Liste
2. Lesen Sie die **Details** und Anweisungen
3. Führen Sie die **geforderte Aktion** aus
4. Markieren Sie die Aufgabe als **"Erledigt"**

## 6.3 Fristen

Achten Sie auf die angezeigten Fristen:

- **Grün** = Noch ausreichend Zeit (> 7 Tage)
- **Gelb** = Bald fällig (3-7 Tage)
- **Rot** = Dringend oder überfällig (< 3 Tage)

> **Wichtig:** Überfällige Aufgaben können den Bearbeitungsprozess verzögern. Bei Fragen wenden Sie sich an Ihren Berater.

## 6.4 Benachrichtigungen

Sie werden automatisch benachrichtigt:

- **E-Mail** bei neuen Aufgaben
- **E-Mail** 3 Tage vor Fristablauf
- **E-Mail** wenn eine Aufgabe überfällig wird

Benachrichtigungseinstellungen können Sie unter **Einstellungen > Benachrichtigungen** anpassen.
    `
  }
];

const adminKapitel: Chapter[] = [
  {
    id: "admin-uebersicht",
    title: "7. Admin-Bereich",
    icon: <Shield className="w-4 h-4" />,
    content: `
## 7.1 Zugang zum Admin-Bereich

Als Administrator haben Sie Zugriff auf erweiterte Funktionen. Nach dem Login sehen Sie in der Navigation zusätzliche Menüpunkte:

- **Benutzerverwaltung** - Alle User verwalten
- **CRM** - Leads & Deals
- **Bestellungen** - Aufträge verwalten
- **Rechnungen** - Rechnungen erstellen und verwalten
- **Systemeinstellungen** - Konfiguration
- **Audit-Log** - Alle Aktivitäten

## 7.2 Benutzerrollen

Das System kennt 4 Rollen mit unterschiedlichen Berechtigungen:

| Rolle | Berechtigungen |
|-------|----------------|
| **superadmin** | Vollzugriff auf ALLE Funktionen, Systemkonfiguration, User zu Admins machen |
| **tenant_admin** | Verwaltung eines Mandanten, Benutzer anlegen und bearbeiten |
| **staff** | Bearbeitung von Leads, Deals, Dokumenten, keine Systemeinstellungen |
| **client** | Standardbenutzer, kann nur eigene Daten einsehen und bearbeiten |

## 7.3 Aktuelle Superadmins

| Name | E-Mail |
|------|--------|
| Thomas Gross | grossdigitalpartner@gmail.com |
| Charlotte Herr | c.herr@angelus.group |
| Brigitte Brendel | b.brendel@angelus.group |
    `
  },
  {
    id: "benutzerverwaltung",
    title: "8. Benutzerverwaltung",
    icon: <Users className="w-4 h-4" />,
    content: `
## 8.1 Benutzer anzeigen

In der Benutzerverwaltung sehen Sie alle registrierten Benutzer mit:

- **Name und E-Mail** - Identifikation
- **Rolle** - superadmin, tenant_admin, staff, client
- **Status** - Aktiv, Inaktiv, Gesperrt
- **Letzter Login** - Wann war der User zuletzt aktiv?
- **Registrierungsdatum** - Wann wurde das Konto erstellt?

## 8.2 Benutzer bearbeiten

So ändern Sie Benutzereinstellungen:

1. Klicken Sie auf den **Benutzer** in der Liste
2. Wählen Sie **"Bearbeiten"**
3. Ändern Sie die gewünschten Felder (Name, E-Mail, Rolle)
4. Klicken Sie auf **"Speichern"**

## 8.3 Benutzer zum Superadmin machen

**Methode 1: Via Claude Code (empfohlen)**

Öffnen Sie das Terminal und führen Sie aus:

\`\`\`bash
cd ~/Downloads/immorefi-portal

DATABASE_URL="mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway" npx tsx scripts/set-admin.ts email@example.com
\`\`\`

Ersetzen Sie \`email@example.com\` mit der E-Mail des Users.

**Methode 2: Via Railway MySQL**

1. Öffnen Sie Railway Dashboard
2. Gehen Sie zur MySQL Datenbank
3. Führen Sie dieses SQL aus:

\`\`\`sql
UPDATE users
SET role = 'superadmin', onboardingCompleted = 1
WHERE email = 'email@example.com';
\`\`\`

## 8.4 Benutzer deaktivieren

Um einen Benutzer zu deaktivieren (ohne zu löschen):

1. Öffnen Sie den Benutzer
2. Setzen Sie Status auf **"Inaktiv"**
3. Der User kann sich nicht mehr einloggen
4. Alle Daten bleiben erhalten
    `
  },
  {
    id: "crm",
    title: "9. CRM & Leads",
    icon: <BarChart3 className="w-4 h-4" />,
    content: `
## 9.1 Lead-Management

Im CRM verwalten Sie alle Interessenten und deren Anfragen:

- **Neue Leads erfassen** - Manuell oder automatisch via Webformular
- **Status aktualisieren** - Den Fortschritt dokumentieren
- **Notizen hinzufügen** - Wichtige Informationen festhalten
- **Aktivitäten protokollieren** - Anrufe, E-Mails, Meetings
- **Leads zu Deals konvertieren** - Bei ernsthaftem Interesse

## 9.2 Lead-Status

| Status | Bedeutung |
|--------|-----------|
| **Neu** | Gerade eingegangen, noch nicht kontaktiert |
| **Kontaktiert** | Erste Kontaktaufnahme erfolgt |
| **Qualifiziert** | Interesse und Bonität geprüft |
| **Angebot** | Finanzierungsangebot unterbreitet |
| **Verhandlung** | In aktiver Verhandlung |
| **Gewonnen** | Abschluss erfolgt |
| **Verloren** | Kein Abschluss |

## 9.3 Deal-Pipeline

Die Deal-Pipeline zeigt alle aktiven Finanzierungsanfragen:

**Phase 1: Anfrage**
- Erste Kontaktaufnahme
- Bedarfsermittlung
- Grobe Einschätzung

**Phase 2: Prüfung**
- Unterlagen werden geprüft
- Bonität wird bewertet
- Immobilie wird bewertet

**Phase 3: Angebot**
- Finanzierungsangebot wird erstellt
- Konditionen werden kalkuliert
- Angebot wird präsentiert

**Phase 4: Verhandlung**
- Konditionen werden besprochen
- Anpassungen werden vorgenommen
- Einigung wird erzielt

**Phase 5: Abschluss**
- Vertrag wird erstellt
- Unterschriften werden eingeholt
- Auszahlung wird vorbereitet

## 9.4 Berichte

Generieren Sie Berichte über:

- **Lead-Quellen** - Woher kommen die Anfragen?
- **Conversion-Rate** - Wie viele Leads werden zu Deals?
- **Pipeline-Wert** - Wie viel Volumen ist in der Pipeline?
- **Abschlussquote** - Wie erfolgreich sind wir?
    `
  },
  {
    id: "bestellungen",
    title: "10. Bestellungen & Rechnungen",
    icon: <Receipt className="w-4 h-4" />,
    content: `
## 10.1 Bestellungen verwalten

Hier sehen Sie alle Bestellungen und können diese bearbeiten:

- **Bestellstatus ändern** - Offen → In Bearbeitung → Abgeschlossen
- **Zahlungsstatus prüfen** - Offen, Teilweise bezahlt, Bezahlt
- **Bestelldetails einsehen** - Alle Positionen und Preise
- **Notizen hinzufügen** - Interne Vermerke

## 10.2 Bestellstatus

| Status | Bedeutung |
|--------|-----------|
| **Offen** | Neu eingegangen, noch nicht bearbeitet |
| **In Bearbeitung** | Wird aktuell bearbeitet |
| **Wartet auf Zahlung** | Leistung erbracht, Zahlung ausstehend |
| **Abgeschlossen** | Vollständig bezahlt und erledigt |
| **Storniert** | Bestellung wurde storniert |

## 10.3 Rechnungen erstellen

So erstellen Sie eine Rechnung:

1. Gehen Sie zu **"Rechnungen"** > **"Neue Rechnung"**
2. Wählen Sie den **Kunden** aus der Liste
3. Fügen Sie **Positionen** hinzu (Beschreibung, Menge, Preis)
4. Prüfen Sie die **Vorschau**
5. Klicken Sie auf **"Rechnung erstellen"**
6. Optional: **Per E-Mail versenden**

## 10.4 Rechnungsvorlagen

Sie können Vorlagen für wiederkehrende Rechnungen erstellen:

1. Erstellen Sie eine Rechnung
2. Klicken Sie auf **"Als Vorlage speichern"**
3. Vergeben Sie einen Namen
4. Nutzen Sie die Vorlage für zukünftige Rechnungen

## 10.5 Zahlungseingänge

Wenn eine Zahlung eingeht:

1. Öffnen Sie die **Rechnung**
2. Klicken Sie auf **"Zahlung erfassen"**
3. Geben Sie **Betrag** und **Datum** ein
4. Der Status wird automatisch aktualisiert
    `
  },
  {
    id: "einstellungen",
    title: "11. Systemeinstellungen",
    icon: <Settings className="w-4 h-4" />,
    content: `
## 11.1 Allgemeine Einstellungen

Konfigurieren Sie grundlegende Systemparameter:

- **Firmenname** - Wird in E-Mails und Dokumenten angezeigt
- **Logo** - Ihr Firmenlogo (PNG, max. 2 MB)
- **E-Mail-Absender** - Absenderadresse für System-E-Mails
- **Standardwährung** - EUR, CHF, etc.
- **Zeitzone** - Europe/Berlin

## 11.2 E-Mail-Vorlagen

Passen Sie automatische E-Mails an:

| Vorlage | Verwendung |
|---------|------------|
| **Willkommen** | Nach der Registrierung |
| **Passwort-Reset** | Bei "Passwort vergessen" |
| **Aufgaben-Erinnerung** | Bei anstehenden Fristen |
| **Neue Nachricht** | Bei Nachricht vom Berater |
| **Rechnung** | Bei Rechnungsversand |

Jede Vorlage kann angepasst werden:
- **Betreff** - Wird im E-Mail-Client angezeigt
- **Inhalt** - HTML-formatierter Text
- **Variablen** - z.B. {{name}}, {{email}}, {{link}}

## 11.3 Integrationen

Das Portal ist mit folgenden Diensten verbunden:

| Dienst | Funktion | Status |
|--------|----------|--------|
| **Clerk** | Authentifizierung, Benutzerverwaltung | ✅ Aktiv |
| **Stripe** | Zahlungsabwicklung | ✅ Aktiv |
| **Resend** | E-Mail-Versand | ✅ Aktiv |

## 11.4 API-Schlüssel

Die API-Schlüssel sind in Railway als Environment Variables konfiguriert:

- \`CLERK_SECRET_KEY\` - Clerk Backend-Key
- \`VITE_CLERK_PUBLISHABLE_KEY\` - Clerk Frontend-Key
- \`STRIPE_SECRET_KEY\` - Stripe API-Key
- \`RESEND_API_KEY\` - Resend API-Key

> **Achtung:** Ändern Sie API-Schlüssel nur wenn nötig und dokumentieren Sie die Änderung!
    `
  },
  {
    id: "audit-log",
    title: "12. Audit-Log",
    icon: <ClipboardList className="w-4 h-4" />,
    content: `
## 12.1 Übersicht

Das Audit-Log protokolliert alle wichtigen Aktionen im System:

- **Benutzeranmeldungen** - Wer hat sich wann eingeloggt?
- **Datenänderungen** - Welche Daten wurden geändert?
- **Admin-Aktionen** - Welche Admin-Funktionen wurden genutzt?
- **Systemereignisse** - Fehler, Warnungen, Infos

## 12.2 Log-Einträge

Jeder Eintrag enthält:

| Feld | Beschreibung |
|------|--------------|
| **Zeitstempel** | Wann ist das Ereignis eingetreten? |
| **Benutzer** | Wer hat die Aktion ausgeführt? |
| **Aktion** | Was wurde getan? (LOGIN, UPDATE, DELETE, etc.) |
| **Ressource** | Welches Objekt war betroffen? |
| **Details** | Zusätzliche Informationen |
| **IP-Adresse** | Von wo kam die Anfrage? |

## 12.3 Filteroptionen

Sie können das Log nach verschiedenen Kriterien filtern:

- **Zeitraum** - Von/Bis Datum
- **Benutzer** - Bestimmter User
- **Aktionstyp** - LOGIN, CREATE, UPDATE, DELETE
- **Ressource** - users, documents, contracts, etc.

## 12.4 Export

Das Audit-Log kann exportiert werden:

1. Wählen Sie den **Zeitraum**
2. Wählen Sie die **Filter** (optional)
3. Klicken Sie auf **"Exportieren"**
4. Wählen Sie das **Format** (CSV oder Excel)

Exportierte Logs können für Compliance-Prüfungen oder externe Analysen verwendet werden.

## 12.5 Aufbewahrung

- Logs werden **90 Tage** aufbewahrt
- Ältere Logs werden automatisch archiviert
- Archivierte Logs können auf Anfrage wiederhergestellt werden
    `
  }
];

export default function AdminHandbuch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("anwender");
  const [activeChapter, setActiveChapter] = useState("einfuehrung");

  const currentKapitel = activeTab === "anwender" ? anwenderKapitel : adminKapitel;

  const filteredKapitel = useMemo(() => {
    if (!searchQuery.trim()) return currentKapitel;

    const query = searchQuery.toLowerCase();
    return currentKapitel.filter(
      (k) =>
        k.title.toLowerCase().includes(query) ||
        k.content.toLowerCase().includes(query)
    );
  }, [searchQuery, currentKapitel]);

  const activeContent = currentKapitel.find((k) => k.id === activeChapter);

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold mb-4">📘 ImmoRefi Portal Handbuch</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Handbuch durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setActiveChapter(v === "anwender" ? "einfuehrung" : "admin-uebersicht"); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="anwender">📖 Anwenderhandbuch</TabsTrigger>
            <TabsTrigger value="admin">🔧 Administratorhandbuch</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Table of Contents */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase mb-3">Inhaltsverzeichnis</h3>
            <nav className="space-y-1">
              {filteredKapitel.map((kapitel) => (
                <button
                  key={kapitel.id}
                  onClick={() => setActiveChapter(kapitel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeChapter === kapitel.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {kapitel.icon}
                  <span>{kapitel.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-4xl">
            {activeContent ? (
              <div
                className="prose prose-sm max-w-none
                  prose-headings:text-gray-900
                  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-li:text-gray-600
                  prose-strong:text-gray-900
                  prose-table:text-sm
                  prose-th:bg-gray-100 prose-th:p-2 prose-th:text-left
                  prose-td:p-2 prose-td:border-b
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{
                  __html: highlightText(activeContent.content)
                    .replace(/\n/g, '<br>')
                    .replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\`\`\`(\w+)?\n?([\s\S]*?)\`\`\`/g, '<pre><code>$2</code></pre>')
                    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
                    .replace(/\| (.*?) \|/g, (match) => {
                      const cells = match.split('|').filter(c => c.trim());
                      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
                    })
                    .replace(/> \*\*(.*?)\*\* (.*?)(<br>|$)/g, '<blockquote><strong>$1</strong> $2</blockquote>')
                    .replace(/> (.*?)(<br>|$)/g, '<blockquote>$1</blockquote>')
                    .replace(/^- (.*?)(<br>|$)/gm, '<li>$1</li>')
                    .replace(/^(\d+)\. (.*?)(<br>|$)/gm, '<li>$2</li>')
                }}
              />
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Ergebnisse für "{searchQuery}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      </div>
    </DashboardLayout>
  );
}
