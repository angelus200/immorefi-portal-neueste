import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Newspaper, 
  ExternalLink,
  Award,
  Calendar,
  ArrowRight,
  FileText
} from "lucide-react";

const pressArticles = [
  {
    source: "Forbes",
    logo: "/forbes-logo.png",
    title: "Internationale Firmengründung optimiert",
    date: "13. Oktober 2025",
    summary: "Die Non-Dom Group positioniert sich mit internationaler Firmengründung als Partner für Wachstum. Unternehmer im Spannungsfeld globaler Märkte benötigen Strukturen, die über nationale Grenzen hinausgehen.",
    quote: "Unternehmer müssen heute wie Konzerne handeln, wenn sie im globalen Wettbewerb bestehen wollen.",
    url: "https://www.forbes.at/artikel/internationale-firmengruendung-optimiert",
    type: "article"
  },
  {
    source: "Focus",
    logo: "/focus-logo.png",
    title: "Amazon Markenaufbau: Diese Firmen setzen auf datengetriebenes Wachstum",
    date: "2. September 2025",
    summary: "Unternehmen wie commercehelden, digiPULS und toolmacher zeigen, wie Amazon Markenaufbau strategisch und nachhaltig gelingt – mit operativer Betreuung durch die Angelus Group.",
    quote: null,
    url: "https://unternehmen.focus.de/amazon-markenaufbau.html",
    type: "article"
  },
  {
    source: "DUB",
    logo: "/dub-logo.png",
    title: "Angelus Management Beratung und Service KG",
    date: "2025",
    summary: "Profil der Angelus Management Beratung und Service KG auf DUB.de – Deutschlands größter Unternehmer-Plattform für Nachfolge, M&A und Finanzierung.",
    quote: null,
    url: "https://www.dub.de/berater/profil/angelus-management-beratung-und-service-kg-964/",
    type: "article"
  }
];

const awards = [
  {
    title: "Unternehmen der Zukunft",
    organization: "Deutsches Institut für Qualitätsstandards und -prüfung e.V.",
    recipient: "Angelus Management Beratung und Service KG",
    year: "2025",
    url: "https://kg.angelus.group/wp-content/uploads/2025/06/URKUNDE_Unternehmen_der_Zukunft_Angelus_Managment_Beratung_und_Service.pdf"
  }
];

export default function Press() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <img 
              src="/nondom-logo.svg" 
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
            <Link href="/team" className="text-sm font-medium hover:text-primary transition-colors">
              Team
            </Link>
            <Link href="/press" className="text-sm font-medium text-primary">
              Presse
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
              <Newspaper className="h-4 w-4" />
              Presse & Medien
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              NON DOM Group in den <span className="text-primary">Medien</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Aktuelle Berichterstattung, Presseartikel und Auszeichnungen der 
              NON DOM Group und Angelus Group.
            </p>
          </div>
        </div>
      </section>

      {/* Press Articles */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Aktuelle <span className="text-primary">Presseartikel</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Lesen Sie, was führende Wirtschaftsmedien über uns berichten.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pressArticles.map((article, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 flex items-center justify-center h-28">
                    <img 
                      src={article.logo} 
                      alt={article.source} 
                      className="h-16 max-w-[180px] object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      {article.date}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{article.title}</h3>
                    <p className="text-muted-foreground mb-4">{article.summary}</p>
                    
                    {article.quote && (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground mb-4">
                        "{article.quote}"
                        <footer className="mt-1 text-primary font-medium not-italic">— Thomas Gross</footer>
                      </blockquote>
                    )}
                    
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full">
                        Artikel lesen
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Auszeichnungen & <span className="text-primary">Zertifikate</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Anerkennungen für unsere Arbeit und unser Engagement.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {awards.map((award, index) => (
              <Card key={index} className="border-2 border-primary/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-3">
                    <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 p-6 flex items-center justify-center">
                      <img 
                        src="/urkunde-zukunft.webp" 
                        alt="Urkunde Unternehmen der Zukunft" 
                        className="h-48 object-contain"
                      />
                    </div>
                    <div className="md:col-span-2 p-8">
                      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                        <Award className="h-4 w-4" />
                        Auszeichnung {award.year}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{award.title}</h3>
                      <p className="text-muted-foreground mb-2">{award.organization}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ausgezeichnet: {award.recipient}
                      </p>
                      
                      <a 
                        href={award.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button>
                          <FileText className="mr-2 h-4 w-4" />
                          Urkunde ansehen (PDF)
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950/50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Pressekontakt
                </h2>
                <p className="text-muted-foreground mb-6">
                  Für Presseanfragen, Interviews oder weitere Informationen 
                  stehen wir Ihnen gerne zur Verfügung.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:presse@angelus.group">
                    <Button size="lg">
                      Presseanfrage senden
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <a href="tel:+41445004100">
                    <Button variant="outline" size="lg">
                      +41 44 500 41 00
                    </Button>
                  </a>
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
              Mehr über uns erfahren
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Entdecken Sie unsere Leistungen und wie wir Ihnen helfen können.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/about">
                <Button size="lg" variant="secondary">
                  Über uns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#kontakt">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Kontakt aufnehmen
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
              src="/nondom-logo.svg" 
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
