import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Mail,
  ArrowRight,
  Building2,
  Award,
  Globe,
  Briefcase,
  MapPin,
  Phone,
  GraduationCap,
  TrendingUp
} from "lucide-react";

export default function Team() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <img 
              src="/images/logos/non-dom-group-logo.webp" 
              alt="NON DOM Group" 
              className="h-8 cursor-pointer"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#leistungen" className="text-sm font-medium hover:text-primary transition-colors">
              Leistungen
            </Link>
            <Link href="/#prozess" className="text-sm font-medium hover:text-primary transition-colors">
              Prozess
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              Über uns
            </Link>
            <Link href="/team" className="text-sm font-medium text-primary">
              Team
            </Link>
            <Link href="/onboarding" className="text-sm font-medium hover:text-primary transition-colors">
              Analyse starten
            </Link>
          </div>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Unser Team
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Die <span className="text-primary">Experten</span> hinter der NON DOM Group
            </h1>
            <p className="text-xl text-muted-foreground">
              Ein starkes internationales Netzwerk aus erfahrenen Unternehmern, Juristen, 
              Steuerberatern und Investmentbankern – vereint durch die Vision, Unternehmern 
              echte Freiheit zu ermöglichen.
            </p>
          </div>
        </div>
      </section>

      {/* Gründer Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden border-2 border-primary/20">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 md:p-12 flex items-center justify-center">
                    <div className="h-48 w-48 md:h-64 md:w-64 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img 
                        src="/thomas-gross.jpg" 
                        alt="Thomas Gross" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-8 md:p-12">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                      <Award className="h-4 w-4" />
                      Gründer & CEO
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Thomas Gross</h2>
                    <p className="text-lg text-primary font-medium mb-4">
                      CEO Angelus Group & Business Angel Investor
                    </p>
                    
                    <p className="text-muted-foreground mb-6">
                      Thomas Gross ist Gründer und Geschäftsführer der Angelus Group mit Sitz in München. 
                      Als Mitglied bei Business Angels Deutschland verfügt er über langjährige Erfahrung 
                      im Bereich Finanzierung, Beratung und Beteiligung von Unternehmen, insbesondere 
                      im Mittelstand und Start-up-Segment. Er ist zudem als Portfoliomanager und 
                      Berater für Spezialfonds tätig.
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>81829 München, Deutschland</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span>Angelus Group (seit 2011)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="h-4 w-4 text-primary" />
                        <span>Business Angels Deutschland</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href="https://capinside.com/members/thomas-gross-fffe8823-1634-472c-a1c6-1b8e0fa00727" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Globe className="h-4 w-4 mr-2" />
                          Capinside Profil
                        </Button>
                      </a>
                      <a href="mailto:office@angelus.group">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Kontakt
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Zitat */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-center">
              <p className="text-2xl md:text-3xl font-medium italic text-muted-foreground mb-6">
                "Nur wer auf rechtssichere Strukturen setzt, bleibt langfristig handlungsfähig. 
                Wir kombinieren unternehmerische Freiheit mit rechtlicher Sicherheit. Das schafft 
                nicht nur Vertrauen, sondern echte Handlungsfähigkeit – heute und in Zukunft."
              </p>
              <footer className="text-primary font-semibold">— Thomas Gross, CEO Angelus Group</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Angelus Group Info */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Die <span className="text-primary">Angelus Group</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Eine weltweit agierende Unternehmensgruppe – Ihr strategischer Partner 
              für intelligentes Unternehmenswachstum seit 2011.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">2011</h3>
                <p className="text-muted-foreground">Gründungsjahr</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">31+</h3>
                <p className="text-muted-foreground">Experten im Team</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">Global</h3>
                <p className="text-muted-foreground">International aktiv</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Expertennetzwerk */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unser <span className="text-primary">Expertennetzwerk</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Die NON DOM Group verbindet ein starkes internationales Netzwerk aus 
              geprüften Experten für Ihre unternehmerischen Herausforderungen.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Juristen & Rechtsanwälte",
                desc: "Spezialisiert auf internationales Gesellschaftsrecht, Steuerrecht und Asset Protection"
              },
              {
                title: "Steuerberater",
                desc: "Experten für internationale Steueroptimierung und grenzüberschreitende Strukturen"
              },
              {
                title: "Investmentbanker",
                desc: "Erfahrung in Private Placements, Anleihen und alternativen Finanzierungen"
              },
              {
                title: "M&A-Berater",
                desc: "Begleitung bei Unternehmensverkäufen, Nachfolge und Restrukturierung"
              },
              {
                title: "Family Office Experten",
                desc: "Spezialisten für Vermögensstrategien und Nachfolgeplanung"
              },
              {
                title: "Unternehmer & Investoren",
                desc: "Erfahrene Business Angels und Unternehmer als Sparringspartner"
              }
            ].map((expert, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{expert.title}</h3>
                  <p className="text-sm text-muted-foreground">{expert.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dienstleistungen */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unsere <span className="text-primary">Kernkompetenzen</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              "Betriebswirtschaftliche Beratung",
              "M&A Beratung",
              "Finanzierung",
              "Sanierung & Restrukturierung",
              "Unternehmensverkauf & Nachfolge",
              "Internationale Strukturierung"
            ].map((service, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-background rounded-lg p-4 shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Karriere */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Werden Sie Teil unseres <span className="text-primary">Teams</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Wir sind immer auf der Suche nach talentierten Menschen, die unsere Leidenschaft 
                für innovative Unternehmensstrukturen und Finanzierungslösungen teilen.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Building2, title: "Modernes Arbeitsumfeld", desc: "Flexible Arbeitszeiten und Remote-Optionen" },
                  { icon: TrendingUp, title: "Wachstumschancen", desc: "Kontinuierliche Weiterbildung und Karriereentwicklung" },
                  { icon: Briefcase, title: "Spannende Projekte", desc: "Arbeit an komplexen internationalen Strukturen" }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <a href="mailto:office@angelus.group?subject=Karriere%20Anfrage">
                <Button className="mt-8" size="lg">
                  Initiativbewerbung senden
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 lg:p-12">
              <blockquote className="text-lg italic mb-6">
                "Unternehmer müssen heute wie Konzerne handeln, wenn sie im globalen Wettbewerb 
                bestehen wollen. Mit der Non-Dom Group liefern wir die Strukturen, Netzwerke 
                und Lösungen, die dafür notwendig sind."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Thomas Gross</p>
                  <p className="text-sm text-muted-foreground">CEO Angelus Group</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Kontaktieren Sie uns
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Haben Sie Fragen oder möchten Sie mehr über unsere Leistungen erfahren? 
                      Unser Team steht Ihnen gerne zur Verfügung.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Marketplace24-7 GmbH</p>
                          <p className="text-sm text-muted-foreground">Kantonsstrasse 1, 8807 Freienbach SZ, Schweiz</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Telefon</p>
                          <p className="text-sm text-muted-foreground">+41 44 500 41 00</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">E-Mail</p>
                          <p className="text-sm text-muted-foreground">info@non-dom.group</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <Link href="/onboarding">
                      <Button size="lg" className="w-full mb-4">
                        Jetzt Analyse starten
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <a href="https://non-dom.group" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg" className="w-full">
                        <Globe className="mr-2 h-4 w-4" />
                        non-dom.group besuchen
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lassen Sie uns sprechen
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Starten Sie Ihre Analyse und lassen Sie uns Ihre Möglichkeiten besprechen.
            </p>
            <Link href="/onboarding">
              <Button size="lg" variant="secondary">
                Jetzt Analyse starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <img 
              src="/images/logos/non-dom-group-logo.webp" 
              alt="NON DOM Group" 
              className="h-8 brightness-0 invert"
            />
            <p className="text-sm">© {new Date().getFullYear()} Non-Dom Group GmbH. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
