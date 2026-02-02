import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Target, 
  Shield, 
  Users, 
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  Briefcase
} from "lucide-react";

export default function About() {
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
            <Link href="/about" className="text-sm font-medium text-primary">
              Über uns
            </Link>
            <Link href="/team" className="text-sm font-medium hover:text-primary transition-colors">
              Team
            </Link>
            <Link href="/#kontakt" className="text-sm font-medium hover:text-primary transition-colors">
              Kontakt
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
              <Building2 className="h-4 w-4" />
              Über die NON DOM Group
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Der #1 <span className="text-primary">Unternehmer Marktplatz</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Freiheit für Unternehmer. Sicherheit für die Zukunft. 
              Die erste digitale Unternehmer-Plattform im DACH-Raum für internationale 
              Firmengründung, steueroptimierte Strukturen und Asset Protection.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Unsere Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Eine Welt, in der Unternehmer und Geschäftsinhaber sich voll und ganz auf ihr 
                  Wachstum konzentrieren können – ohne die ständige Sorge um Bürokratie, 
                  Steuerlasten oder finanzielle Unsicherheiten. Wir schaffen die Strukturen, 
                  die unternehmerische Freiheit ermöglichen.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Unsere Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wir unterstützen Unternehmer, Freiberufler und Geschäftsführer mit unserer 
                  langjährigen Erfahrung dabei, kluge unternehmerische und finanzielle 
                  Entscheidungen zu treffen – national wie international. Mit maßgeschneiderten 
                  Lösungen schaffen wir Sicherheit, Stabilität und Freiheit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Die Angelus Group */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Hinter der NON DOM Group steht die <span className="text-primary">Angelus Group</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Die Angelus Group ist eine weltweit agierende Unternehmensgruppe mit Sitz in München. 
                Seit 2011 sind wir strategischer Partner für intelligentes Unternehmenswachstum 
                und finanzielle Agilität.
              </p>
              <p className="text-muted-foreground mb-8">
                Wir kombinieren Marktkenntnis mit Innovationsgeist, um Ihre Geschäftsziele nicht 
                nur zu erreichen, sondern zu übertreffen. Mit uns entdecken Sie neue Möglichkeiten 
                der Wirtschaftlichkeit, die Ihnen helfen, vorauszudenken und zu handeln.
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">2011</p>
                  <p className="text-sm text-muted-foreground">Gründungsjahr</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">31+</p>
                  <p className="text-sm text-muted-foreground">Experten im Team</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">Global</p>
                  <p className="text-sm text-muted-foreground">Aktiv weltweit</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6">Angelus Group Unternehmen</h3>
              <div className="space-y-4">
                {[
                  { name: "Angelus Consulting", desc: "Unternehmensberatung & M&A" },
                  { name: "Angelus Capital", desc: "Anleihen & Investitionschancen" },
                  { name: "Angelus Alpha Beteiligungen", desc: "Treuhanddienstleistungen" },
                  { name: "Jura Invest", desc: "Prozessfinanzierung" },
                  { name: "Kapitalanlegerschutz.com", desc: "Anlegerschutz & Bewertungen" },
                  { name: "NON DOM Group", desc: "Unternehmer Marktplatz" }
                ].map((company, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{company.name}</h4>
                      <p className="text-sm text-muted-foreground">{company.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Werte */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unsere <span className="text-primary">Werte</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Diese Prinzipien leiten unser Handeln und definieren unsere Zusammenarbeit mit Kunden und Partnern.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Rechtssicherheit",
                description: "Nur wer auf rechtssichere Strukturen setzt, bleibt langfristig handlungsfähig."
              },
              {
                icon: Award,
                title: "Exzellenz",
                description: "Wir streben nach höchster Qualität in der Strukturierung und Beratung unserer Mandanten."
              },
              {
                icon: Users,
                title: "Netzwerk",
                description: "Ein starkes internationales Expertennetzwerk aus Juristen, Steuerberatern und Investmentbankern."
              },
              {
                icon: Globe,
                title: "International",
                description: "Globale Strukturen für Unternehmer, die im internationalen Wettbewerb bestehen wollen."
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Was wir <span className="text-primary">bieten</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Die NON DOM Group bündelt internationale Firmengründung, steueroptimierte Strukturen 
              und Asset Protection in einem Portal.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Internationale Firmengründung",
                items: ["Deutschland, Schweiz, Zypern, UK", "Holdingmodelle & Tochtergesellschaften", "Joint Ventures"]
              },
              {
                title: "Steueroptimierung",
                items: ["Rechtssichere Strukturen", "Internationale Standards", "Bürokratieabbau"]
              },
              {
                title: "Asset Protection",
                items: ["Vermögenssicherung", "Stabile Strukturen", "Rechtliche Absicherung"]
              },
              {
                title: "Family Office Strukturen",
                items: ["Nachfolgeplanung", "Beteiligungen & Investments", "Vermögensstrategien"]
              },
              {
                title: "Alternative Investments",
                items: ["Anleihen & Immobilien", "Startups via SAFE Agreements", "Franchise-Modelle"]
              },
              {
                title: "M&A & Sanierung",
                items: ["Unternehmensverkauf", "Nachfolge", "Restrukturierung"]
              }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">{service.title}</h3>
                  <ul className="space-y-2">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zitat */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-medium italic mb-8">
              "Unternehmer müssen heute wie Konzerne handeln, wenn sie im globalen Wettbewerb 
              bestehen wollen. Mit der Non-Dom Group liefern wir die Strukturen, Netzwerke 
              und Lösungen, die dafür notwendig sind."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
                <img 
                  src="/thomas-gross.jpg" 
                  alt="Thomas Gross" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg">Thomas Gross</p>
                <p className="text-primary-foreground/80">CEO Angelus Group & Business Angel Investor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Für wen ist die NON DOM Group <span className="text-primary">geeignet?</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              "Selbstständige & Freiberufler",
              "Handwerk & Baugewerbe",
              "E-Commerce & Online-Business",
              "Immobilieninvestoren & Makler",
              "Startups & Innovatoren",
              "Finanz- & Unternehmensberater",
              "Transport & Logistik",
              "Gastronomie & Hotellerie",
              "Land- & Forstwirtschaft",
              "Projektentwickler"
            ].map((group, index) => (
              <div 
                key={index}
                className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 text-center text-sm font-medium"
              >
                {group}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit für den nächsten Schritt?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Lassen Sie uns gemeinsam Ihre Unternehmensstruktur analysieren und 
              maßgeschneiderte Lösungen entwickeln.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#kontakt">
                <Button size="lg">
                  Analyse anfordern
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/team">
                <Button variant="outline" size="lg">
                  Unser Team kennenlernen
                </Button>
              </Link>
            </div>
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
