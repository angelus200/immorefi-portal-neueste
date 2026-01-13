import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Users, Calculator, FileText, CheckSquare, Settings, Shield, BarChart3, Receipt, ClipboardList, Printer, Calendar, ShoppingCart, MessageCircle, Image as ImageIcon, FileCheck, HelpCircle } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

const anwenderKapitel: Chapter[] = [
  {
    id: "erste-schritte",
    title: "1. Erste Schritte",
    icon: <Users className="w-4 h-4" />,
    content: `
## 1.1 Anmeldung

Nach der Einladung durch einen Administrator können Sie sich anmelden:

1. Gehen Sie zu **portal.immoportal.app**
2. Geben Sie Ihre **E-Mail** und **Passwort** ein
3. Klicken Sie auf **"Anmelden"**
4. Bei der ersten Anmeldung werden Sie zum **Onboarding** weitergeleitet

> **Tipp:** Aktivieren Sie "Angemeldet bleiben" für schnelleren Zugang auf Ihrem persönlichen Gerät.

## 1.2 Onboarding-Prozess

Nach der ersten Anmeldung führen Sie das Onboarding durch:

### Persönliche Daten
- Vollständiger Name
- Geburtsdatum
- Telefonnummer
- Adresse

### Immobiliendaten
- Objektadresse
- Immobilientyp (Einfamilienhaus, Wohnung, etc.)
- Wohnfläche in m²
- Grundstücksgröße
- Baujahr

### Finanzierungsdaten
- Kaufpreis / aktueller Marktwert
- Eigenkapital
- Gewünschte Darlehenssumme
- Bestehende Finanzierungen

> **Wichtig:** Sie können das Onboarding jederzeit unterbrechen und später fortsetzen. Ihre Daten werden automatisch gespeichert.

## 1.3 Profil vervollständigen

Nach dem Onboarding können Sie Ihr Profil jederzeit unter **Einstellungen** bearbeiten:

- Profilbild hochladen
- Kontaktdaten aktualisieren
- Benachrichtigungseinstellungen anpassen
- Passwort ändern

## 1.4 Passwort vergessen

Falls Sie Ihr Passwort vergessen haben:

1. Klicken Sie auf **"Passwort vergessen?"**
2. Geben Sie Ihre **E-Mail-Adresse** ein
3. Prüfen Sie Ihr **Postfach** (auch den Spam-Ordner!)
4. Klicken Sie den **Link** in der E-Mail
5. Setzen Sie ein **neues Passwort**
    `
  },
  {
    id: "dashboard",
    title: "2. Dashboard",
    icon: <BarChart3 className="w-4 h-4" />,
    content: `
## 2.1 Übersicht

Das Dashboard ist Ihre zentrale Anlaufstelle nach dem Login. Hier sehen Sie auf einen Blick:

- **Willkommens-Widget** - Personalisierte Begrüßung mit aktueller Tageszeit
- **Status Ihres Finanzierungsantrags** - Fortschrittsbalken und nächste Schritte
- **Offene Aufgaben** - Was muss als Nächstes erledigt werden?
- **Aktuelle Nachrichten** - Neue Mitteilungen von Ihrem Berater
- **Dokumente-Status** - Welche Unterlagen fehlen noch?
- **Termine** - Anstehende Beratungstermine

## 2.2 Navigation

Die Hauptnavigation befindet sich auf der linken Seite und ist nach Rolle unterschiedlich:

### Client-Navigation
| Menüpunkt | Funktion |
|-----------|----------|
| **Dashboard** | Übersicht und Schnellzugriff |
| **Termin buchen** | Beratungstermin online vereinbaren |
| **Bestellungen** | Ihre gebuchten Services |
| **Rechnungen** | Offene und bezahlte Rechnungen |
| **Dokumente** | Ihre hochgeladenen Unterlagen |
| **Nachrichten** | Kommunikation mit Ihrem Berater |

## 2.3 Schnellaktionen

Auf dem Dashboard finden Sie Schnellaktionen für häufige Aufgaben:

- **Termin buchen** - Beratungstermin vereinbaren
- **Dokument hochladen** - Unterlagen einreichen
- **Nachricht senden** - Berater kontaktieren
- **Profil vervollständigen** - Fehlende Daten nachtragen

## 2.4 Finanzierungsstatus

Der Finanzierungsstatus zeigt Ihnen, wo Ihr Antrag gerade steht:

1. **Onboarding** - Datenerfassung läuft
2. **Unterlagen prüfen** - Dokumente werden geprüft
3. **Angebot erstellen** - Finanzierungsangebot wird vorbereitet
4. **Verhandlung** - Konditionen werden besprochen
5. **Vertragsunterzeichnung** - Vertrag ist zur Unterschrift bereit
6. **Abgeschlossen** - Finanzierung ist bewilligt
    `
  },
  {
    id: "terminbuchung",
    title: "3. Terminbuchung",
    icon: <Calendar className="w-4 h-4" />,
    content: `
## 3.1 Termin buchen

So buchen Sie einen Beratungstermin:

1. Klicken Sie auf **"Termin buchen"** im Hauptmenü
2. Wählen Sie den gewünschten **Termintyp**:
   - Erstberatung (60 Minuten)
   - Folgegespräch (30 Minuten)
   - Vertragsunterzeichnung (45 Minuten)
3. Wählen Sie Ihren **bevorzugten Berater** (falls verfügbar)
4. Wählen Sie **Datum und Uhrzeit** aus dem Kalender
5. Geben Sie optional eine **Nachricht** oder **Agenda** ein
6. Bestätigen Sie die Buchung

> **Hinweis:** Sie erhalten eine Bestätigungs-E-Mail mit Kalender-Einladung (.ics Datei).

## 3.2 Terminarten

| Termintyp | Dauer | Beschreibung |
|-----------|-------|--------------|
| **Erstberatung** | 60 Min. | Umfassende Bedarfsanalyse und Zielbesprechung |
| **Folgegespräch** | 30 Min. | Status-Update und Klärung offener Fragen |
| **Vertragsunterzeichnung** | 45 Min. | Durchsprechen und Unterzeichnen des Vertrags |
| **Notfalltermin** | 15 Min. | Dringende Klärung bei Problemen |

## 3.3 Termin verschieben oder absagen

So ändern Sie einen gebuchten Termin:

1. Gehen Sie zu **"Termin buchen"**
2. Sehen Sie Ihre gebuchten Termine unter **"Meine Termine"**
3. Klicken Sie auf den Termin, den Sie ändern möchten
4. Wählen Sie **"Verschieben"** oder **"Absagen"**
5. Bei Verschiebung: Wählen Sie neues Datum/Uhrzeit
6. Bestätigen Sie die Änderung

> **Wichtig:** Absagen/Verschiebungen sind bis 24 Stunden vor dem Termin möglich.

## 3.4 Video-Call vs. Vor-Ort-Termin

Sie können bei der Buchung zwischen verschiedenen Formaten wählen:

- **Video-Call** - Bequem von zu Hause, Sie erhalten einen Zoom/Teams-Link
- **Telefon** - Klassisches Telefonat, Sie werden zur vereinbarten Zeit angerufen
- **Vor Ort** - Persönliches Treffen in unserem Büro (Adresse wird in der Bestätigung genannt)

## 3.5 Vorbereitung auf den Termin

Checkliste für Ihr Beratungsgespräch:

- [ ] Personalausweis bereithalten
- [ ] Aktuelle Einkommensnachweise griffbereit
- [ ] Immobilienunterlagen vorbereiten
- [ ] Liste mit Fragen/Anliegen notieren
- [ ] Bei Video-Call: Funktionierende Kamera und Mikrofon prüfen
    `
  },
  {
    id: "bestellungen",
    title: "4. Bestellungen & Produkte",
    icon: <ShoppingCart className="w-4 h-4" />,
    content: `
## 4.1 Produktkatalog

Im Bereich **Shop** finden Sie verschiedene Services, die Sie buchen können:

### Verfügbare Produkte
- **Finanzierungsberatung** - Umfassende Beratung zu Ihrem Vorhaben
- **Bonitätsprüfung Express** - Schnelle Einschätzung Ihrer Bonität
- **Objektbewertung** - Professionelle Immobilienbewertung
- **Dokumenten-Check** - Prüfung Ihrer Unterlagen auf Vollständigkeit
- **Vertragscheck Premium** - Juristische Prüfung bestehender Verträge

## 4.2 Service buchen

So buchen Sie einen Service:

1. Gehen Sie zum **Shop** über den Link auf der Landingpage
2. Wählen Sie das gewünschte **Produkt**
3. Lesen Sie die **Produktbeschreibung** und **Leistungsumfang**
4. Klicken Sie auf **"Jetzt buchen"**
5. Prüfen Sie die **Bestellübersicht**
6. Wählen Sie die **Zahlungsmethode** (Kreditkarte, SEPA, PayPal)
7. Bestätigen Sie die **AGB und Datenschutzerklärung**
8. Klicken Sie auf **"Zahlungspflichtig bestellen"**

## 4.3 Bestellstatus verfolgen

Nach der Bestellung können Sie den Status unter **Bestellungen** verfolgen:

| Status | Bedeutung |
|--------|-----------|
| **Offen** | Bestellung eingegangen, wird bearbeitet |
| **In Bearbeitung** | Service wird aktuell erbracht |
| **Wartet auf Informationen** | Wir benötigen zusätzliche Daten von Ihnen |
| **Abgeschlossen** | Service wurde vollständig erbracht |
| **Storniert** | Bestellung wurde storniert |

## 4.4 Rechnungen

Zu jeder Bestellung erhalten Sie eine Rechnung:

- Rechnungen finden Sie unter **Rechnungen** im Hauptmenü
- Jede Rechnung kann als **PDF heruntergeladen** werden
- Bei offenen Rechnungen sehen Sie den **Zahlungsstatus**
- Automatische **Zahlungserinnerungen** bei überfälligen Rechnungen

## 4.5 Reklamation

Falls Sie mit einem Service nicht zufrieden sind:

1. Gehen Sie zu **Bestellungen**
2. Öffnen Sie die betreffende Bestellung
3. Klicken Sie auf **"Reklamation"**
4. Beschreiben Sie Ihr Anliegen
5. Unser Support meldet sich innerhalb von 24 Stunden
    `
  },
  {
    id: "dokumente",
    title: "5. Dokumente",
    icon: <FileText className="w-4 h-4" />,
    content: `
## 5.1 Dokumente hochladen

So laden Sie Dokumente hoch:

1. Gehen Sie zu **"Dokumente"**
2. Klicken Sie auf **"Dokument hochladen"** (+ Button)
3. **Drag & Drop** oder **Datei auswählen** von Ihrem Computer
4. Wählen Sie die **Dokumentenkategorie**
5. Geben Sie optional eine **Beschreibung** ein
6. Klicken Sie auf **"Hochladen"**

**Unterstützte Formate:** PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
**Maximale Dateigröße:** 10 MB pro Datei

## 5.2 Dokumentenkategorien

| Kategorie | Beispiele | Pflicht? |
|-----------|-----------|----------|
| **Einkommensnachweise** | Gehaltsabrechnungen (letzte 3 Monate), Jahresabschluss, Steuerbescheid, Rentenbescheid | ✅ Ja |
| **Immobilienunterlagen** | Grundbuchauszug, Kaufvertrag, Exposé, Flurkarte, Energieausweis, Baugenehmigung | ✅ Ja |
| **Finanzierungsunterlagen** | Bestehende Darlehensverträge, Kontoauszüge (3 Monate), Schufa-Auskunft | ✅ Ja |
| **Persönliche Dokumente** | Personalausweis (Vorder- & Rückseite), Meldebescheinigung, Heiratsurkunde | ✅ Ja |
| **Sonstige** | Weitere relevante Dokumente | ❌ Optional |

## 5.3 Dokumentenstatus

Jedes hochgeladene Dokument durchläuft verschiedene Stati:

- **Hochgeladen** ⏳ - Dokument wurde hochgeladen, wird geprüft
- **Geprüft** ✅ - Dokument wurde akzeptiert
- **Abgelehnt** ❌ - Dokument wurde abgelehnt (Grund wird angezeigt)
- **Nachbesserung erforderlich** ⚠️ - Dokument muss überarbeitet werden

## 5.4 Dokumente verwalten

Sie können Ihre Dokumente jederzeit verwalten:

- **Ansehen** - PDF/Bilder direkt im Browser öffnen
- **Herunterladen** - Dokument auf Ihren Computer laden
- **Ersetzen** - Neue Version eines Dokuments hochladen
- **Löschen** - Dokument entfernen (nur bei nicht geprüften Dokumenten)

## 5.5 Datenschutz und Sicherheit

Ihre Dokumente sind sicher:

- **SSL-Verschlüsselung** - Übertragung ist verschlüsselt
- **Server-Verschlüsselung** - Dokumente werden verschlüsselt gespeichert
- **Zugriffsprotokoll** - Jeder Zugriff wird protokolliert
- **DSGVO-konform** - Alle Anforderungen werden erfüllt
- **Löschung** - Dokumente werden nach Projektabschluss + 10 Jahre gelöscht
    `
  },
  {
    id: "vertraege",
    title: "6. Verträge",
    icon: <FileCheck className="w-4 h-4" />,
    content: `
## 6.1 Vertragsübersicht

Im Bereich **Verträge** finden Sie alle Ihre Vereinbarungen:

- **Entwürfe** - Verträge, die noch bearbeitet werden
- **Zur Unterschrift** - Verträge, die auf Ihre Unterschrift warten
- **Aktiv** - Laufende, unterschriebene Verträge
- **Abgeschlossen** - Erfüllte oder beendete Verträge
- **Archiv** - Alte Verträge zur Einsicht

## 6.2 Vertrag prüfen

So prüfen Sie einen neuen Vertrag:

1. Sie erhalten eine **E-Mail-Benachrichtigung**, dass ein Vertrag bereitsteht
2. Gehen Sie zu **Verträge** > **Zur Unterschrift**
3. Öffnen Sie den Vertrag per **Klick**
4. Lesen Sie alle Seiten **sorgfältig durch**
5. Nutzen Sie die **Zoom-Funktion** für Details
6. Laden Sie den Vertrag als **PDF herunter** für Ihre Unterlagen
7. Bei Fragen: Klicken Sie auf **"Frage zum Vertrag stellen"**

## 6.3 Digitale Unterschrift

So unterschreiben Sie einen Vertrag digital:

1. Öffnen Sie den **Vertrag** unter **"Zur Unterschrift"**
2. Lesen Sie den Vertrag **vollständig**
3. Scrollen Sie zum Ende des Dokuments
4. Klicken Sie auf **"Jetzt unterschreiben"**
5. Bestätigen Sie mit Ihrem **Passwort**
6. Optional: **SMS-Code** zur Zwei-Faktor-Authentifizierung
7. Unterschrift wird im Vertrag eingetragen
8. Sie erhalten eine **Bestätigungs-E-Mail** mit signiertem PDF

> **Rechtskräftig:** Die digitale Unterschrift ist rechtlich gleichwertig mit einer handschriftlichen Unterschrift gemäß eIDAS-Verordnung.

## 6.4 Vertragsvorlagen

Für Standard-Vorgänge verwenden wir Vertragsvorlagen:

| Vorlage | Verwendung |
|---------|------------|
| **Beratungsvertrag** | Standard-Beratungsdienstleistung |
| **Maklervertrag** | Vermittlung von Finanzierungen |
| **Vollmacht** | Bevollmächtigung für Bankgespräche |
| **Datenschutzerklärung** | DSGVO-konforme Datenverarbeitung |

Jede Vorlage wird individuell auf Ihre Situation angepasst.

## 6.5 Vertragslaufzeit und Kündigung

Informationen zu Ihren Verträgen:

- **Laufzeit** wird im Vertrag angezeigt
- **Kündigungsfristen** sind im Vertrag festgelegt
- **Automatische Verlängerung** ist bei manchen Verträgen möglich
- Bei **Kündigungswunsch**: Kontaktieren Sie Ihren Berater über "Nachrichten"
    `
  },
  {
    id: "rechnungen",
    title: "7. Rechnungen",
    icon: <Receipt className="w-4 h-4" />,
    content: `
## 7.1 Rechnungsübersicht

Unter **Rechnungen** finden Sie alle Ihre Rechnungen:

- **Offene Rechnungen** - Noch zu bezahlen
- **Überfällige Rechnungen** - Zahlungsfrist überschritten
- **Bezahlte Rechnungen** - Vollständig beglichen
- **Stornierte Rechnungen** - Nicht mehr gültig

## 7.2 Rechnung einsehen

Jede Rechnung enthält:

- **Rechnungsnummer** - Eindeutige Identifikation
- **Rechnungsdatum** - Ausstellungsdatum
- **Fälligkeitsdatum** - Zahlungsziel
- **Leistungszeitraum** - Wann wurde die Leistung erbracht?
- **Positionen** - Detaillierte Aufstellung
- **Netto/Brutto/MwSt.** - Steuerliche Aufschlüsselung
- **Zahlungshinweise** - Bankverbindung und Verwendungszweck

## 7.3 Rechnung bezahlen

So bezahlen Sie eine Rechnung:

### Option 1: Online-Zahlung
1. Öffnen Sie die Rechnung
2. Klicken Sie auf **"Jetzt bezahlen"**
3. Wählen Sie die Zahlungsmethode (Kreditkarte, SEPA, PayPal)
4. Schließen Sie die Zahlung ab
5. Sie erhalten sofort eine Zahlungsbestätigung

### Option 2: Überweisung
1. Laden Sie die Rechnung als PDF herunter
2. Überweisen Sie den Betrag auf die angegebene Bankverbindung
3. Verwenden Sie die **Rechnungsnummer als Verwendungszweck**
4. Die Zahlung wird automatisch zugeordnet (kann 1-3 Werktage dauern)

## 7.4 Zahlungserinnerungen

Bei überfälligen Rechnungen:

- **1. Erinnerung** - 5 Tage nach Fälligkeit (kostenlos)
- **2. Mahnung** - 10 Tage nach 1. Erinnerung (€10 Mahngebühr)
- **3. Mahnung** - 7 Tage nach 2. Mahnung (€25 Mahngebühr)
- **Inkasso** - Nach 3. Mahnung werden Inkassokosten fällig

> **Tipp:** Richten Sie bei wiederkehrenden Zahlungen ein SEPA-Lastschriftmandat ein, um Mahnungen zu vermeiden.

## 7.5 Rechnungen für Steuern

Alle Rechnungen können für Ihre Steuererklärung verwendet werden:

- Laden Sie Rechnungen als PDF herunter
- Exportieren Sie alle Rechnungen eines Jahres als ZIP
- Rechnungen enthalten alle steuerlich relevanten Informationen
- Bei Fragen wenden Sie sich an Ihren Steuerberater
    `
  },
  {
    id: "nachrichten",
    title: "8. Nachrichten / Chat",
    icon: <MessageCircle className="w-4 h-4" />,
    content: `
## 8.1 Nachrichtensystem

Das Nachrichtensystem ermöglicht direkte Kommunikation mit Ihrem Berater:

- **Echtzeit-Chat** - Sofortige Zustellung
- **E-Mail-Benachrichtigung** - Bei neuen Nachrichten
- **Dateianhänge** - Dokumente direkt mitschicken
- **Nachrichtenverlauf** - Alle Konversationen gespeichert

## 8.2 Nachricht senden

So senden Sie eine Nachricht:

1. Klicken Sie auf **"Nachrichten"** im Hauptmenü
2. Klicken Sie auf **"Neue Nachricht"** oder antworten Sie auf eine bestehende Konversation
3. Geben Sie Ihren **Nachrichtentext** ein
4. Optional: Fügen Sie **Dateien hinzu** (max. 10 MB)
5. Klicken Sie auf **"Senden"**

> **Antwortzeit:** Wir antworten in der Regel innerhalb von 24 Stunden (Werktags).

## 8.3 Dateianhänge

Sie können folgende Dateitypen anhängen:

- **Dokumente:** PDF, DOC, DOCX, XLS, XLSX
- **Bilder:** JPG, PNG, GIF
- **Maximalgröße:** 10 MB pro Datei
- **Mehrere Dateien:** Bis zu 5 Dateien pro Nachricht

## 8.4 Benachrichtigungen

Sie werden benachrichtigt bei:

- **Neuer Nachricht** - Sofort per E-Mail
- **Antwort auf Ihre Nachricht** - Sofort per E-Mail
- **Wichtige Mitteilungen** - Zusätzlich als Push-Benachrichtigung (wenn aktiviert)

Benachrichtigungseinstellungen können Sie unter **Einstellungen** anpassen.

## 8.5 Archiv

Alle Nachrichten werden archiviert:

- Nachrichten werden **unbegrenzt** gespeichert
- **Suchfunktion** zum Finden alter Konversationen
- **Filteroptionen** nach Datum, Berater, Thema
- **Export** als PDF für Ihre Unterlagen möglich
    `
  },
  {
    id: "einstellungen",
    title: "9. Einstellungen",
    icon: <Settings className="w-4 h-4" />,
    content: `
## 9.1 Profil bearbeiten

Unter **Einstellungen** > **Profil** können Sie ändern:

- **Profilbild** - Laden Sie ein Foto hoch (max. 2 MB)
- **Name** - Vor- und Nachname
- **E-Mail-Adresse** - Kontakt-E-Mail (erfordert Bestätigung)
- **Telefonnummer** - Haupt- und Mobilnummer
- **Adresse** - Vollständige Anschrift

## 9.2 Passwort ändern

So ändern Sie Ihr Passwort:

1. Gehen Sie zu **Einstellungen** > **Sicherheit**
2. Klicken Sie auf **"Passwort ändern"**
3. Geben Sie Ihr **aktuelles Passwort** ein
4. Geben Sie Ihr **neues Passwort** ein (mindestens 8 Zeichen)
5. **Bestätigen** Sie das neue Passwort
6. Klicken Sie auf **"Passwort aktualisieren"**

> **Passwort-Anforderungen:**
> - Mindestens 8 Zeichen
> - Mindestens 1 Großbuchstabe
> - Mindestens 1 Kleinbuchstabe
> - Mindestens 1 Zahl
> - Empfohlen: Sonderzeichen

## 9.3 Zwei-Faktor-Authentifizierung (2FA)

Für erhöhte Sicherheit aktivieren Sie 2FA:

1. Gehen Sie zu **Einstellungen** > **Sicherheit**
2. Klicken Sie auf **"2FA aktivieren"**
3. Wählen Sie die Methode:
   - **SMS** - Code per SMS
   - **Authenticator App** - TOTP (z.B. Google Authenticator)
4. Folgen Sie den Anweisungen
5. **Backup-Codes** notieren und sicher aufbewahren

## 9.4 Benachrichtigungen

Passen Sie Ihre Benachrichtigungen an:

| Ereignis | E-Mail | Browser | SMS |
|----------|--------|---------|-----|
| Neue Nachricht | ✅ Ja | ✅ Ja | ❌ Nein |
| Neue Aufgabe | ✅ Ja | ✅ Ja | ❌ Nein |
| Frist läuft ab | ✅ Ja | ✅ Ja | ✅ Ja (1 Tag vorher) |
| Neuer Vertrag | ✅ Ja | ✅ Ja | ✅ Ja |
| Rechnung fällig | ✅ Ja | ❌ Nein | ✅ Ja (bei Überfälligkeit) |

## 9.5 Datenschutz

Im Bereich **Datenschutz** können Sie:

- **Datenauskun** - Alle über Sie gespeicherten Daten anfordern
- **Datenkorrektur** - Fehlerhafte Daten korrigieren lassen
- **Datenlöschung** - Ihr Konto und alle Daten löschen (nach Projektabschluss)
- **Cookie-Einstellungen** - Cookie-Präferenzen verwalten
- **Einwilligungen** - Erteilte Einwilligungen einsehen und widerrufen

> **Recht auf Vergessenwerden:** Sie können jederzeit die Löschung Ihrer Daten beantragen. Beachten Sie, dass dies das Ende der Geschäftsbeziehung bedeutet und wir gesetzlich verpflichtet sind, bestimmte Daten für Steuer- und Buchhaltungszwecke 10 Jahre aufzubewahren.
    `
  }
];

const adminKapitel: Chapter[] = [
  {
    id: "admin-uebersicht",
    title: "1. CRM-System (Admin)",
    icon: <Users className="w-4 h-4" />,
    content: `
## 1.1 CRM-Übersicht

Als Administrator haben Sie Zugriff auf ein umfassendes CRM-System zur Verwaltung von Leads und Deals.

### Hauptfunktionen
- **Lead-Management** - Interessenten erfassen und verwalten
- **Pipeline-Management** - Deals durch den Verkaufstrichter führen
- **Kontakte** - Zentrale Kontaktdatenbank
- **GoHighLevel Integration** - Automatische Synchronisierung

## 1.2 Lead-Management (/crm/leads)

Im Lead-Bereich verwalten Sie alle eingehenden Anfragen:

### Lead erfassen
1. Klicken Sie auf **"Neuer Lead"**
2. Erfassen Sie die Kontaktdaten:
   - Vor- und Nachname
   - E-Mail-Adresse
   - Telefonnummer
   - Leadquelle (Website, Telefon, Empfehlung, etc.)
3. Fügen Sie **Notizen** hinzu
4. Weisen Sie einen **zuständigen Berater** zu
5. Setzen Sie den **Lead-Status**

### Lead-Status
| Status | Bedeutung | Nächste Schritte |
|--------|-----------|------------------|
| **Neu** | Gerade eingegangen | Erstgespräch vereinbaren |
| **Kontaktiert** | Erstkontakt erfolgt | Bedarf ermitteln |
| **Qualifiziert** | Interesse bestätigt | Angebot vorbereiten |
| **Nicht qualifiziert** | Kein passender Bedarf | Archivieren |
| **Zu Deal konvertiert** | In Pipeline übernommen | Deal bearbeiten |

### Lead-Aktionen
- **Anrufen** - Telefonanruf dokumentieren
- **E-Mail senden** - Direkt aus dem System
- **Termin vereinbaren** - Mit Kalender verknüpft
- **Zu Deal konvertieren** - Lead wird zum aktiven Deal
- **Notizen hinzufügen** - Gesprächsnotizen festhalten

## 1.3 Pipeline-Management (/crm/deals)

Die Deal-Pipeline visualisiert alle aktiven Finanzierungsanfragen:

### Pipeline-Phasen
1. **Anfrage** (New)
   - Erste Kontaktaufnahme erfolgt
   - Grobes Interesse bekundet
   - Terminvereinbarung für Erstgespräch

2. **Qualifizierung** (Qualified)
   - Bedarfsanalyse durchgeführt
   - Bonität grob eingeschätzt
   - Immobilie identifiziert

3. **Angebotserstellung** (Proposal)
   - Unterlagen werden geprüft
   - Finanzierungsangebot wird erstellt
   - Konditionen werden kalkuliert

4. **Verhandlung** (Negotiation)
   - Angebot wurde präsentiert
   - Konditionen werden besprochen
   - Anpassungen werden vorgenommen

5. **Abschluss** (Closing)
   - Verträge werden vorbereitet
   - Unterschriften werden eingeholt
   - Deal ist gewonnen

6. **Gewonnen** (Won)
   - Vertrag unterschrieben
   - Finanzierung bewilligt

7. **Verloren** (Lost)
   - Kunde hat abgesagt
   - Grund dokumentieren

### Deal bearbeiten
1. Öffnen Sie einen Deal per **Klick**
2. Aktualisieren Sie den **Status** durch Drag & Drop
3. Fügen Sie **Notizen** hinzu
4. Dokumentieren Sie **Aktivitäten**
5. Laden Sie **Dokumente** hoch
6. Setzen Sie **Fristen** für nächste Schritte

### Deal-Kennzahlen
- **Finanzierungsvolumen** - Summe des Darlehens
- **Wahrscheinlichkeit** - Erfolgswahrscheinlichkeit in %
- **Gewichteter Wert** - Volumen × Wahrscheinlichkeit
- **Tage in Phase** - Wie lange ist der Deal schon in dieser Phase?

## 1.4 Kontakte (/crm/contacts)

Zentrale Kontaktdatenbank für alle Kunden und Interessenten:

- **Kontakthistorie** - Alle Interaktionen auf einen Blick
- **Verknüpfte Leads/Deals** - Zusammenhänge sehen
- **Dokumente** - Alle Unterlagen des Kontakts
- **Kommunikation** - E-Mails und Notizen
- **Termine** - Vergangene und zukünftige Meetings

## 1.5 GoHighLevel Integration

Das CRM ist mit GoHighLevel verbunden:

### Automatische Synchronisierung
- **Leads** werden automatisch von GoHighLevel importiert
- **Status-Updates** werden bidirektional synchronisiert
- **Notizen** werden übertragen
- **Termine** werden abgeglichen

### Webhook-Events
- Neue Lead-Einträge aus Web-Formularen
- Status-Änderungen in GoHighLevel
- Neue Termine
- E-Mail-Kommunikation

> **Hinweis:** Die Synchronisierung erfolgt alle 5 Minuten automatisch. Manuelle Synchronisierung über den Sync-Button möglich.

## 1.6 Berichte und Analytics

Unter **Berichte** finden Sie wichtige Kennzahlen:

- **Conversion-Rate** - Wie viele Leads werden zu Deals?
- **Pipeline-Wert** - Gesamtwert aller offenen Deals
- **Durchschnittliche Deal-Größe** - Durchschnittliches Finanzierungsvolumen
- **Zeit pro Phase** - Wie lange dauern die einzelnen Phasen?
- **Gewinnrate** - Wie viele Deals werden gewonnen?
- **Lead-Quellen** - Woher kommen die meisten Leads?
    `
  },
  {
    id: "termine",
    title: "2. Termine & Kalender (Admin)",
    icon: <Calendar className="w-4 h-4" />,
    content: `
## 2.1 Mein Kalender (/admin/my-calendar)

Als Administrator verwalten Sie Ihren persönlichen Terminkalender:

### Kalenderansicht
- **Monatsansicht** - Überblick über alle Termine des Monats
- **Wochenansicht** - Detailansicht einer Woche
- **Tagesansicht** - Stundenplan für einen Tag
- **Agenda** - Listenansicht aller anstehenden Termine

### Termin erstellen
1. Klicken Sie auf **"Neuer Termin"** oder direkt in den Kalender
2. Erfassen Sie die Termindaten:
   - **Titel** - z.B. "Beratungsgespräch mit Kunde XY"
   - **Termintyp** - Erstberatung, Folgegespräch, intern, etc.
   - **Datum und Uhrzeit** - Start und Ende
   - **Teilnehmer** - Kunde(n) und ggf. Kollegen
   - **Format** - Video-Call, Telefon, Vor Ort
   - **Beschreibung** - Agenda und wichtige Punkte
3. Optional: **Zoom/Teams-Link** automatisch erstellen
4. Optional: **Erinnerungen** setzen (15 Min., 1h, 1 Tag vorher)
5. Termin speichern

### Termin-Farben
Verwenden Sie Farben zur Kategorisierung:
- **Blau** - Erstberatung
- **Grün** - Folgegespräch
- **Orange** - Vertragsunterzeichnung
- **Rot** - Dringender Termin
- **Grau** - Interner Termin

## 2.2 Buchungen verwalten (/admin/bookings)

Überblick über alle Terminbuchungen von Kunden:

### Buchungsübersicht
Alle von Kunden gebuchten Termine mit:
- **Kunde** - Wer hat gebucht?
- **Termintyp** - Art des Termins
- **Datum/Uhrzeit** - Wann findet der Termin statt?
- **Status** - Bestätigt, Ausstehend, Abgesagt
- **Berater** - Wem ist der Termin zugewiesen?
- **Format** - Video, Telefon, Vor Ort

### Buchung bearbeiten
1. Öffnen Sie die Buchung
2. Sie können:
   - **Bestätigen** - Termin wird definitiv
   - **Verschieben** - Neues Datum vorschlagen
   - **Absagen** - Termin absagen (mit Begründung)
   - **Berater zuweisen** - Anderen Berater zuweisen
   - **Notizen hinzufügen** - Vorbereitungsnotizen

### Buchungsstatus
| Status | Bedeutung | Aktion |
|--------|-----------|--------|
| **Ausstehend** | Neu gebucht, wartet auf Bestätigung | Bestätigen oder ablehnen |
| **Bestätigt** | Termin ist fix | Vorbereitung |
| **Abgeschlossen** | Termin hat stattgefunden | Nachbearbeitung |
| **Abgesagt** | Wurde storniert | Ggf. neuen Termin vereinbaren |
| **Nicht erschienen** | Kunde kam nicht | Nachfassen |

## 2.3 Verfügbarkeiten festlegen

Legen Sie Ihre Arbeitszeiten und Verfügbarkeit fest:

### Arbeitszeiten
1. Gehen Sie zu **Kalendereinstellungen**
2. Definieren Sie Ihre **Standard-Arbeitszeiten**:
   - Montag bis Freitag: 9:00 - 17:00 Uhr
   - Optional: Samstag-Verfügbarkeit
3. **Pausen** definieren (z.B. 12:00 - 13:00 Uhr)
4. **Pufferzonen** zwischen Terminen (z.B. 15 Minuten)

### Abwesenheiten
Blockieren Sie Zeiten für Urlaub oder Abwesenheit:
1. Erstellen Sie einen **Abwesenheitstermin**
2. Markieren Sie als **"Ganztägig"** für Urlaub
3. Setzen Sie den Status auf **"Außer Haus"**
4. Diese Zeiten werden automatisch für Buchungen geblockt

## 2.4 Terminarten konfigurieren

Definieren Sie verschiedene Terminarten:

| Terminart | Dauer | Beschreibung |
|-----------|-------|--------------|
| **Erstberatung** | 60 Min. | Umfassende Bedarfsanalyse |
| **Folgegespräch** | 30 Min. | Status-Update |
| **Vertragsunterzeichnung** | 45 Min. | Vertrag durchsprechen |
| **Objektbesichtigung** | 90 Min. | Vor-Ort-Termin |
| **Notfalltermin** | 15 Min. | Dringende Klärung |

Jede Terminart kann individuell konfiguriert werden mit:
- **Dauer** - Standard-Terminlänge
- **Farbe** - Zur visuellen Unterscheidung
- **Puffer** - Zeit nach dem Termin
- **Formular** - Welche Infos soll der Kunde bei Buchung angeben?

## 2.5 E-Mail-Benachrichtigungen

Automatische E-Mails bei Terminaktivitäten:

### An Kunden
- **Buchungsbestätigung** - Sofort nach Buchung
- **Erinnerung** - 24h vor dem Termin
- **Terminerreichung** - 15 Minuten vorher mit Meeting-Link
- **Follow-Up** - Nach dem Termin

### An Administrator
- **Neue Buchung** - Benachrichtigung bei neuer Anfrage
- **Absage** - Wenn Kunde absagt
- **Terminerinnerung** - 30 Minuten vor Termin

## 2.6 Statistiken

Unter **Termin-Statistiken** sehen Sie:
- **Anzahl Termine pro Monat** - Wie viele Termine finden statt?
- **Durchschnittliche Termindauer** - Wie lange dauern Termine?
- **No-Show-Rate** - Wie viele Kunden erscheinen nicht?
- **Terminquellen** - Über welche Kanäle werden Termine gebucht?
- **Beliebteste Zeiten** - Wann werden am meisten Termine gebucht?
    `
  },
  {
    id: "verwaltung",
    title: "3. Verwaltung (Admin)",
    icon: <FileCheck className="w-4 h-4" />,
    content: `
## 3.1 Onboarding-Daten (/admin/onboarding)

Überblick über alle Onboarding-Daten von Kunden:

### Onboarding-Status
| Status | Bedeutung | Nächste Schritte |
|--------|-----------|------------------|
| **Nicht gestartet** | Kunde hat noch nicht begonnen | Erinnerung senden |
| **In Bearbeitung** | Kunde füllt gerade aus | Abwarten |
| **Abgeschlossen** | Alle Daten erfasst | Daten prüfen |
| **Geprüft** | Daten wurden validiert | Freigabe erteilen |

### Onboarding-Daten einsehen
1. Öffnen Sie einen Kunden in der Liste
2. Sehen Sie alle erfassten Daten:
   - **Persönliche Daten** - Name, Adresse, Kontakt
   - **Immobiliendaten** - Objektdetails
   - **Finanzierungswunsch** - Darlehenssumme, Laufzeit
   - **Bestehende Finanzierungen** - Aktuelle Kredite
3. **Validieren** Sie die Daten auf Plausibilität
4. Bei Unklarheiten: **Nachfrage** an Kunden senden

### Daten exportieren
- Export als **Excel** für weitere Bearbeitung
- Export als **PDF** für Kundendokumentation
- **Sammelexport** aller Onboarding-Daten

## 3.2 Bestellungen (/admin/orders)

Verwaltung aller Bestellungen aus dem Shop:

### Bestellübersicht
- **Neue Bestellungen** - Gerade eingegangen
- **In Bearbeitung** - Werden aktuell bearbeitet
- **Abgeschlossen** - Erfolgreich erledigt
- **Storniert** - Abgebrochene Bestellungen

### Bestellung bearbeiten
1. Öffnen Sie die Bestellung
2. Sehen Sie alle Details:
   - **Kunde** - Wer hat bestellt?
   - **Produkt(e)** - Was wurde bestellt?
   - **Preis** - Gesamtsumme
   - **Zahlungsstatus** - Bezahlt/Offen
   - **Bestelldatum** - Wann wurde bestellt?
3. Ändern Sie den **Bestellstatus**:
   - Von "Neu" zu "In Bearbeitung"
   - Von "In Bearbeitung" zu "Abgeschlossen"
4. Fügen Sie **interne Notizen** hinzu
5. Bei Bedarf: **Rechnung erneut senden**

### Bestellstatus-Benachrichtigungen
Kunden werden automatisch benachrichtigt bei:
- **Auftragsbestätigung** - Bestellung eingegangen
- **Status-Änderung** - z.B. "In Bearbeitung"
- **Fertigstellung** - Service wurde erbracht
- **Rechnung fällig** - Zahlungserinnerung

## 3.3 Rechnungen (/admin/invoices)

Rechnungserstellung und -verwaltung:

### Rechnung erstellen
1. Klicken Sie auf **"Neue Rechnung"**
2. Wählen Sie den **Kunden**
3. Fügen Sie **Positionen** hinzu:
   - Beschreibung
   - Menge
   - Einzelpreis (netto)
   - MwSt.-Satz (0%, 7%, 19%)
4. Prüfen Sie die **Gesamtsumme**
5. Optional: **Zahlungsziel** festlegen (Standard: 14 Tage)
6. Optional: **Skonto** anbieten (z.B. 2% bei Zahlung innerhalb 7 Tagen)
7. **Erstellen und versenden**

### Rechnungsnummern
- Automatische, fortlaufende Nummernvergabe
- Format: **RE-2026-0001**
- Keine Duplikate möglich

### Zahlungseingang erfassen
1. Öffnen Sie die offene Rechnung
2. Klicken Sie auf **"Zahlung erfassen"**
3. Geben Sie ein:
   - **Betrag** - Gezahlter Betrag
   - **Datum** - Zahlungsdatum
   - **Zahlungsart** - Überweisung, Lastschrift, Bar
4. Status wechselt automatisch auf **"Bezahlt"**

### Mahnwesen
Automatisches Mahnwesen für überfällige Rechnungen:
- **5 Tage nach Fälligkeit** - Freundliche Zahlungserinnerung (kostenlos)
- **10 Tage später** - 1. Mahnung (€10 Mahngebühr)
- **7 Tage später** - 2. Mahnung (€25 Mahngebühr)
- **7 Tage später** - Letzte Mahnung vor Inkasso

### Rechnungsvorlagen
Erstellen Sie Vorlagen für wiederkehrende Rechnungen:
1. Erstellen Sie eine Rechnung
2. Speichern Sie als **Vorlage**
3. Vergeben Sie einen Namen (z.B. "Standardberatung")
4. Nutzen Sie die Vorlage für schnelle Rechnungserstellung

## 3.4 Dokumente (/documents)

Zentrale Dokumentenverwaltung:

### Dokumente aller Kunden
- **Übersicht** über alle hochgeladenen Dokumente
- **Filter** nach Kunde, Kategorie, Datum
- **Suchfunktion** nach Dokumentennamen

### Dokument prüfen
1. Öffnen Sie das Dokument
2. **Prüfen** Sie auf:
   - Vollständigkeit
   - Lesbarkeit
   - Aktualität
   - Richtigkeit
3. Setzen Sie den Status:
   - ✅ **Akzeptiert** - Dokument ist OK
   - ❌ **Abgelehnt** - Dokument entspricht nicht Anforderungen (Grund angeben)
   - ⚠️ **Nachbesserung** - Kleinere Änderungen nötig

### Dokumente anfordern
Sie können fehlende Dokumente nachfordern:
1. Wählen Sie den **Kunden**
2. Klicken Sie auf **"Dokument anfordern"**
3. Wählen Sie die **Dokumentenkategorie**
4. Optional: **Beschreibung** hinzufügen
5. Kunde erhält automatisch eine **E-Mail-Benachrichtigung**

## 3.5 Verträge (/admin/contracts)

Vertragsverwaltung für alle Kunden:

### Vertrag aus Vorlage erstellen
1. Klicken Sie auf **"Neuer Vertrag"**
2. Wählen Sie die **Vertragsvorlage**
3. Wählen Sie den **Kunden**
4. Das System füllt automatisch:
   - Kundendaten
   - Adresse
   - Finanzierungsdetails aus Onboarding
5. **Prüfen und anpassen** Sie die Vertragsdaten
6. Klicken Sie auf **"Vertrag erstellen"**
7. Status: **"Entwurf"**

### Vertrag zur Unterschrift freigeben
1. Öffnen Sie den Vertrag im Status **"Entwurf"**
2. **Prüfen** Sie alle Inhalte
3. Klicken Sie auf **"Zur Unterschrift freigeben"**
4. Kunde erhält **E-Mail-Benachrichtigung**
5. Status wechselt auf **"Zur Unterschrift"**

### Vertragsstatus
| Status | Bedeutung |
|--------|-----------|
| **Entwurf** | In Bearbeitung, nicht für Kunde sichtbar |
| **Zur Unterschrift** | Warten auf Unterschrift des Kunden |
| **Unterschrieben** | Kunde hat unterschrieben, warten auf interne Gegenzeichnung |
| **Aktiv** | Vollständig unterschrieben, Vertrag läuft |
| **Abgeschlossen** | Vertragslaufzeit beendet |
| **Gekündigt** | Vorzeitig beendet |

### Vertragsvorlagen (/admin/contract-templates)
Erstellen und verwalten Sie Vertragsvorlagen:
- **Beratungsvertrag**
- **Maklervertrag**
- **Vollmacht**
- **Datenschutzvereinbarung**
- **Individual-Verträge**

Jede Vorlage unterstützt **Platzhalter**:
- \`{‌{kunde.name}}\` - Name des Kunden
- \`{‌{kunde.adresse}}\` - Adresse
- \`{‌{finanzierung.betrag}}\` - Darlehenssumme
- \`{‌{datum}}\` - Aktuelles Datum
- Und viele mehr...

## 3.6 Nachrichten (/admin/messages)

Zentrale Kommunikation mit allen Kunden:

### Nachrichtenübersicht
- **Alle Konversationen** auf einen Blick
- **Ungelesene Nachrichten** hervorgehoben
- **Filter** nach Kunde, Datum, Status
- **Suche** in allen Nachrichten

### Nachricht senden
1. Wählen Sie den **Kunden** oder öffnen Sie eine bestehende Konversation
2. Verfassen Sie Ihre **Nachricht**
3. Optional: **Dateien anhängen** (max. 10 MB)
4. **Senden**
5. Kunde erhält **E-Mail-Benachrichtigung**

### Nachrichtenvorlagen
Nutzen Sie Vorlagen für häufige Antworten:
- "Dokumentenanforderung"
- "Terminbestätigung"
- "Rückfrage zu Finanzierungsdetails"
- "Absage"
- "Angebotszusendung"

### Konversationen zuweisen
Weisen Sie Konversationen Kollegen zu:
1. Öffnen Sie die Konversation
2. Klicken Sie auf **"Zuweisen"**
3. Wählen Sie einen **Berater**
4. Der zugewiesene Berater erhält eine **Benachrichtigung**

### Nachrichtenstatus
- **Ungelesen** - Neue Nachricht vom Kunden
- **Gelesen** - Nachricht wurde angesehen
- **Beantwortet** - Antwort wurde gesendet
- **Archiviert** - Konversation ist abgeschlossen
    `
  },
  {
    id: "benutzerverwaltung",
    title: "4. Benutzerverwaltung (Admin)",
    icon: <Users className="w-4 h-4" />,
    content: `
## 4.1 Benutzerübersicht (/admin/users)

Verwaltung aller Benutzer im System:

### Benutzerrollen

Das System kennt 4 Rollen mit unterschiedlichen Berechtigungen:

| Rolle | Berechtigungen | Typischer Anwendungsfall |
|-------|----------------|--------------------------|
| **superadmin** | Vollzugriff auf ALLE Funktionen, Systemkonfiguration, User zu Admins machen | Geschäftsführung, IT |
| **tenant_admin** | Verwaltung eines Mandanten, Benutzer anlegen/bearbeiten, CRM, Berichte | Führungskraft |
| **staff** | Bearbeitung von Leads, Deals, Dokumenten, keine Systemeinstellungen | Berater, Sachbearbeiter |
| **client** | Standardbenutzer, kann nur eigene Daten einsehen und bearbeiten | Kunde |

## 4.2 Aktuelle Superadmins

| Name | E-Mail | Seit |
|------|--------|------|
| Thomas Gross | grossdigitalpartner@gmail.com | 2024-11-01 |
| Charlotte Herr | c.herr@angelus.group | 2024-11-15 |
| Brigitte Brendel | b.brendel@angelus.group | 2024-11-15 |

## 4.3 Benutzer anzeigen

In der Benutzerverwaltung sehen Sie alle registrierten Benutzer:

- **Name und E-Mail** - Identifikation
- **Rolle** - superadmin, tenant_admin, staff, client
- **Status** - Aktiv, Inaktiv
- **Letzter Login** - Wann war der User zuletzt aktiv?
- **Registrierungsdatum** - Wann wurde das Konto erstellt?
- **Onboarding** - Abgeschlossen oder in Bearbeitung?

### Filter und Suche
- Nach **Rolle** filtern
- Nach **Status** filtern
- Nach **Name/E-Mail** suchen
- **Sortieren** nach Login, Registrierung, Name

## 4.4 Benutzer bearbeiten

So ändern Sie Benutzereinstellungen:

1. Klicken Sie auf den **Benutzer** in der Liste
2. Wählen Sie **"Bearbeiten"**
3. Ändern Sie die gewünschten Felder:
   - **Name** - Vor- und Nachname
   - **E-Mail** - Kontakt-E-Mail
   - **Rolle** - Berechtigungsstufe (siehe unten)
   - **Status** - Aktiv/Inaktiv
   - **Telefonnummer** - Kontaktdaten
4. Klicken Sie auf **"Speichern"**

> **Wichtig:** Rollen-Änderungen werden sofort wirksam. Der Benutzer muss sich ggf. neu einloggen.

## 4.5 Benutzer zum Superadmin machen

**Methode 1: Via Terminal (empfohlen)**

Öffnen Sie das Terminal und führen Sie aus:

\`\`\`bash
cd ~/Downloads/immorefi-portal

DATABASE_URL="<IHRE_DATABASE_URL>" npx tsx scripts/set-admin.ts email@example.com
\`\`\`

Ersetzen Sie:
- \`<IHRE_DATABASE_URL>\` mit der Verbindungs-URL aus Railway
- email@example.com mit der E-Mail des Users

**Methode 2: Via Railway MySQL Console**

1. Öffnen Sie das **Railway Dashboard**
2. Gehen Sie zur **MySQL Datenbank**
3. Öffnen Sie die **Query Console**
4. Führen Sie dieses SQL aus:

\`\`\`sql
UPDATE users
SET role = 'superadmin', onboardingCompleted = 1
WHERE email = 'email@example.com';
\`\`\`

5. Prüfen Sie die Änderung:

\`\`\`sql
SELECT id, name, email, role FROM users WHERE email = 'email@example.com';
\`\`\`

> **Sicherheitshinweis:** Vergeben Sie die Superadmin-Rolle nur an vertrauenswürdige Personen. Superadmins haben vollständigen Zugriff auf alle Daten und Funktionen!

## 4.6 Neuen Benutzer einladen

So laden Sie einen neuen Benutzer ein:

1. Klicken Sie auf **"Benutzer einladen"**
2. Geben Sie die **E-Mail-Adresse** ein
3. Wählen Sie die **Rolle** (client, staff, tenant_admin)
4. Optional: **Persönliche Nachricht** hinzufügen
5. Klicken Sie auf **"Einladung senden"**
6. Der Benutzer erhält eine E-Mail mit:
   - Link zur Registrierung
   - Temporäres Passwort (muss beim ersten Login geändert werden)
   - Informationen zu seinen Berechtigungen

## 4.7 Benutzer deaktivieren/löschen

### Benutzer deaktivieren (empfohlen)
Um einen Benutzer vorübergehend zu deaktivieren:

1. Öffnen Sie den Benutzer
2. Setzen Sie Status auf **"Inaktiv"**
3. Der User kann sich nicht mehr einloggen
4. **Alle Daten bleiben erhalten**
5. Kann jederzeit wieder aktiviert werden

### Benutzer löschen (Vorsicht!)
Zum dauerhaften Löschen eines Benutzers:

1. Öffnen Sie den Benutzer
2. Klicken Sie auf **"Löschen"**
3. **Bestätigen** Sie die Sicherheitsabfrage
4. ⚠️ **Alle Daten des Benutzers werden gelöscht:**
   - Persönliche Daten
   - Hochgeladene Dokumente
   - Nachrichten
   - Verträge
   - Onboarding-Daten

> **Wichtig:** Löschen Sie Benutzer nur, wenn Sie sicher sind! Aus Compliance-Gründen sollten Benutzerdaten in der Regel nur deaktiviert, nicht gelöscht werden.

## 4.8 Audit-Log (/admin/audit)

Überwachung aller Benutzer-Aktivitäten:

### Was wird protokolliert?
- **Anmeldungen** - Erfolgreiche und fehlgeschlagene Logins
- **Datenänderungen** - CREATE, UPDATE, DELETE Operationen
- **Dokument-Uploads** - Wer hat was hochgeladen?
- **Rollen-Änderungen** - Wer hat welche Rolle erhalten?
- **Admin-Aktionen** - Alle administrativen Eingriffe

### Log-Einträge einsehen
Jeder Log-Eintrag enthält:

| Feld | Beschreibung |
|------|--------------|
| **Zeitstempel** | Wann ist das Ereignis eingetreten? |
| **Benutzer** | Wer hat die Aktion ausgeführt? |
| **Aktion** | Was wurde getan? (LOGIN, CREATE, UPDATE, DELETE) |
| **Ressource** | Welches Objekt war betroffen? (users, documents, contracts) |
| **Details** | Zusätzliche Informationen (JSON) |
| **IP-Adresse** | Von wo kam die Anfrage? |
| **User-Agent** | Welcher Browser wurde verwendet? |

### Filteroptionen
- **Zeitraum** - Von/Bis Datum
- **Benutzer** - Bestimmter User
- **Aktionstyp** - LOGIN, CREATE, UPDATE, DELETE
- **Ressource** - users, documents, contracts, etc.
- **IP-Adresse** - Zugriffe von bestimmter IP

### Export
1. Wählen Sie die **Filter**
2. Klicken Sie auf **"Exportieren"**
3. Wählen Sie das **Format** (CSV oder Excel)
4. Download startet automatisch

> **Compliance:** Audit-Logs werden 90 Tage gespeichert und dann archiviert. Sie sind wichtig für Datenschutz-Audits und Sicherheitsüberprüfungen.
    `
  },
  {
    id: "logo-verwaltung",
    title: "5. Logo-Verwaltung (Admin)",
    icon: <ImageIcon className="w-4 h-4" />,
    content: `
## 5.1 Logo-System (/admin/logos)

Das Logo-Verwaltungssystem ermöglicht die zentrale Verwaltung von Partner-Logos, Presse-Erwähnungen, Mitgliedschaften und Auszeichnungen für die Landingpage.

### Kategorien

| Kategorie | Verwendung | Beispiele |
|-----------|------------|-----------|
| **Presse** | Presse-Erwähnungen und Medienberichte | FOCUS, Forbes, Handelsblatt |
| **Mitgliedschaft** | Verbände und Organisationen | Swiss Startup Association, BAND |
| **Auszeichnung** | Zertifikate und Awards | diind - Unternehmen der Zukunft |
| **Partner** | Geschäftspartner und Kooperationen | Banken, Versicherungen |

## 5.2 Logo hinzufügen

So fügen Sie ein neues Logo hinzu:

1. Klicken Sie auf **"Neues Logo"**
2. Füllen Sie die Felder aus:
   - **Name*** - Name des Partners/der Organisation
   - **Kategorie*** - Wählen Sie: Presse, Mitgliedschaft, Auszeichnung, Partner
   - **Bild-URL*** - Vollständige URL zum Logo-Bild
   - **Link-URL** (optional) - Ziel-URL beim Klick auf das Logo
   - **Sortierung** - Reihenfolge (niedrigere Zahlen zuerst)
   - **Aktiv** - Soll das Logo angezeigt werden?
3. **Vorschau** prüfen
4. Klicken Sie auf **"Erstellen"**

### Logo-Anforderungen
- **Format:** PNG mit transparentem Hintergrund (empfohlen) oder JPG
- **Größe:** Optimal 200-400px Breite, Höhe variabel
- **Dateigröße:** Möglichst klein (< 100 KB) für schnelle Ladezeiten
- **Hosting:** Logo muss extern gehostet sein (z.B. auf Wikipedia, Unternehmens-Website, oder Cloud-Storage)

> **Tipp:** Für Logos ohne öffentliche URL können Sie einen Cloud-Storage wie Cloudinary, ImgBB oder direkt Railway's File-Storage verwenden.

## 5.3 Logo bearbeiten

So bearbeiten Sie ein bestehendes Logo:

1. Öffnen Sie den entsprechenden **Tab** (Presse, Mitgliedschaften, etc.)
2. Klicken Sie auf das **Bearbeiten-Icon** (Stift) beim Logo
3. Ändern Sie die gewünschten Felder
4. Prüfen Sie die **Vorschau**
5. Klicken Sie auf **"Aktualisieren"**

### Sortierung ändern
Sie können Logos durch Änderung der **Sortierung**-Nummer neu anordnen:
- **Sortierung 1** = Wird als erstes angezeigt
- **Sortierung 2** = Wird als zweites angezeigt
- usw.

> **Hinweis:** Die Drag & Drop-Funktion zur direkten Neuordnung ist für ein zukünftiges Update geplant.

## 5.4 Logo deaktivieren/löschen

### Deaktivieren (empfohlen)
Um ein Logo vorübergehend auszublenden:
1. Bearbeiten Sie das Logo
2. Deaktivieren Sie den Schalter **"Aktiv"**
3. Das Logo wird nicht mehr auf der Landingpage angezeigt
4. Kann jederzeit wieder aktiviert werden

### Löschen
Um ein Logo dauerhaft zu entfernen:
1. Klicken Sie auf das **Löschen-Icon** (Mülltonne)
2. Bestätigen Sie die Sicherheitsabfrage
3. Logo wird permanent gelöscht

> **Achtung:** Gelöschte Logos können nicht wiederhergestellt werden!

## 5.5 Anzeige auf der Landingpage

Die Logos werden automatisch auf der Startseite angezeigt:

### Presse-Logos
- **Position:** Unterhalb der Hero-Section
- **Überschrift:** "Bekannt aus der Presse"
- **Layout:** Horizontale Slider-Ansicht
- **Animation:** Sanftes Ein-/Ausblenden

### Mitgliedschaften
- **Position:** Im "Über uns"-Bereich
- **Überschrift:** "Unsere Mitgliedschaften"
- **Layout:** Grid-Layout (2-3 Spalten)

### Auszeichnungen
- **Position:** Im Footer-Bereich
- **Überschrift:** "Auszeichnungen"
- **Layout:** Zentrierte Anzeige

### Partner
- **Position:** Separate Partner-Sektion
- **Überschrift:** "Unsere Partner"
- **Layout:** Grid-Layout

## 5.6 Best Practices

### Logo-Qualität
- Verwenden Sie **hochauflösende Logos** für scharfe Darstellung
- **Transparenter Hintergrund** (PNG) für bessere Integration
- **Einheitliche Größen** pro Kategorie für harmonisches Gesamtbild

### Link-URLs
- Verlinken Sie auf **relevante Artikel** oder **Partnerseiten**
- Verwenden Sie **https://** für sichere Verbindungen
- Prüfen Sie Links regelmäßig auf **Gültigkeit**

### Organisation
- Vergeben Sie **aussagekräftige Namen**
- Nutzen Sie die **Sortierung** für strategische Anordnung (wichtigste zuerst)
- Deaktivieren Sie **veraltete Logos** statt sie zu löschen

## 5.7 Technische Details

### Datenbank-Schema
Die Logos werden in der Tabelle partner_logos gespeichert mit folgenden Feldern:
- id - Eindeutige ID
- name - Name des Partners
- category - Kategorie (presse, mitgliedschaft, auszeichnung, partner)
- imageUrl - URL zum Logo-Bild
- linkUrl - Optionaler Link
- sortOrder - Reihenfolge
- isActive - Aktiv/Inaktiv
- createdAt - Erstellungsdatum
- updatedAt - Letzte Änderung

### API-Endpunkt
Die Logos werden über den tRPC-Router abgerufen:
- partnerLogo.listAll - Alle Logos
- partnerLogo.listByCategory - Logos einer Kategorie
- partnerLogo.create - Neues Logo erstellen
- partnerLogo.update - Logo aktualisieren
- partnerLogo.delete - Logo löschen

### Seeding
Initiale Logos können über das Seed-Script eingefügt werden:
\`\`\`bash
npm run seed:logos
\`\`\`
    `
  },
  {
    id: "systemeinstellungen",
    title: "6. Systemeinstellungen (Admin)",
    icon: <Settings className="w-4 h-4" />,
    content: `
## 6.1 Allgemeine Einstellungen (/admin/settings)

Zentrale Konfiguration des Systems:

### Firmendaten
- **Firmenname** - "Angelus Management Beratung und Service GmbH"
- **Logo** - Firmenlogo (PNG, max. 2 MB)
- **Adresse** - Vollständige Geschäftsadresse
- **Kontaktdaten** - Telefon, E-Mail, Website
- **Steuernummer** - Für Rechnungen
- **USt-IdNr.** - Umsatzsteuer-Identifikationsnummer

### E-Mail-Konfiguration
- **Absender-Name** - Wird in E-Mails angezeigt
- **Absender-E-Mail** - no-reply@immorefi.com
- **Reply-To-E-Mail** - support@angelus.group
- **E-Mail-Signatur** - Standard-Signatur für System-E-Mails

### Währung & Formate
- **Standardwährung** - EUR
- **Datumsformat** - DD.MM.YYYY (Deutsch)
- **Zeitformat** - 24h
- **Zeitzone** - Europe/Berlin

## 6.2 E-Mail-Vorlagen

Passen Sie automatische E-Mails an:

### Verfügbare Vorlagen
| Vorlage | Trigger | Anpassbar |
|---------|---------|-----------|
| **Willkommens-E-Mail** | Nach Einladung/Registrierung | ✅ Ja |
| **Onboarding-Erinnerung** | Onboarding nicht abgeschlossen | ✅ Ja |
| **Terminbestätigung** | Termin gebucht | ✅ Ja |
| **Terminerinnerung** | 24h vor Termin | ✅ Ja |
| **Dokumentenanforderung** | Admin fordert Dokument an | ✅ Ja |
| **Vertrag bereit** | Vertrag zur Unterschrift | ✅ Ja |
| **Rechnung erstellt** | Neue Rechnung | ✅ Ja |
| **Zahlungserinnerung** | Rechnung überfällig | ✅ Ja |
| **Passwort zurücksetzen** | Passwort vergessen | ❌ Nein (System) |

### E-Mail-Vorlage bearbeiten
1. Wählen Sie die **Vorlage**
2. Bearbeiten Sie:
   - **Betreff** - E-Mail-Betreffzeile
   - **Inhalt** - HTML-formatierter Text
   - **Fußzeile** - Standard-Fußzeile (Impressum, Abmelden)
3. Nutzen Sie **Variablen**:
   - \`{‌{name}}\` - Name des Empfängers
   - \`{‌{email}}\` - E-Mail-Adresse
   - \`{‌{link}}\` - Link (z.B. Onboarding, Vertrag)
   - \`{‌{termin.datum}}\` - Termindatum
   - \`{‌{termin.uhrzeit}}\` - Termin-Uhrzeit
   - \`{‌{rechnung.nummer}}\` - Rechnungsnummer
   - \`{‌{rechnung.betrag}}\` - Rechnungsbetrag
4. **Vorschau** ansehen
5. **Test-E-Mail** an sich selbst senden
6. **Speichern**

> **Hinweis:** HTML-Kenntnisse sind hilfreich, aber nicht notwendig. Die Vorlagen nutzen ein responsives E-Mail-Template.

## 6.3 Integrationen

Das Portal ist mit folgenden Diensten verbunden:

### Clerk (Authentifizierung)
- **Status:** ✅ Aktiv
- **Funktion:** Benutzer-Authentifizierung, Sign-In/Sign-Up
- **API-Keys:**
  - CLERK_SECRET_KEY - Backend
  - VITE_CLERK_PUBLISHABLE_KEY - Frontend

### Stripe (Zahlungen)
- **Status:** ✅ Aktiv
- **Funktion:** Zahlungsabwicklung im Shop
- **API-Keys:**
  - STRIPE_SECRET_KEY - Backend
  - VITE_STRIPE_PUBLISHABLE_KEY - Frontend
- **Webhooks:** Automatische Benachrichtigung bei Zahlungen

### Resend (E-Mail-Versand)
- **Status:** ✅ Aktiv
- **Funktion:** Versand aller System-E-Mails
- **API-Key:** RESEND_API_KEY
- **Domain:** mail.immorefi.com

### GoHighLevel (CRM)
- **Status:** 🔄 In Entwicklung
- **Funktion:** CRM-Synchronisierung
- **Webhook-URL:** https://portal.immorefi.app/api/webhooks/gohighlevel

## 6.4 API-Schlüssel & Umgebungsvariablen

Die API-Schlüssel sind in Railway als Environment Variables gespeichert:

### Produktions-Umgebung (Railway)
1. Öffnen Sie das **Railway Dashboard**
2. Wählen Sie Ihr **Projekt**
3. Gehen Sie zu **Variables**
4. Hier sehen und bearbeiten Sie alle Umgebungsvariablen

### Wichtige Variablen
\`\`\`
DATABASE_URL=mysql://...
CLERK_SECRET_KEY=sk_live_...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
VITE_APP_URL=https://portal.immorefi.app
\`\`\`

> **Sicherheitshinweis:**
> - Teilen Sie API-Schlüssel NIEMALS öffentlich
> - Verwenden Sie unterschiedliche Keys für Test- und Produktionsumgebung
> - Rotieren Sie Schlüssel regelmäßig
> - Dokumentieren Sie Änderungen

## 6.5 Sicherheitseinstellungen

### Session-Einstellungen
- **Session-Dauer** - 7 Tage (Standard)
- **Inaktivitäts-Timeout** - 2 Stunden
- **Zwei-Faktor-Authentifizierung** - Optional für alle User

### Passwort-Richtlinien
- **Minimale Länge** - 8 Zeichen
- **Komplexität** - Groß-/Kleinbuchstaben, Zahl erforderlich
- **Passwort-Historie** - Letzte 5 Passwörter nicht wiederverwendbar
- **Ablauf** - Kein automatischer Ablauf (optional aktivierbar)

### IP-Whitelist (optional)
Beschränken Sie Admin-Zugriff auf bestimmte IP-Adressen:
1. Aktivieren Sie **IP-Whitelist**
2. Fügen Sie **erlaubte IPs** hinzu
3. Admin-Login nur noch von diesen IPs möglich

> **Vorsicht:** Testen Sie die IP-Whitelist zunächst nur für Test-Accounts!

## 6.6 Backup & Wartung

### Automatische Backups
- **Datenbank-Backup** - Täglich um 3:00 Uhr (UTC)
- **Aufbewahrung** - 30 Tage
- **Speicherort** - Railway Backup-System

### Manuelles Backup
So erstellen Sie ein manuelles Backup:
1. Öffnen Sie **Railway Dashboard**
2. Gehen Sie zur **MySQL Datenbank**
3. Klicken Sie auf **"Create Backup"**
4. Download des Backups: **"Download Backup"**

### Wartungsmodus
Bei größeren Updates können Sie einen Wartungsmodus aktivieren:
1. Gehen Sie zu **Einstellungen** > **Wartung**
2. Aktivieren Sie **"Wartungsmodus"**
3. Setzen Sie eine **Wartungsnachricht**
4. Alle Benutzer (außer Superadmins) sehen die Wartungsseite

## 6.7 Audit-Log (/admin/audit)

Überwachung aller System-Aktivitäten:

### Was wird protokolliert?
- **Benutzer-Logins** - Erfolgreiche und fehlgeschlagene Anmeldungen
- **Datenänderungen** - CREATE, UPDATE, DELETE Operationen
- **Admin-Aktionen** - Alle administrativen Eingriffe
- **API-Zugriffe** - Externe API-Calls
- **Fehler** - System-Fehler und Warnungen

### Log-Aufbewahrung
- **Aktive Logs** - 90 Tage online verfügbar
- **Archivierte Logs** - Bis zu 7 Jahre (Compliance)
- **Export** - Jederzeit als CSV/Excel

### Log-Analyse
Nutzen Sie das Audit-Log für:
- **Sicherheitsüberprüfungen** - Verdächtige Aktivitäten erkennen
- **Compliance-Audits** - DSGVO-Nachweise
- **Fehlersuche** - Probleme nachvollziehen
- **Nutzungsanalyse** - Wie wird das System genutzt?
    `
  },
  {
    id: "faq",
    title: "FAQ & Häufige Fragen",
    icon: <HelpCircle className="w-4 h-4" />,
    content: `
## Allgemeine Fragen

### Wie melde ich mich an?
Gehen Sie zu **portal.immorefi.app** und geben Sie Ihre E-Mail und Passwort ein. Bei der ersten Anmeldung werden Sie durch das Onboarding geführt.

### Ich habe mein Passwort vergessen
Klicken Sie auf "Passwort vergessen?" auf der Login-Seite. Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen.

### Kann ich das Portal auch mobil nutzen?
Ja! Das Portal ist vollständig responsiv und funktioniert auf Smartphones und Tablets.

### Wie sicher sind meine Daten?
Ihre Daten werden mit SSL-Verschlüsselung übertragen und verschlüsselt gespeichert. Das Portal ist DSGVO-konform.

## Onboarding & Profil

### Muss ich das Onboarding sofort abschließen?
Nein, Sie können das Onboarding jederzeit unterbrechen. Ihre Daten werden automatisch gespeichert.

### Kann ich meine Daten nachträglich ändern?
Ja, unter **Einstellungen** > **Profil** können Sie alle Daten jederzeit ändern.

### Was passiert, wenn ich falsche Daten angebe?
Wir prüfen alle Daten. Bei Unstimmigkeiten meldet sich Ihr Berater bei Ihnen.

## Termine

### Wie lange im Voraus kann ich einen Termin buchen?
Sie können bis zu 3 Monate im Voraus buchen.

### Kann ich einen Termin verschieben?
Ja, bis 24 Stunden vor dem Termin können Sie kostenlos verschieben oder absagen.

### Was passiert, wenn ich einen Termin verpasse?
Bitte informieren Sie uns rechtzeitig. Bei wiederholtem No-Show behalten wir uns vor, eine Bearbeitungsgebühr zu erheben.

### Wie funktioniert der Video-Call?
Sie erhalten 15 Minuten vor dem Termin eine E-Mail mit dem Zoom/Teams-Link. Klicken Sie einfach darauf.

## Dokumente

### Welche Dokumente muss ich hochladen?
Die benötigten Dokumente sehen Sie in Ihrem Dashboard unter "Fehlende Dokumente". Typischerweise:
- Einkommensnachweise (letzte 3 Gehaltsabrechnungen)
- Personalausweis (Vorder- und Rückseite)
- Grundbuchauszug
- Bestehende Darlehensverträge

### Wie groß dürfen Dokumente sein?
Maximal 10 MB pro Datei. Größere Dateien bitte komprimieren oder aufteilen.

### Was sind akzeptierte Formate?
PDF, JPG, PNG, DOC, DOCX, XLS, XLSX

### Kann ich ein Dokument wieder löschen?
Dokumente im Status "Hochgeladen" können Sie löschen. Geprüfte Dokumente können nur durch einen Administrator gelöscht werden.

## Verträge

### Ist die digitale Unterschrift rechtsgültig?
Ja, die digitale Unterschrift ist gemäß eIDAS-Verordnung rechtlich gleichwertig mit einer handschriftlichen Unterschrift.

### Kann ich einen unterschriebenen Vertrag noch ändern?
Nein, nach der Unterschrift ist der Vertrag bindend. Bei Änderungswünschen wenden Sie sich an Ihren Berater.

### Erhalte ich eine Kopie des Vertrags?
Ja, Sie erhalten automatisch eine PDF-Kopie per E-Mail und können jederzeit im Portal auf den Vertrag zugreifen.

## Bestellungen & Rechnungen

### Welche Zahlungsmethoden werden akzeptiert?
Kreditkarte (Visa, Mastercard), SEPA-Lastschrift, PayPal, Überweisung

### Wann wird abgebucht?
Bei Kreditkarte und PayPal sofort, bei SEPA-Lastschrift innerhalb von 3-5 Werktagen.

### Kann ich eine Rechnung stornieren?
Kontaktieren Sie uns innerhalb von 14 Tagen. Wir prüfen, ob eine Stornierung möglich ist.

### Wo finde ich meine Rechnung?
Unter **Rechnungen** im Hauptmenü. Alle Rechnungen können als PDF heruntergeladen werden.

## Kommunikation

### Wie schnell erhalte ich eine Antwort auf meine Nachricht?
In der Regel innerhalb von 24 Stunden an Werktagen.

### Kann ich auch außerhalb der Geschäftszeiten Nachrichten senden?
Ja, Sie können jederzeit Nachrichten senden. Die Antwort erfolgt am nächsten Werktag.

### Kann ich meinen Berater direkt anrufen?
Die Telefonnummer Ihres Beraters finden Sie in Ihrem Profil oder in der Terminbestätigung.

## Admin-Bereich

### Wie mache ich jemanden zum Admin?
Siehe Handbuch Kapitel 4.5 "Benutzer zum Superadmin machen". Sie benötigen Zugriff auf die Datenbank.

### Kann ich mehrere Superadmins haben?
Ja, es gibt keine Begrenzung. Aus Sicherheitsgründen sollten Sie die Anzahl aber minimal halten.

### Wie kann ich das CRM mit GoHighLevel verbinden?
Die Integration ist in Entwicklung. Kontaktieren Sie den technischen Support für Details.

### Wo finde ich die API-Dokumentation?
Die API-Dokumentation ist unter https://portal.immorefi.app/api/docs verfügbar (nach Login).

## Technische Fragen

### Welche Browser werden unterstützt?
Chrome, Firefox, Safari, Edge (jeweils aktuelle Version).

### Funktioniert das Portal offline?
Nein, Sie benötigen eine Internetverbindung.

### Warum lädt eine Seite so langsam?
Prüfen Sie Ihre Internetverbindung. Bei anhaltenden Problemen kontaktieren Sie den Support.

### Ich sehe eine Fehlermeldung
Notieren Sie die Fehlermeldung und kontaktieren Sie den Support: support@angelus.group

## Support & Kontakt

### Wie erreiche ich den Support?
- **E-Mail:** support@angelus.group
- **Telefon:** +49 (0) 123 456789 (Mo-Fr 9-17 Uhr)
- **Nachricht:** Über das Portal unter "Nachrichten"

### Gibt es eine Schulung für neue Benutzer?
Ja, wir bieten kostenlose Onboarding-Calls an. Vereinbaren Sie einen Termin über das Portal.

### Wo finde ich Tutorials?
Video-Tutorials finden Sie auf unserem YouTube-Kanal und im Handbuch-Bereich.

### Kann ich Feature-Wünsche einreichen?
Ja! Senden Sie Ihre Ideen an support@angelus.group. Wir prüfen alle Vorschläge.
    `
  }
];

export default function AdminHandbuch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("anwender");
  const [activeChapter, setActiveChapter] = useState("erste-schritte");

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

  const handlePrint = () => {
    window.print();
  };

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b p-4 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">ImmoRefi Portal - Benutzerhandbuch</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Version 2.0 | Stand: 13. Januar 2026
            </p>
          </div>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
        </div>

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
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setActiveChapter(v === "anwender" ? "erste-schritte" : "admin-uebersicht"); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="anwender">Anwenderhandbuch</TabsTrigger>
            <TabsTrigger value="admin">Administratorhandbuch</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block p-8 border-b">
        <h1 className="text-3xl font-bold mb-2">ImmoRefi Portal - Benutzerhandbuch</h1>
        <p className="text-lg text-gray-600">Version 2.0 | Stand: 13. Januar 2026</p>
        <p className="text-sm text-gray-500 mt-2">
          {activeTab === "anwender" ? "Anwenderhandbuch" : "Administratorhandbuch"}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Table of Contents */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto print:hidden">
          <div className="p-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase mb-3">Inhaltsverzeichnis</h3>
            <nav className="space-y-1">
              {filteredKapitel.map((kapitel) => (
                <button
                  key={kapitel.id}
                  onClick={() => setActiveChapter(kapitel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeChapter === kapitel.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {kapitel.icon}
                  <span className="text-left">{kapitel.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-4xl mx-auto print:max-w-none">
            {activeContent ? (
              <div>
                {/* Chapter Title */}
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    {activeContent.icon}
                    <h1 className="text-2xl font-bold">{activeContent.title}</h1>
                  </div>
                </div>

                {/* Chapter Content */}
                <div
                  className="prose prose-sm max-w-none
                    prose-headings:text-gray-900
                    prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:scroll-mt-20
                    prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:text-gray-600 prose-li:my-1
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-table:text-sm prose-table:border-collapse prose-table:w-full
                    prose-thead:bg-gray-100
                    prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-gray-300 prose-th:font-semibold
                    prose-td:p-3 prose-td:border prose-td:border-gray-300
                    prose-tr:border-b
                    prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-gray-800 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:not-italic prose-blockquote:my-4
                    print:prose-h2:text-lg print:prose-h3:text-base"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(activeContent.content)
                      .replace(/\n/g, '<br>')
                      .replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
                      .replace(/## (.*?)(<br>|$)/g, '<h2 id="$1">$1</h2>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\`\`\`(\w+)?\n?([\s\S]*?)\`\`\`/g, '<pre><code>$2</code></pre>')
                      .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
                      .replace(/> \*\*(.*?)\*\* (.*?)(<br>|$)/g, '<blockquote><strong>$1</strong> $2</blockquote>')
                      .replace(/> (.*?)(<br>|$)/g, '<blockquote>$1</blockquote>')
                      .replace(/^- (.*?)(<br>|$)/gm, '<li>$1</li>')
                      .replace(/^(\d+)\. (.*?)(<br>|$)/gm, '<li>$2</li>')
                      .replace(/(<li>.*?<\/li>)/gs, (match) => {
                        if (!match.includes('<ul>') && !match.includes('<ol>')) {
                          const isNumbered = match.match(/^\d+\./);
                          return isNumbered ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
                        }
                        return match;
                      })
                      .replace(/\| (.*?) \|/g, (match) => {
                        const cells = match.split('|').filter(c => c.trim());
                        const isHeader = match.includes('|---') || match.includes('|--');
                        if (isHeader) return '';
                        const tag = cells.every(c => /^[\w\s]+$/.test(c)) ? 'th' : 'td';
                        return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
                      })
                      .replace(/(<tr>.*?<\/tr>)+/gs, (match) => {
                        const hasHeader = match.includes('<th>');
                        if (hasHeader) {
                          const rows = match.match(/<tr>.*?<\/tr>/g) || [];
                          const headerRow = rows[0];
                          const bodyRows = rows.slice(1).join('');
                          return `<table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
                        }
                        return `<table><tbody>${match}</tbody></table>`;
                      })
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Ergebnisse für "{searchQuery}"</p>
                <p className="text-sm mt-2">Versuchen Sie einen anderen Suchbegriff</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            font-size: 10pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          h2 {
            page-break-after: avoid;
          }
          table {
            page-break-inside: avoid;
          }
          pre {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
