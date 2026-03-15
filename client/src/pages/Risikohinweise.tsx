/**
 * Risikohinweise — Öffentliche Seite mit rechtlichen Risikohinweisen für Investoren
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

// ─── Abschnitte ───────────────────────────────────────────────────────────────

const sections = [
  {
    title: "Allgemeine Risikohinweise",
    body: "Immobilien-Investments sind mit Risiken verbunden. Ein vollständiger Verlust des eingesetzten Kapitals ist möglich. Vergangene Renditen sind kein Indikator für zukünftige Ergebnisse.",
  },
  {
    title: "Plattform-Rolle",
    body: "ImmoRefi betreibt eine SaaS-Plattform zur Zusammenführung von Projektentwicklern und professionellen Investoren. ImmoRefi ist NICHT Vertragspartei der Investition, NICHT Anlageberater, NICHT Finanzintermediär. Die Plattform stellt technische Infrastruktur zur Verfügung.",
  },
  {
    title: "Abwicklung",
    body: "Die Investitionsabwicklung erfolgt peer-to-peer direkt zwischen Anbieter und Investor. Optional kann ein regulierter Treuhänder eingeschaltet werden (zzgl. 0,5 % Transaktionskosten). ImmoRefi haftet nicht für die Abwicklung.",
  },
  {
    title: "Qualifikation",
    body: "Der Investorenbereich richtet sich ausschließlich an professionelle und qualifizierte Investoren im Sinne der anwendbaren Vorschriften. Durch die Selbstauskunft bestätigt der Investor seine Qualifikation und Erfahrung.",
  },
  {
    title: "Projektrisiken",
    body: "Jedes Projekt unterliegt individuellen Risiken (Baurisiko, Marktrisiko, Finanzierungsrisiko, regulatorisches Risiko). Die bereitgestellten Unterlagen (Due Diligence, Rating) dienen der Information und ersetzen keine eigene Prüfung.",
  },
  {
    title: "Keine Prospektpflicht",
    body: "Die Angebote sind nicht-öffentlich und richten sich an maximal 18 qualifizierte Investoren pro Projekt. Es handelt sich um Private Placements.",
  },
  {
    title: "Anwendbares Recht",
    body: "Es gilt Schweizer Recht. Gerichtsstand ist der Sitz der Gesellschaft.",
  },
];

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function Risikohinweise() {
  return (
    <div className="min-h-screen">
      {/* Öffentlicher Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <img src="/images/logos/non-dom-group-logo.webp" alt="Non Dom Group" className="h-10" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Registrieren
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Inhalt */}
      <main className="container max-w-3xl py-16 space-y-10">
        {/* Seitenüberschrift */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-4 py-1.5 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            Rechtliche Hinweise
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Risikohinweise für Investoren</h1>
          <p className="text-muted-foreground">
            Bitte lesen Sie diese Hinweise sorgfältig, bevor Sie eine Investitionsentscheidung treffen.
          </p>
        </div>

        {/* Abschnitte */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2 border-b pb-8 last:border-0">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Zurück-Link */}
        <div className="pt-4">
          <Link href="/investor">
            <Button variant="outline">Zurück zur Investoren-Seite</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
