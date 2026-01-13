#!/usr/bin/env tsx
import "dotenv/config";
import mysql from "mysql2/promise";

const TEMPLATE_AIF = `MANDATS- UND STRUKTURIERUNGSVERTRAG
zur Auflage eines Alternative Investment Fund (AIF)

zwischen

{{AUFTRAGGEBER_NAME}}
{{AUFTRAGGEBER_ADRESSE}}
(nachfolgend „Auftraggeber")

und

Marketplace24-7 GmbH
Kantonsstrasse 1; 8807 Freienbach SZ; Schweiz
(nachfolgend „Auftragnehmer")

gemeinsam die „Parteien".

§ 1 Präambel
Der Auftraggeber beabsichtigt die Auflage eines alternativen Investmentfonds (AIF) im Sinne der jeweils anwendbaren nationalen und europäischen Regulierung (insbesondere AIFMD), ausschließlich für professionelle und/oder semiprofessionelle Investoren.

Der Auftragnehmer ist auf die Konzeption, Strukturierung, Koordination und Projektsteuerung von Fondsstrukturen spezialisiert und arbeitet dabei mit regulierten Drittpartnern (AIFM, Verwahrstellen, Administratoren, Rechtsanwälten) zusammen.

Dieser Vertrag regelt die Strukturierungs- und Koordinationsleistungen des Auftragnehmers zur Auflage des AIF.

Der Auftragnehmer übernimmt keine Fondsverwaltung, keine Anlageberatung und keinen Vertrieb.

§ 2 Begriffsbestimmungen
Im Sinne dieses Vertrages gelten insbesondere folgende Begriffe:
- AIF: Alternativer Investmentfonds im Sinne der AIFM-Richtlinie.
- AIFM: Zugelassene alternative Investmentfonds-Verwaltungsgesellschaft.
- Fonds: Der konkret aufzulegende AIF einschließlich seiner Subfonds.
- Fondsstruktur: Juristische, wirtschaftliche und regulatorische Architektur des Fonds.
- Private Placement: Angebot ausschließlich an professionelle / semiprofessionelle Anleger.
- Regulierte Partner: AIFM, Verwahrstelle, Administrator, Custodian, Legal Counsel.
- Strukturierungsleistungen: Konzeptionelle, koordinierende und modellierende Tätigkeiten.

§ 3 Vertragsgegenstand
Der Auftraggeber beauftragt den Auftragnehmer mit der Strukturierung und Koordination der Auflage eines AIF.

Der Auftrag umfasst insbesondere:
- Entwicklung der Fondsarchitektur
- Auswahl und Koordination regulierter Partner
- Strukturierung von Strategie, Governance und Reporting
- Begleitung bis zur regulatorischen Freigabe und Fonds-Go-Live

Der Auftragnehmer schuldet keinen Platzierungserfolg und keine Kapitalzusagen.

§ 4 Leistungsumfang
Der Leistungsumfang umfasst insbesondere:
- Fondsstrategie- und Strukturkonzeption
- Jurisdiktions- und Vehikelauswahl
- AIFM-Einbindung
- Koordination von Legal, Admin, Custodian
- Prospekt- und Dokumentationskoordination
- Projektmanagement bis Fondsfreigabe

§ 5 Fondsstrategie & Strukturierung
Der Auftragnehmer erbringt insbesondere folgende Leistungen:
- Definition der Fondsstrategie (Assetklassen, Zielrendite, Laufzeit)
- Strukturierung der Fondsform (z.B. SICAV, RAIF, AIF)
- Entwicklung der Kapital-, Risiko- und Governance-Struktur
- Definition von Investorenkriterien und Zeichnungsbedingungen
- Strukturdiagramme und Cashflow-Modelle

§ 6 Jurisdiktion & Fondsvehikel
(1) Der Auftragnehmer unterstützt bei der Auswahl geeigneter Fondsstandorte (z.B. Luxemburg, Liechtenstein, Irland).
(2) Entscheidungskriterien sind u.a.: regulatorische Anforderungen, Investorenakzeptanz, steuerliche und rechtliche Rahmenbedingungen.
(3) Die finale Entscheidung trifft der Auftraggeber in Abstimmung mit dem AIFM und Legal Counsel.

§ 7 Regulierte Partner & Rollenmodell
(1) Für die Fondsauflage werden folgende regulierte Partner eingebunden:
- AIFM
- Verwahrstelle / Custodian
- Fondsadministrator
- Legal Counsel
- ggf. Placement Agent

(2) Der Auftragnehmer koordiniert und steuert, ist jedoch nicht AIFM, nicht Verwahrstelle, nicht Vertriebspartner.
(3) Jeder regulierte Partner handelt eigenverantwortlich.

§ 8 Dokumentation & Deliverables
Zu den Deliverables zählen insbesondere:
- Fondsstruktur- und Strategiememorandum
- Strukturdiagramme
- Cashflow- und Gebührenmodelle
- Koordination der Prospekterstellung
- Investorenpräsentationen (keine Vertriebsunterlagen)

Rechts- und Steuerberatung erfolgt ausschließlich durch externe Kanzleien.

§ 9 Zeitplan & Meilensteine
Der indikative Zeitplan umfasst:
- Kick-off & Strukturdefinition
- Partnerauswahl
- Dokumentation & Prospekt
- Regulatorische Einreichung
- Genehmigung
- Fonds-Go-Live

Zeitpläne sind indikativ und abhängig von Dritten.

§ 10 Vergütung
(1) Strukturierungspauschale: EUR {{STRUKTURIERUNGSPAUSCHALE}} einmalig.
(2) Erfolgsvergütung (optional): {{ERFOLGSBETEILIGUNG_PROZENT}} % auf tatsächlich zugesagtes Kapital (Commitments).

§ 11 Externe Kosten
Alle externen Kosten trägt der Auftraggeber (AIFM, Legal, Admin, Custodian, Behörden).

§ 12 Mitwirkungspflichten des Auftraggebers
- Bereitstellung vollständiger Informationen
- Zeitnahe Entscheidungen
- Einhaltung regulatorischer Vorgaben
- Zusammenarbeit mit regulierten Partnern

§ 13 Abgrenzung: Keine Anlageberatung / kein Vertrieb
(1) Der Auftragnehmer erbringt keine Anlageberatung.
(2) Kein öffentliches Angebot.
(3) Vertrieb ausschließlich durch regulierte Stellen.

§ 14 Haftung
(1) Haftung nur für Vorsatz und grobe Fahrlässigkeit.
(2) Haftungshöchstbetrag: zweifache Vergütung.
(3) Keine Haftung für regulatorische Entscheidungen oder Platzierungserfolg.

§ 15 Geistiges Eigentum
Alle Strukturen, Modelle und Konzepte bleiben Eigentum des Auftragnehmers.

§ 16 Vertraulichkeit
Strenge Vertraulichkeit über Vertragsende hinaus.

§ 17 Laufzeit & Kündigung
(1) Vertragsbeginn mit Unterzeichnung.
(2) Kündigung aus wichtigem Grund möglich.
(3) Vergütungsanspruch für erbrachte Leistungen bleibt bestehen.

§ 18 Schiedsgericht
(1) Ausschließliche Schiedsgerichtsbarkeit.
(2) Sitz: Schweiz oder Liechtenstein.
(3) Sprache: Deutsch.
(4) Anwendbares Recht: Schweizer Recht.

§ 19 Schlussbestimmungen
(1) Schriftform.
(2) Salvatorische Klausel.
(3) Anlagen sind Vertragsbestandteil.

Ort, {{DATUM}}

______________________________
{{AUFTRAGGEBER_NAME}}
Auftraggeber

______________________________
Marketplace24-7 GmbH
Auftragnehmer`;

const TEMPLATE_ANLEIHE = `MANDATS- UND STRUKTURIERUNGSVERTRAG
(Anleihe / Credit Linked Note / Actively Managed Certificate)
inkl. SPV & Partnerdienstleister

zwischen

{{AUFTRAGGEBER_NAME}}
{{AUFTRAGGEBER_ADRESSE}}
(nachfolgend „Auftraggeber")

und

Marketplace24-7 GmbH
Kantonsstrasse 1; 8807 Freienbach SZ; Schweiz
(nachfolgend „Auftragnehmer")

gemeinsam die „Parteien".

§ 1 Präambel und Zielsetzung
Der Auftraggeber beabsichtigt, ein kapitalmarktnahes Finanzierungsinstrument in Form einer {{INSTRUMENT_TYP}} aufzusetzen, um Refinanzierungs-, Wachstums- oder Investitionszwecke zu verfolgen.

Der Auftragnehmer ist auf die Konzeption, Strukturierung, Modellierung und Koordination solcher Instrumente spezialisiert und arbeitet hierbei mit lizenzierten und regulierten Drittpartnern (z.B. Banken, Treuhändern, AIFM, Administratoren) zusammen.

Ziel dieses Vertrages ist die kanzleireife Strukturierung des ausgewählten Instruments inklusive SPV-Struktur, Dokumentation und Koordination aller erforderlichen Partner – nicht jedoch die Platzierung oder Anlageberatung.

§ 2 Begriffsbestimmungen
Im Sinne dieses Vertrages gelten insbesondere folgende Begriffe:
- Anleihe: Schuldverschreibung gemäß anwendbarem Recht, die ausschließlich im Wege eines Private Placements emittiert wird.
- Credit Linked Note (CLN): strukturierte Schuldverschreibung, deren Rückzahlung und Verzinsung an definierte Kredit- oder Projektparameter gekoppelt ist.
- Actively Managed Certificate (AMC): strukturiertes Finanzinstrument mit aktiv gemanagtem Referenzportfolio.
- SPV (Special Purpose Vehicle): eigens gegründete Zweckgesellschaft zur Emission des Instruments.
- Emittent: die SPV, welche das Instrument ausgibt.
- Private Placement: Angebot ausschließlich an professionelle oder semiprofessionelle Investoren.
- Regulierte Partner: lizenzierte Dienstleister (z.B. Trustee, AIFM, Paying Agent, Administrator).
- Strukturierungsleistungen: sämtliche vom Auftragnehmer erbrachten konzeptionellen, koordinierenden und modellierenden Tätigkeiten.

§ 3 Vertragsgegenstand
(1) Der Auftraggeber beauftragt den Auftragnehmer mit der Strukturierung und Koordination eines der folgenden Instrumente (einzeln oder kombiniert):
- Anleihe
- Credit Linked Note (CLN)
- Actively Managed Certificate (AMC)

(2) Der Auftragnehmer schuldet ausschließlich Dienstleistungen, nicht den Eintritt eines wirtschaftlichen Erfolgs oder eine Platzierung.
(3) Die konkrete Ausgestaltung des Instruments wird im Rahmen der Strukturierungsphase gemeinsam festgelegt.

§ 4 Leistungsumfang
Der Leistungsumfang umfasst insbesondere:
- Strukturdesign des Instruments
- Entwicklung des Termsheets
- Aufbau der Cashflow-, Risiko- und Sicherheitenstruktur
- Aufsetzung der SPV
- Koordination aller erforderlichen Partnerdienstleister
- Erstellung strukturrelevanter Dokumentation
- Begleitung bis zum Closing und Go-Live

§ 5 Strukturierungsleistungen
Der Auftragnehmer erbringt u.a. folgende Leistungen:
- Analyse der Zielsetzung des Auftraggebers
- Auswahl und Design des geeigneten Instruments (Anleihe / CLN / AMC)
- Erstellung eines Termsheets inkl. Laufzeit, Verzinsung, Rang, Rückzahlungsmechanik
- Entwicklung der Cashflow- und Risikoarchitektur
- Konzeption der Sicherheiten- und Rangstruktur
- Strukturdiagramme und Zahlungsflussdarstellungen
- Investorenlogik (ohne Vertrieb)

§ 6 SPV-Struktur und Emittent
(1) Der Auftragnehmer koordiniert die Gründung oder Nutzung einer SPV als Emittent.
(2) Die SPV dient ausschließlich dem Zweck der Emission und ist organisatorisch und wirtschaftlich vom Auftraggeber getrennt.
(3) Auswahl der Jurisdiktion erfolgt unter Berücksichtigung rechtlicher, regulatorischer und wirtschaftlicher Kriterien.
(4) Kosten der SPV trägt der Auftraggeber.

§ 7 Partnerdienstleister und Rollenmodell
(1) Zur Umsetzung werden regulierte Partner eingebunden, u.a.:
- Legal Counsel
- Trustee / Treuhänder
- Paying Agent
- Calculation Agent
- Administrator
- AIFM (bei AMC)
- Custodian (falls erforderlich)
- Plattform / Listing Venue

(2) Der Auftragnehmer koordiniert, ist jedoch nicht Partei der Verträge zwischen Auftraggeber/SPV und den Partnern.
(3) Jeder Partner handelt eigenverantwortlich im Rahmen seiner Lizenz.

§ 8 Dokumentation und Deliverables
Zu den Deliverables zählen insbesondere:
- Termsheet
- Struktur- und Risikomemorandum
- Cashflow- und Sicherheitenübersichten
- SPV-Dokumentation
- Partner-Abstimmungsunterlagen

Keine Rechts- oder Steuerberatung.

§ 9 Zeitplan und Meilensteine
Der typische Ablauf:
- Kick-off
- Strukturfreigabe
- SPV-Ready
- Dokumentation final
- Closing
- Go-Live

Fristen sind indikativ und abhängig von Mitwirkung des Auftraggebers und Dritter.

§ 10 Vergütung
(1) Strukturierungspauschale: EUR {{STRUKTURIERUNGSPAUSCHALE}} einmalig
(2) Erfolgsvergütung (optional): {{ERFOLGSBETEILIGUNG_PROZENT}} % des emittierten Volumens
(3) Keine Rückerstattung bei Abbruch nach Leistungserbringung.

§ 11 Externe Kosten
Alle externen Kosten (Legal, Trustee, SPV, Plattformen etc.) trägt der Auftraggeber direkt.

§ 12 Mitwirkungspflichten des Auftraggebers
- Vollständige, richtige Unterlagen
- Zeitnahe Entscheidungen
- Einhaltung regulatorischer Vorgaben

§ 13 Keine Anlageberatung / kein Vertrieb
(1) Der Auftragnehmer erbringt keine Anlageberatung, keinen Vertrieb und keine Platzierung.
(2) Es erfolgt kein öffentliches Angebot.
(3) Investorenansprache ausschließlich durch regulierte Partner.

§ 14 Haftung
(1) Haftung nur für Vorsatz und grobe Fahrlässigkeit.
(2) Haftungshöchstbetrag: maximal das Zweifache der gezahlten Vergütung.
(3) Keine Haftung für Markt-, Platzierungs- oder Investorenentscheidungen.

§ 15 Geistiges Eigentum
Alle Strukturen, Modelle und Dokumente bleiben Eigentum des Auftragnehmers.
Der Auftraggeber erhält ein einfaches Nutzungsrecht für das Projekt.

§ 16 Vertraulichkeit
Vertraulichkeitspflicht gilt für alle projektbezogenen Informationen und besteht über Vertragsende hinaus.

§ 17 Laufzeit und Kündigung
(1) Vertrag beginnt mit Unterzeichnung.
(2) Kündigung aus wichtigem Grund möglich.
(3) Vergütungsanspruch bleibt für erbrachte Leistungen bestehen.

§ 18 Schiedsgericht
(1) Alle Streitigkeiten werden endgültig durch Schiedsgerichtsbarkeit entschieden.
(2) Sitz: Schweiz
(3) Sprache: Deutsch.
(4) Anwendbares Recht: Schweizer Recht.

§ 19 Schlussbestimmungen
(1) Schriftform.
(2) Salvatorische Klausel.
(3) Anlagen sind Bestandteil des Vertrages.

Ort, {{DATUM}}

______________________________
{{AUFTRAGGEBER_NAME}}
Auftraggeber

______________________________
Marketplace24-7 GmbH
Auftragnehmer`;

async function seedContractTemplates() {
  console.log("\n🌱 Seeding contract templates...\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set!");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✓ Connected to database\n");

    // Check if templates already exist
    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM contract_templates"
    );
    const existingCount = (existing as any)[0].count;

    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} templates already exist.`);
      console.log("   Delete them first if you want to re-seed.\n");
      await connection.end();
      process.exit(0);
    }

    // Insert AIF template
    await connection.execute(
      `INSERT INTO contract_templates
       (name, description, category, content, placeholders, isActive)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Mandats- und Strukturierungsvertrag AIF",
        "Vertrag zur Auflage eines Alternative Investment Fund (AIF) mit Strukturierung, Koordination und Projektsteuerung",
        "fondstrukturierung",
        TEMPLATE_AIF,
        JSON.stringify([
          "AUFTRAGGEBER_NAME",
          "AUFTRAGGEBER_ADRESSE",
          "DATUM",
          "STRUKTURIERUNGSPAUSCHALE",
          "ERFOLGSBETEILIGUNG_PROZENT"
        ]),
        true
      ]
    );
    console.log("✓ Inserted: Mandats- und Strukturierungsvertrag AIF");

    // Insert Anleihe/CLN/AMC template
    await connection.execute(
      `INSERT INTO contract_templates
       (name, description, category, content, placeholders, isActive)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Mandats- und Strukturierungsvertrag Anleihe/CLN/AMC",
        "Vertrag zur Strukturierung von Anleihen, Credit Linked Notes oder Actively Managed Certificates inkl. SPV-Aufsetzung",
        "anleihen",
        TEMPLATE_ANLEIHE,
        JSON.stringify([
          "AUFTRAGGEBER_NAME",
          "AUFTRAGGEBER_ADRESSE",
          "DATUM",
          "STRUKTURIERUNGSPAUSCHALE",
          "ERFOLGSBETEILIGUNG_PROZENT",
          "INSTRUMENT_TYP"
        ]),
        true
      ]
    );
    console.log("✓ Inserted: Mandats- und Strukturierungsvertrag Anleihe/CLN/AMC");

    // Verify
    const [templates] = await connection.execute(
      "SELECT id, name, category FROM contract_templates"
    );
    console.log("\n📋 Seeded templates:");
    (templates as any[]).forEach((t: any) => {
      console.log(`   ${t.id}. ${t.name} [${t.category}]`);
    });

    await connection.end();
    console.log("\n✅ Contract templates seeded successfully!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedContractTemplates();
