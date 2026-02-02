import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AGB() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <img src="/images/logos/non-dom-group-logo.webp" alt="Non Dom Group" className="h-10" />
          </Link>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Startseite
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>

        <div className="prose prose-lg max-w-none space-y-8">

          {/* Firma */}
          <section>
            <div className="bg-muted/30 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-3">Marketplace24-7 GmbH</h2>
              <p className="mb-2">
                Kantonsstrasse 1<br />
                8807 Freienbach SZ<br />
                Schweiz
              </p>
              <p className="mb-2">
                <strong>Handelsregister:</strong> CH-130.4.033.363-2, Kanton Schwyz
              </p>
              <p>
                <strong>E-Mail:</strong> info@non-dom.group
              </p>
            </div>
          </section>

          {/* § 1 Geltungsbereich */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 1 Geltungsbereich</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Beratungsleistungen der Marketplace24-7 GmbH gegenüber ihren Kunden.</li>
              <li>Mit der Beauftragung akzeptiert der Kunde diese AGB als verbindlichen Vertragsbestandteil.</li>
              <li>Abweichende Bedingungen des Kunden werden nur wirksam, wenn sie von uns ausdrücklich schriftlich anerkannt werden.</li>
              <li>Diese AGB gelten auch für alle zukünftigen Geschäftsbeziehungen, auch wenn sie nicht nochmals ausdrücklich vereinbart werden.</li>
            </ol>
          </section>

          {/* § 2 Vertragsgegenstand */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 2 Vertragsgegenstand</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Gegenstand unserer Tätigkeit ist die Unternehmensberatung in den Bereichen Immobilien-Refinanzierung, Portfolio-Strukturierung und Kapitalmarktberatung.</li>
              <li>Wir beraten insbesondere bei der Optimierung von Immobilienfinanzierungen, Portfolioanalysen und der Strukturierung von Kapitalmarktprodukten.</li>
              <li>Unsere Beratungsleistungen umfassen keine Rechtsberatung im Sinne des Anwaltsgesetzes und keine Steuerberatung im Sinne des Steuerberatungsgesetzes. Bei Bedarf empfehlen wir die Hinzuziehung entsprechender Fachberater.</li>
              <li>Der konkrete Leistungsumfang ergibt sich aus dem jeweiligen Angebot bzw. Auftrag.</li>
            </ol>
          </section>

          {/* § 3 Leistungsumfang */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 3 Leistungsumfang</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Unsere Beratungsleistungen umfassen insbesondere:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Analyse von Immobilienportfolios und Finanzierungsstrukturen</li>
                  <li>Bewertung von Refinanzierungsmöglichkeiten und Optimierungspotentialen</li>
                  <li>Erstellung von Refinanzierungskonzepten und Strukturierungsempfehlungen</li>
                  <li>Beratung zur Strukturierung von Kapitalmarktprodukten (CLN, Anleihen, Fonds)</li>
                  <li>Begleitung bei der Umsetzung und Kapitalakquise (optional)</li>
                </ul>
              </li>
              <li>Wir erbringen unsere Leistungen nach bestem Wissen und Gewissen auf Grundlage der uns zur Verfügung gestellten Informationen.</li>
              <li>Änderungen oder Erweiterungen des vereinbarten Leistungsumfangs bedürfen der schriftlichen Vereinbarung und werden gesondert vergütet.</li>
            </ol>
          </section>

          {/* § 4 Vergütung */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 4 Vergütung</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Die Vergütung erfolgt nach Aufwand (Stundensatz) oder als Pauschale gemäß dem jeweiligen Angebot.</li>
              <li>Alle Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer.</li>
              <li>Rechnungen sind innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug zur Zahlung fällig.</li>
              <li>Bei Zahlungsverzug werden Verzugszinsen in Höhe von 5% p.a. berechnet. Die Geltendmachung weiterer Schadenersatzansprüche bleibt vorbehalten.</li>
              <li>Auslagen (Reisekosten, Porto, etc.) werden gesondert in Rechnung gestellt, sofern nicht anders vereinbart.</li>
            </ol>
          </section>

          {/* § 5 Mitwirkungspflichten des Kunden */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 5 Mitwirkungspflichten des Kunden</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Der Kunde verpflichtet sich, alle für die Beratung erforderlichen Informationen vollständig, wahrheitsgemäß und rechtzeitig zur Verfügung zu stellen.</li>
              <li>Der Kunde stellt die benötigten Unterlagen (BWA, Jahresabschlüsse, Steuerbescheide, Mahnungen, etc.) in geeigneter Form zur Verfügung.</li>
              <li>Der Kunde benennt einen festen Ansprechpartner, der zur Auskunft und Entscheidung befugt ist.</li>
              <li>Verzögerungen oder Mehraufwand aufgrund mangelnder Mitwirkung des Kunden gehen zu dessen Lasten.</li>
            </ol>
          </section>

          {/* § 6 Vertraulichkeit */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 6 Vertraulichkeit</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Wir behandeln alle uns bekannt werdenden Informationen und Unterlagen streng vertraulich.</li>
              <li>Eine Weitergabe an Dritte erfolgt nur mit ausdrücklicher Zustimmung des Kunden oder soweit dies zur Vertragserfüllung erforderlich ist (z.B. Einschaltung von Fachberatern).</li>
              <li>Die Vertraulichkeitspflicht besteht auch nach Beendigung des Vertragsverhältnisses fort.</li>
              <li>Ausgenommen von der Vertraulichkeitspflicht sind gesetzliche Auskunfts- und Meldepflichten.</li>
            </ol>
          </section>

          {/* § 7 Haftung */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 7 Haftung</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Wir haften für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Schäden aus vorsätzlichem oder grob fahrlässigem Verhalten unbeschränkt.</li>
              <li>Im Übrigen ist unsere Haftung auf die Höhe des für den jeweiligen Auftrag vereinbarten Beratungshonorars begrenzt.</li>
              <li>Wir übernehmen keine Gewährleistung für den wirtschaftlichen Erfolg unserer Beratung. Der Kunde bleibt für alle unternehmerischen Entscheidungen selbst verantwortlich.</li>
              <li>Schadenersatzansprüche verjähren nach einem Jahr ab Kenntnis des Schadens und der Person des Schädigers.</li>
            </ol>
          </section>

          {/* § 8 Kündigung */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 8 Kündigung</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Beide Vertragsparteien können das Vertragsverhältnis aus wichtigem Grund jederzeit ohne Einhaltung einer Frist kündigen.</li>
              <li>Eine ordentliche Kündigung ist mit einer Frist von 14 Tagen zum Monatsende möglich.</li>
              <li>Kündigungen bedürfen der Schriftform (E-Mail genügt).</li>
              <li>Bei Kündigung durch den Kunden bleibt der Vergütungsanspruch für bereits erbrachte Leistungen bestehen.</li>
              <li>Im Falle der Kündigung durch uns aus wichtigem Grund (z.B. fehlende Mitwirkung des Kunden) besteht ebenfalls Anspruch auf Vergütung der erbrachten Leistungen.</li>
            </ol>
          </section>

          {/* § 9 Datenschutz */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 9 Datenschutz</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Die Verarbeitung personenbezogener Daten erfolgt gemäß dem Schweizer Datenschutzgesetz (DSG) und der DSGVO.</li>
              <li>Wir verarbeiten personenbezogene Daten ausschließlich zur Erfüllung des Vertragsverhältnisses und zur Erbringung unserer Beratungsleistungen.</li>
              <li>Der Kunde hat jederzeit das Recht auf Auskunft über die gespeicherten Daten sowie auf Berichtigung, Löschung oder Einschränkung der Verarbeitung.</li>
              <li>Weitere Informationen finden Sie in unserer <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>.</li>
            </ol>
          </section>

          {/* § 10 Schiedsgerichtsklausel */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 10 Schiedsgerichtsklausel</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag, einschließlich Streitigkeiten über dessen Zustandekommen, Gültigkeit, Verletzung, Beendigung oder Nichtigkeit, werden unter Ausschluss des ordentlichen Rechtswegs durch ein Schiedsgericht endgültig entschieden.</li>
              <li>Das Schiedsverfahren findet nach den Regeln der Schweizerischen Handelskammer (Swiss Chambers' Arbitration Institution) oder des Swiss Arbitration Centre statt.</li>
              <li>Sitz des Schiedsgerichts ist Zürich, Schweiz.</li>
              <li>Die Verfahrenssprache ist Deutsch.</li>
              <li>Es gilt ausschließlich materielles Schweizer Recht unter Ausschluss des Wiener UN-Kaufrechts (CISG).</li>
              <li>Unberührt bleibt das Recht beider Parteien, im Rahmen eines Mahnverfahrens die staatlichen Gerichte anzurufen.</li>
            </ol>
          </section>

          {/* § 11 Salvatorische Klausel */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 11 Salvatorische Klausel</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt.</li>
              <li>Anstelle der unwirksamen oder undurchführbaren Bestimmung gilt eine wirksame Regelung als vereinbart, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.</li>
            </ol>
          </section>

          {/* § 12 Schlussbestimmungen */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 12 Schlussbestimmungen</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Änderungen und Ergänzungen dieser AGB sowie des Vertrages bedürfen zu ihrer Wirksamkeit der Schriftform (E-Mail genügt).</li>
              <li>Für Mahnverfahren ist der Gerichtsstand am Sitz der Marketplace24-7 GmbH in Freienbach SZ, Schweiz.</li>
              <li>Es gilt ausschließlich Schweizer Recht unter Ausschluss des Wiener UN-Kaufrechts (CISG).</li>
              <li>Erfüllungsort ist Freienbach SZ, Schweiz.</li>
            </ol>
          </section>

          {/* Stand */}
          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-muted-foreground">
              <strong>Stand:</strong> Januar 2026
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Marketplace24-7 GmbH. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-6">
              <Link href="/impressum" className="text-sm text-muted-foreground hover:text-primary">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-primary">
                Datenschutz
              </Link>
              <Link href="/agb" className="text-sm text-muted-foreground hover:text-primary">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
