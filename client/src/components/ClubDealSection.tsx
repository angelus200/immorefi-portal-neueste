/**
 * ClubDealSection — Landing Page Sektion für das Club Deal Paket
 * Design-Pattern: identisch mit #leistungen (Cards mit hover-Effekt, gleiche Abstände)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, Layers, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const advantages = [
  {
    icon: Users,
    title: "Investoren-Netzwerk",
    description:
      "Zugang zu 633 institutionellen und professionellen Investoren im DACH-Raum — selektiert nach Immobilien-Expertise und Investitionsbereitschaft.",
  },
  {
    icon: FileText,
    title: "Komplett-Paket",
    description:
      "Pitchdeck, Businessplan, Due Diligence und Rating inklusive — alles was qualifizierte Investoren für ihre Entscheidung benötigen.",
  },
  {
    icon: Layers,
    title: "Flexible Strukturierung",
    description:
      "Nachrangdarlehen, Stille Beteiligung, Anleihe oder Genussrecht — wir wählen die optimale Struktur für Ihr Projekt.",
  },
];

const included = [
  "Projektfinanzierungsanalyse",
  "Entwicklung Investoren-Angebot",
  "Pitchdeck & Businessplan",
  "Due Diligence & Rating",
  "Ansprache von bis zu 633 DACH-Investoren",
  "Laufende Begleitung bis zur Finanzierung",
];

export function ClubDealSection() {
  return (
    <section id="club-deal" className="py-20 lg:py-32">
      <div className="container">

        {/* ─── Section Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Building2 className="h-4 w-4" />
            Club Deal Paket
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Club Deals — Exklusive{" "}
            <span className="text-primary">Projektfinanzierung</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Erreichen Sie über 633 qualifizierte DACH-Investoren für Ihr Immobilienprojekt.
            Von der Analyse bis zur Abwicklung — alles aus einer Hand.
          </p>
        </div>

        {/* ─── Vorteile-Karten ─── */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {advantages.map((item, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Paket-Details + CTA ─── */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary shadow-xl">
            <div className="grid md:grid-cols-2 gap-0">

              {/* Linke Seite: Leistungsumfang */}
              <div className="p-8 border-b md:border-b-0 md:border-r">
                <h3 className="text-xl font-bold mb-6">Leistungsumfang</h3>
                <ul className="space-y-3">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rechte Seite: Preis + CTA */}
              <div className="p-8 flex flex-col justify-between bg-primary/5">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Projektvolumen</p>
                    <p className="text-2xl font-bold mt-1">€1 Mio. bis €3 Mio.</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Paketpreis</p>
                    <p className="text-4xl font-bold text-primary mt-1">€ 11.490</p>
                    <p className="text-sm text-muted-foreground mt-1">zzgl. MwSt. + 2% Umsatzbeteiligung</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border">
                    <p className="text-xs text-muted-foreground">
                      Bis zu <strong>18 Investoren</strong> pro Projekt ·{" "}
                      <strong>Min. €100.000</strong> Einzelinvestition
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Link href="/shop">
                    <Button size="lg" className="w-full group">
                      Club Deal anfragen
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/booking">
                    <Button size="lg" variant="outline" className="w-full">
                      Erstberatung buchen
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── Rechtlicher Hinweis ─── */}
        <p className="text-xs text-center text-muted-foreground max-w-3xl mx-auto mt-8">
          Der Auftragnehmer erbringt ausschließlich strukturierende und analytische Leistungen.
          Die Investorenplatzierung erfolgt durch lizenzierte Partner.
        </p>
      </div>
    </section>
  );
}
