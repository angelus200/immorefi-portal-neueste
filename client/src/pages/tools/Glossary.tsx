import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Search,
  BookOpen,
  ChevronRight,
  Info
} from "lucide-react";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  // A
  {
    term: "Annuität",
    definition: "Gleichbleibende jährliche Zahlung zur Tilgung eines Darlehens, bestehend aus Zins- und Tilgungsanteil. Die Annuität bleibt über die Laufzeit konstant, wobei sich das Verhältnis von Zins zu Tilgung verschiebt.",
    category: "Finanzierung",
    relatedTerms: ["Tilgung", "Zinssatz"]
  },
  {
    term: "Agio",
    definition: "Aufschlag auf den Nennwert eines Wertpapiers oder einer Anleihe. Bei Immobilienfonds bezeichnet das Agio den Ausgabeaufschlag.",
    category: "Kapitalmarkt",
    relatedTerms: ["Disagio", "Anleihe"]
  },
  {
    term: "Anleihe",
    definition: "Schuldverschreibung, bei der sich der Emittent zur Rückzahlung des Nennwerts und zur Zahlung von Zinsen verpflichtet. Immobilienanleihen sind durch Immobilien besichert.",
    category: "Kapitalmarkt",
    relatedTerms: ["Credit Linked Note", "Zertifikat"]
  },
  {
    term: "Asset Management",
    definition: "Professionelle Verwaltung von Vermögenswerten mit dem Ziel der Wertsteigerung und Ertragsoptimierung. Im Immobilienbereich umfasst dies die strategische Steuerung von Immobilienportfolios.",
    category: "Management"
  },
  // B
  {
    term: "Beleihungswert",
    definition: "Von der Bank ermittelter Wert einer Immobilie als Grundlage für die Kreditvergabe. Liegt in der Regel unter dem Verkehrswert und dient als Sicherheit.",
    category: "Finanzierung",
    relatedTerms: ["Beleihungsauslauf", "Verkehrswert"]
  },
  {
    term: "Beleihungsauslauf (LTV)",
    definition: "Loan-to-Value Ratio - Verhältnis zwischen Darlehenssumme und Beleihungswert der Immobilie in Prozent. Je niedriger der LTV, desto besser die Konditionen.",
    category: "Finanzierung",
    relatedTerms: ["Beleihungswert", "Eigenkapitalquote"]
  },
  {
    term: "Break-Even",
    definition: "Zeitpunkt, ab dem die Einnahmen die Kosten übersteigen. Bei Refinanzierungen der Punkt, ab dem die Einsparungen die Umschuldungskosten übersteigen.",
    category: "Analyse",
    relatedTerms: ["Refinanzierung", "ROI"]
  },
  // C
  {
    term: "Cashflow",
    definition: "Differenz zwischen Einnahmen und Ausgaben einer Immobilie. Positiver Cashflow bedeutet, dass die Mieteinnahmen alle Kosten (inkl. Finanzierung) übersteigen.",
    category: "Analyse",
    relatedTerms: ["NOI", "DSCR"]
  },
  {
    term: "Credit Linked Note (CLN)",
    definition: "Strukturiertes Wertpapier, dessen Rückzahlung an die Bonität eines Referenzschuldners gekoppelt ist. Im Immobilienbereich oft zur Refinanzierung von Portfolios eingesetzt.",
    category: "Kapitalmarkt",
    relatedTerms: ["Anleihe", "SPV"]
  },
  {
    term: "Club Deal",
    definition: "Gemeinsame Investition mehrerer institutioneller oder semi-professioneller Investoren in ein einzelnes Immobilienprojekt oder -portfolio.",
    category: "Investition",
    relatedTerms: ["Joint Venture", "SPV"]
  },
  // D
  {
    term: "DSCR (Debt Service Coverage Ratio)",
    definition: "Schuldendienstdeckungsgrad - Verhältnis zwischen Nettomieteinnahmen und Kapitaldienst (Zins + Tilgung). Ein DSCR > 1,2 gilt als solide.",
    category: "Analyse",
    relatedTerms: ["Cashflow", "NOI"]
  },
  {
    term: "Disagio",
    definition: "Abschlag vom Nennwert eines Darlehens, der die Auszahlung mindert aber steuerlich als Zinsaufwand geltend gemacht werden kann.",
    category: "Finanzierung",
    relatedTerms: ["Agio", "Effektivzins"]
  },
  {
    term: "Due Diligence",
    definition: "Sorgfältige Prüfung einer Immobilie oder eines Unternehmens vor dem Kauf. Umfasst rechtliche, technische, steuerliche und wirtschaftliche Aspekte.",
    category: "Transaktion"
  },
  // E
  {
    term: "Eigenkapitalquote",
    definition: "Anteil des Eigenkapitals am Gesamtkapital einer Investition. Höhere EK-Quote bedeutet weniger Risiko, aber auch geringeren Leverage-Effekt.",
    category: "Finanzierung",
    relatedTerms: ["Leverage", "Fremdkapital"]
  },
  {
    term: "Eigenkapitalrendite (ROE)",
    definition: "Return on Equity - Rendite bezogen auf das eingesetzte Eigenkapital. Kann durch Fremdfinanzierung (Leverage) gesteigert werden.",
    category: "Analyse",
    relatedTerms: ["Leverage", "ROI"]
  },
  {
    term: "EURIBOR",
    definition: "Euro Interbank Offered Rate - Referenzzinssatz für den europäischen Geldmarkt. Basis für variable Immobilienkredite.",
    category: "Zinsen",
    relatedTerms: ["Leitzins", "Zinsbindung"]
  },
  {
    term: "Exit-Strategie",
    definition: "Geplanter Ausstieg aus einer Immobilieninvestition durch Verkauf, Refinanzierung oder Börsengang (IPO).",
    category: "Investition"
  },
  // F
  {
    term: "Forward-Darlehen",
    definition: "Darlehen, das heute zu festgelegten Konditionen abgeschlossen wird, aber erst in der Zukunft (bis zu 60 Monate) ausgezahlt wird. Dient der Zinssicherung.",
    category: "Finanzierung",
    relatedTerms: ["Zinsbindung", "Anschlussfinanzierung"]
  },
  {
    term: "Fremdkapital",
    definition: "Geliehenes Kapital zur Finanzierung einer Investition. Im Immobilienbereich typischerweise Bankdarlehen oder Anleihen.",
    category: "Finanzierung",
    relatedTerms: ["Eigenkapital", "Leverage"]
  },
  {
    term: "Fonds",
    definition: "Kollektive Kapitalanlage, bei der Anlegergelder gebündelt und professionell verwaltet werden. Immobilienfonds investieren in Immobilien oder Immobilienunternehmen.",
    category: "Kapitalmarkt",
    relatedTerms: ["REIT", "SPV"]
  },
  // G
  {
    term: "Grundschuld",
    definition: "Dingliches Recht an einem Grundstück zur Sicherung eines Darlehens. Anders als die Hypothek ist sie nicht an eine bestimmte Forderung gebunden.",
    category: "Sicherheiten",
    relatedTerms: ["Hypothek", "Beleihungswert"]
  },
  // H
  {
    term: "Holding",
    definition: "Gesellschaft, deren Hauptzweck das Halten von Beteiligungen an anderen Unternehmen ist. Immobilienholdings bündeln oft mehrere Objektgesellschaften.",
    category: "Struktur",
    relatedTerms: ["SPV", "Konzern"]
  },
  {
    term: "Hypothek",
    definition: "Grundpfandrecht zur Sicherung einer Forderung. Im Gegensatz zur Grundschuld ist sie akzessorisch, d.h. an die Forderung gebunden.",
    category: "Sicherheiten",
    relatedTerms: ["Grundschuld", "Beleihungswert"]
  },
  // I
  {
    term: "IRR (Internal Rate of Return)",
    definition: "Interner Zinsfuß - Renditekennzahl, die den Zinssatz angibt, bei dem der Kapitalwert einer Investition null ist. Berücksichtigt den Zeitwert des Geldes.",
    category: "Analyse",
    relatedTerms: ["ROI", "NPV"]
  },
  // J
  {
    term: "Joint Venture",
    definition: "Gemeinschaftsunternehmen zweier oder mehrerer Partner für ein bestimmtes Projekt. Im Immobilienbereich oft zwischen Entwickler und Investor.",
    category: "Struktur",
    relatedTerms: ["Club Deal", "SPV"]
  },
  // K
  {
    term: "Kapitalmarkt",
    definition: "Markt für langfristige Finanzierungen durch Emission von Wertpapieren wie Aktien, Anleihen oder Zertifikaten.",
    category: "Kapitalmarkt",
    relatedTerms: ["Anleihe", "Zertifikat"]
  },
  {
    term: "KfW-Förderung",
    definition: "Staatliche Förderprogramme der Kreditanstalt für Wiederaufbau für energieeffizientes Bauen und Sanieren mit günstigen Zinsen und Tilgungszuschüssen.",
    category: "Förderung"
  },
  // L
  {
    term: "Leverage-Effekt",
    definition: "Hebelwirkung durch Fremdfinanzierung. Positiver Leverage: Gesamtrendite > Fremdkapitalzins → EK-Rendite steigt. Negativer Leverage: umgekehrt.",
    category: "Finanzierung",
    relatedTerms: ["Eigenkapitalrendite", "Fremdkapital"]
  },
  {
    term: "Leitzins",
    definition: "Von der Zentralbank (EZB) festgelegter Zinssatz, zu dem sich Geschäftsbanken refinanzieren können. Beeinflusst indirekt alle Kreditzinsen.",
    category: "Zinsen",
    relatedTerms: ["EURIBOR", "Zinspolitik"]
  },
  {
    term: "LTV (Loan-to-Value)",
    definition: "Siehe Beleihungsauslauf - Verhältnis von Darlehenssumme zu Immobilienwert.",
    category: "Finanzierung",
    relatedTerms: ["Beleihungsauslauf", "Beleihungswert"]
  },
  // M
  {
    term: "Mezzanine-Kapital",
    definition: "Hybride Finanzierungsform zwischen Eigen- und Fremdkapital. Bietet höhere Renditen als Senior Debt, aber nachrangige Besicherung.",
    category: "Finanzierung",
    relatedTerms: ["Senior Debt", "Nachrangdarlehen"]
  },
  {
    term: "Multiplikator",
    definition: "Verhältnis von Kaufpreis zu Jahresnettokaltmiete. Ein Multiplikator von 20 bedeutet, dass der Kaufpreis dem 20-fachen der Jahresmiete entspricht.",
    category: "Bewertung",
    relatedTerms: ["Rendite", "Cap Rate"]
  },
  // N
  {
    term: "Nachrangdarlehen",
    definition: "Darlehen, das im Insolvenzfall erst nach vorrangigen Gläubigern bedient wird. Höheres Risiko wird durch höhere Zinsen kompensiert.",
    category: "Finanzierung",
    relatedTerms: ["Mezzanine-Kapital", "Senior Debt"]
  },
  {
    term: "NOI (Net Operating Income)",
    definition: "Nettobetriebsergebnis - Mieteinnahmen abzüglich Bewirtschaftungskosten, aber vor Kapitaldienst und Steuern.",
    category: "Analyse",
    relatedTerms: ["Cashflow", "DSCR"]
  },
  {
    term: "NPV (Net Present Value)",
    definition: "Kapitalwert - Summe aller auf den heutigen Zeitpunkt abgezinsten zukünftigen Zahlungsströme einer Investition.",
    category: "Analyse",
    relatedTerms: ["IRR", "Diskontierung"]
  },
  // P
  {
    term: "Private Placement",
    definition: "Nicht-öffentliche Platzierung von Wertpapieren bei ausgewählten institutionellen oder qualifizierten Investoren.",
    category: "Kapitalmarkt",
    relatedTerms: ["Anleihe", "Club Deal"]
  },
  {
    term: "Prolongation",
    definition: "Verlängerung eines bestehenden Darlehens zu neuen Konditionen beim selben Kreditgeber nach Ablauf der Zinsbindung.",
    category: "Finanzierung",
    relatedTerms: ["Anschlussfinanzierung", "Umschuldung"]
  },
  // R
  {
    term: "Refinanzierung",
    definition: "Ablösung eines bestehenden Darlehens durch ein neues, oft zu besseren Konditionen. Kann auch die Aufnahme von Kapitalmarktmitteln bedeuten.",
    category: "Finanzierung",
    relatedTerms: ["Umschuldung", "Prolongation"]
  },
  {
    term: "REIT (Real Estate Investment Trust)",
    definition: "Börsennotierte Immobiliengesellschaft mit steuerlichen Vorteilen, die mindestens 90% der Gewinne ausschütten muss.",
    category: "Kapitalmarkt",
    relatedTerms: ["Fonds", "Aktie"]
  },
  {
    term: "Rendite",
    definition: "Ertrag einer Kapitalanlage in Prozent des eingesetzten Kapitals. Bei Immobilien unterscheidet man Brutto-, Netto- und Eigenkapitalrendite.",
    category: "Analyse",
    relatedTerms: ["ROI", "Eigenkapitalrendite"]
  },
  {
    term: "ROI (Return on Investment)",
    definition: "Gesamtrendite einer Investition, berechnet als Gewinn dividiert durch eingesetztes Kapital.",
    category: "Analyse",
    relatedTerms: ["IRR", "Eigenkapitalrendite"]
  },
  // S
  {
    term: "Senior Debt",
    definition: "Vorrangiges Fremdkapital mit erstrangiger Besicherung. Wird im Insolvenzfall vor nachrangigen Gläubigern bedient.",
    category: "Finanzierung",
    relatedTerms: ["Mezzanine-Kapital", "Nachrangdarlehen"]
  },
  {
    term: "SPV (Special Purpose Vehicle)",
    definition: "Zweckgesellschaft - Rechtlich eigenständige Gesellschaft, die für einen bestimmten Zweck (z.B. Halten einer Immobilie) gegründet wird.",
    category: "Struktur",
    relatedTerms: ["Holding", "Club Deal"]
  },
  {
    term: "Sondertilgung",
    definition: "Außerplanmäßige Tilgung eines Darlehens über die reguläre Rate hinaus. Oft auf einen bestimmten Prozentsatz pro Jahr begrenzt.",
    category: "Finanzierung",
    relatedTerms: ["Tilgung", "Vorfälligkeitsentschädigung"]
  },
  // T
  {
    term: "Tilgung",
    definition: "Rückzahlung des Darlehensbetrags. Bei Annuitätendarlehen steigt der Tilgungsanteil über die Laufzeit, während der Zinsanteil sinkt.",
    category: "Finanzierung",
    relatedTerms: ["Annuität", "Zinssatz"]
  },
  // U
  {
    term: "Umschuldung",
    definition: "Wechsel zu einem anderen Kreditgeber bei der Anschlussfinanzierung. Kann bessere Konditionen bieten, verursacht aber Kosten.",
    category: "Finanzierung",
    relatedTerms: ["Refinanzierung", "Prolongation"]
  },
  // V
  {
    term: "Verkehrswert",
    definition: "Marktwert einer Immobilie - der Preis, der im gewöhnlichen Geschäftsverkehr erzielt werden kann. Basis für Kaufpreisverhandlungen.",
    category: "Bewertung",
    relatedTerms: ["Beleihungswert", "Ertragswert"]
  },
  {
    term: "Vorfälligkeitsentschädigung",
    definition: "Entschädigung an die Bank bei vorzeitiger Darlehensrückzahlung für entgangene Zinsen. Kann bei Refinanzierungen erheblich sein.",
    category: "Finanzierung",
    relatedTerms: ["Refinanzierung", "Sondertilgung"]
  },
  // W
  {
    term: "WAULT (Weighted Average Unexpired Lease Term)",
    definition: "Gewichtete durchschnittliche Restmietlaufzeit - wichtige Kennzahl für die Bewertung von Gewerbeimmobilien.",
    category: "Analyse"
  },
  // Z
  {
    term: "Zertifikat",
    definition: "Strukturiertes Wertpapier, dessen Wertentwicklung an einen Basiswert gekoppelt ist. Immobilienzertifikate ermöglichen Investitionen in Immobilien ohne direkten Erwerb.",
    category: "Kapitalmarkt",
    relatedTerms: ["Anleihe", "Credit Linked Note"]
  },
  {
    term: "Zinsbindung",
    definition: "Zeitraum, für den der Zinssatz eines Darlehens festgeschrieben ist. Üblich sind 5, 10, 15 oder 20 Jahre.",
    category: "Finanzierung",
    relatedTerms: ["Zinssatz", "Anschlussfinanzierung"]
  },
  {
    term: "Zinssatz",
    definition: "Preis für geliehenes Kapital in Prozent pro Jahr. Unterschieden wird zwischen Nominal- und Effektivzins.",
    category: "Finanzierung",
    relatedTerms: ["EURIBOR", "Leitzins"]
  }
];

// Alle verfügbaren Buchstaben
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Kategorien für Filter
const categories = [...new Set(glossaryTerms.map(t => t.category))].sort();

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // Gefilterte Begriffe
  const filteredTerms = useMemo(() => {
    return glossaryTerms
      .filter(term => {
        // Suchfilter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            term.term.toLowerCase().includes(query) ||
            term.definition.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(term => {
        // Buchstabenfilter
        if (selectedLetter) {
          return term.term.toUpperCase().startsWith(selectedLetter);
        }
        return true;
      })
      .filter(term => {
        // Kategoriefilter
        if (selectedCategory) {
          return term.category === selectedCategory;
        }
        return true;
      })
      .sort((a, b) => a.term.localeCompare(b.term, 'de'));
  }, [searchQuery, selectedLetter, selectedCategory]);

  // Buchstaben mit Begriffen
  const lettersWithTerms = useMemo(() => {
    return new Set(glossaryTerms.map(t => t.term[0].toUpperCase()));
  }, []);

  // Gruppierte Begriffe nach Buchstaben
  const groupedTerms = useMemo(() => {
    const groups: { [key: string]: GlossaryTerm[] } = {};
    filteredTerms.forEach(term => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLetter(null);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2 text-gray-600 hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Zurück zum Dashboard</span>
                <span className="sm:hidden">Zurück</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-6 w-6" />
              <h1 className="text-xl font-bold">Glossar</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Suchbereich */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Suchfeld */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Begriff suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Kategorie-Filter */}
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-4 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">Alle Kategorien</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Filter zurücksetzen */}
              {(searchQuery || selectedLetter || selectedCategory) && (
                <Button variant="outline" onClick={clearFilters}>
                  Filter zurücksetzen
                </Button>
              )}
            </div>

            {/* A-Z Navigation */}
            <div className="mt-4 flex flex-wrap gap-1">
              {alphabet.map(letter => {
                const hasTerms = lettersWithTerms.has(letter);
                const isSelected = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(isSelected ? null : letter)}
                    disabled={!hasTerms}
                    className={`
                      w-8 h-8 rounded text-sm font-medium transition-colors
                      ${isSelected 
                        ? 'bg-primary text-white' 
                        : hasTerms 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-slate-50 text-slate-300 cursor-not-allowed'}
                    `}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ergebnisanzahl */}
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredTerms.length} {filteredTerms.length === 1 ? 'Begriff' : 'Begriffe'} gefunden
          {selectedLetter && ` mit "${selectedLetter}"`}
          {selectedCategory && ` in "${selectedCategory}"`}
        </div>

        {/* Begriffsliste */}
        {filteredTerms.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Begriffe gefunden</h3>
              <p className="text-muted-foreground">
                Versuchen Sie einen anderen Suchbegriff oder setzen Sie die Filter zurück.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTerms).map(([letter, terms]) => (
              <div key={letter}>
                {/* Buchstaben-Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {letter}
                  </div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Begriffe */}
                <div className="space-y-3">
                  {terms.map(term => (
                    <Card 
                      key={term.term}
                      className={`transition-all cursor-pointer hover:shadow-md ${
                        expandedTerm === term.term ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{term.term}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {term.category}
                              </span>
                            </div>
                            <p className={`text-muted-foreground ${
                              expandedTerm === term.term ? '' : 'line-clamp-2'
                            }`}>
                              {term.definition}
                            </p>
                            
                            {/* Verwandte Begriffe */}
                            {expandedTerm === term.term && term.relatedTerms && term.relatedTerms.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <span className="text-sm text-muted-foreground">Verwandte Begriffe: </span>
                                {term.relatedTerms.map((related, idx) => (
                                  <button
                                    key={related}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSearchQuery(related);
                                      setSelectedLetter(null);
                                      setSelectedCategory(null);
                                    }}
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {related}{idx < term.relatedTerms!.length - 1 ? ', ' : ''}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                            expandedTerm === term.term ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary to-primary/80 text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">Fragen zu Finanzbegriffen?</h3>
            <p className="text-white/90 mb-4">
              Unsere Experten erklären Ihnen gerne alle Details zu Kapitalmarktstrukturen und Finanzierungsoptionen.
            </p>
            <Link href="/#kontakt">
              <Button variant="secondary" className="w-full sm:w-auto">
                Kostenlose Beratung anfordern
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
