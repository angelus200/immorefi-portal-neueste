import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Datenschutz() {
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
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          
          {/* 1. Datenschutz auf einen Blick */}
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Datenschutz auf einen Blick</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Allgemeine Hinweise</h3>
            <p className="mb-4 text-muted-foreground">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
              Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. 
              Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter 
              diesem Text aufgeführten Datenschutzerklärung.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Datenerfassung auf dieser Website</h3>
            
            <h4 className="text-lg font-medium mt-4 mb-2">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
            <p className="mb-4 text-muted-foreground">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
              Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" 
              in dieser Datenschutzerklärung entnehmen.
            </p>
            
            <h4 className="text-lg font-medium mt-4 mb-2">Wie erfassen wir Ihre Daten?</h4>
            <p className="mb-4 text-muted-foreground">
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. 
              Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
            </p>
            <p className="mb-4 text-muted-foreground">
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website 
              durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, 
              Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt 
              automatisch, sobald Sie diese Website betreten.
            </p>
            
            <h4 className="text-lg font-medium mt-4 mb-2">Wofür nutzen wir Ihre Daten?</h4>
            <p className="mb-4 text-muted-foreground">
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
              gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>
            
            <h4 className="text-lg font-medium mt-4 mb-2">Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
            <p className="mb-4 text-muted-foreground">
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und 
              Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem 
              ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine 
              Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung 
              jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten 
              Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. 
              Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
            </p>
          </section>

          {/* 2. Hosting */}
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Hosting</h2>
            <p className="mb-4 text-muted-foreground">
              Wir hosten die Inhalte unserer Website bei einem externen Anbieter. Die Verwendung 
              erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes 
              Interesse an einer möglichst zuverlässigen Darstellung unserer Website.
            </p>
          </section>

          {/* 3. Allgemeine Hinweise und Pflichtinformationen */}
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Datenschutz</h3>
            <p className="mb-4 text-muted-foreground">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
              Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen 
              Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p className="mb-4 text-muted-foreground">
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation 
              per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem 
              Zugriff durch Dritte ist nicht möglich.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Hinweis zur verantwortlichen Stelle</h3>
            <p className="mb-4 text-muted-foreground">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p className="mb-4">
              <strong>Marketplace24-7 GmbH</strong><br />
              Kantonsstrasse 1<br />
              8807 Freienbach SZ<br />
              Schweiz
            </p>
            <p className="mb-4">
              SZ Commercial Register: CH-130.4.033.363-2<br />
              Registration court: Kanton Schwyz<br />
              E-Mail: info (at) non-dom.group
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Speicherdauer</h3>
            <p className="mb-4 text-muted-foreground">
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt 
              wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die 
              Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen 
              oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, 
              sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer 
              personenbezogenen Daten haben.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Rechtsgrundlagen der Datenverarbeitung</h3>
            <p className="mb-4 text-muted-foreground">
              Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre 
              personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 
              Abs. 2 lit. a DSGVO. Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung 
              vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage 
              des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern 
              diese zur Erfüllung einer rechtlichen Verpflichtung erforderlich sind auf Grundlage 
              von Art. 6 Abs. 1 lit. c DSGVO.
            </p>
          </section>

          {/* 4. Ihre Rechte */}
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Ihre Rechte</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p className="mb-4 text-muted-foreground">
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. 
              Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit 
              der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Widerspruchsrecht (Art. 21 DSGVO)</h3>
            <p className="mb-4 text-muted-foreground font-medium">
              WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO 
              ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN 
              SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN WIDERSPRUCH 
              EINZULEGEN.
            </p>
            <p className="mb-4 text-muted-foreground font-medium">
              WERDEN IHRE PERSONENBEZOGENEN DATEN VERARBEITET, UM DIREKTWERBUNG ZU BETREIBEN, 
              SO HABEN SIE DAS RECHT, JEDERZEIT WIDERSPRUCH GEGEN DIE VERARBEITUNG SIE BETREFFENDER 
              PERSONENBEZOGENER DATEN ZUM ZWECKE DERARTIGER WERBUNG EINZULEGEN.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
            <p className="mb-4 text-muted-foreground">
              Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht 
              bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen 
              Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Recht auf Datenübertragbarkeit</h3>
            <p className="mb-4 text-muted-foreground">
              Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in 
              Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten 
              in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Auskunft, Berichtigung und Löschung</h3>
            <p className="mb-4 text-muted-foreground">
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht 
              auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, 
              deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein 
              Recht auf Berichtigung oder Löschung dieser Daten.
            </p>
          </section>

          {/* 5. Datenerfassung auf dieser Website */}
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Datenerfassung auf dieser Website</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies</h3>
            <p className="mb-4 text-muted-foreground">
              Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine 
              Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder 
              vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft 
              (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach 
              Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem 
              Endgerät gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung 
              durch Ihren Webbrowser erfolgt.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Kontaktformular</h3>
            <p className="mb-4 text-muted-foreground">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben 
              aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten 
              zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns 
              gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
            <p className="mb-4 text-muted-foreground">
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, 
              sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur 
              Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen 
              beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven 
              Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </section>

          {/* 6. Analyse-Tools */}
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Analyse-Tools und Werbung</h2>
            <p className="mb-4 text-muted-foreground">
              Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. 
              Das geschieht vor allem mit sogenannten Analyseprogrammen. Die Analyse Ihres 
              Surf-Verhaltens erfolgt in der Regel anonym; das Surf-Verhalten kann nicht zu 
              Ihnen zurückverfolgt werden.
            </p>
          </section>

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
