import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Non Dom Group" className="h-10" />
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
        <h1 className="text-4xl font-bold mb-8">Impressum</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">Marketplace24-7 GmbH</h2>
          
          <p className="mb-4">
            Kantonsstrasse 1<br />
            8807 Freienbach SZ<br />
            Schweiz
          </p>
          
          <p className="mb-4">
            <strong>E-Mail:</strong> info (at) non-dom.group
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Handelsregister</h3>
          <p className="mb-4">
            SZ Commercial Register: CH-130.4.033.363-2<br />
            Registration court: Kanton Schwyz
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Markeninhaber</h3>
          <p className="mb-4">
            <strong>Non Dom Group</strong> ist eine Marke der Marketplace24-7 GmbH.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Haftungsausschluss</h3>
          <p className="mb-4">
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
            Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen 
            Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder 
            gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, 
            die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Haftung für Links</h3>
          <p className="mb-4">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
            der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung 
            auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der 
            Verlinkung nicht erkennbar.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Urheberrecht</h3>
          <p className="mb-4">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
            dem schweizerischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede 
            Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
            Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind 
            nur für den privaten, nicht kommerziellen Gebrauch gestattet.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Non Dom Group. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-6">
              <Link href="/impressum" className="text-sm text-muted-foreground hover:text-primary">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-primary">
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
