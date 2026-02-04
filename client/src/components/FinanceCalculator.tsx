import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Banknote,
  Clock,
  Target,
  BarChart3,
  Shield
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Utility function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(value);
};

// Utility function to format percentage
const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('de-DE', { 
    style: 'percent', 
    minimumFractionDigits: 1,
    maximumFractionDigits: 1 
  }).format(value / 100);
};

// ============================================
// 1. KAPITALLÜCKEN-RECHNER
// ============================================
function KapitallueckenRechner() {
  const [eigenkapital, setEigenkapital] = useState(2000000);
  const [bankdarlehen, setBankdarlehen] = useState(8000000);
  const [baukosten, setBaukosten] = useState(12000000);
  const [zeitverzug, setZeitverzug] = useState(6);
  const [showResult, setShowResult] = useState(false);

  const verzugskosten = (baukosten * 0.005) * zeitverzug; // 0.5% pro Monat
  const gesamtbedarf = baukosten + verzugskosten;
  const verfuegbar = eigenkapital + bankdarlehen;
  const luecke = Math.max(0, gesamtbedarf - verfuegbar);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Eigenkapital</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[eigenkapital]}
                onValueChange={(v) => setEigenkapital(v[0])}
                min={0}
                max={10000000}
                step={100000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(eigenkapital)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Bankdarlehen</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[bankdarlehen]}
                onValueChange={(v) => setBankdarlehen(v[0])}
                min={0}
                max={50000000}
                step={500000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(bankdarlehen)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Baukosten (Gesamtprojekt)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[baukosten]}
                onValueChange={(v) => setBaukosten(v[0])}
                min={1000000}
                max={100000000}
                step={500000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(baukosten)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Erwarteter Zeitverzug (Monate)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[zeitverzug]}
                onValueChange={(v) => setZeitverzug(v[0])}
                min={0}
                max={24}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{zeitverzug} Monate</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className={`border-2 ${luecke > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20'}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Ihre aktuelle Finanzierungslücke</p>
                <p className={`text-4xl font-bold ${luecke > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(luecke)}
                </p>
                {luecke > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    {formatPercent((luecke / gesamtbedarf) * 100)} des Gesamtbedarfs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-muted-foreground">Gesamtbedarf</p>
              <p className="text-lg font-semibold">{formatCurrency(gesamtbedarf)}</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-muted-foreground">Verzugskosten</p>
              <p className="text-lg font-semibold text-orange-600">{formatCurrency(verzugskosten)}</p>
            </div>
          </div>
          
          {luecke > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Strukturelle Lücke erkannt</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Diese Lücke kann durch Private Debt, CLN oder alternative Finanzierungsstrukturen geschlossen werden.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 2. BANKEN-ABHÄNGIGKEITS-SCORE
// ============================================
function BankenAbhaengigkeitsScore() {
  const [anzahlBanken, setAnzahlBanken] = useState("1");
  const [covenants, setCovenants] = useState("streng");
  const [laufzeiten, setLaufzeiten] = useState("kurz");
  const [nachbesicherung, setNachbesicherung] = useState("ja");
  const [showResult, setShowResult] = useState(false);

  const calculateScore = () => {
    let score = 0;
    
    // Anzahl Banken
    if (anzahlBanken === "1") score += 30;
    else if (anzahlBanken === "2") score += 15;
    else score += 0;
    
    // Covenants
    if (covenants === "streng") score += 25;
    else if (covenants === "moderat") score += 10;
    else score += 0;
    
    // Laufzeiten
    if (laufzeiten === "kurz") score += 25;
    else if (laufzeiten === "mittel") score += 10;
    else score += 0;
    
    // Nachbesicherung
    if (nachbesicherung === "ja") score += 20;
    else if (nachbesicherung === "moeglich") score += 10;
    else score += 0;
    
    return score;
  };

  const score = calculateScore();
  const getAmpel = () => {
    if (score >= 60) return { color: "red", label: "Hohes Risiko", bg: "bg-red-500" };
    if (score >= 30) return { color: "yellow", label: "Mittleres Risiko", bg: "bg-yellow-500" };
    return { color: "green", label: "Geringes Risiko", bg: "bg-green-500" };
  };
  const ampel = getAmpel();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Anzahl finanzierender Banken</Label>
            <RadioGroup value={anzahlBanken} onValueChange={setAnzahlBanken} className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="bank-1" />
                <Label htmlFor="bank-1" className="cursor-pointer">1 Bank</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="bank-2" />
                <Label htmlFor="bank-2" className="cursor-pointer">2 Banken</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3+" id="bank-3" />
                <Label htmlFor="bank-3" className="cursor-pointer">3+ Banken</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-3 block">Covenant-Situation</Label>
            <RadioGroup value={covenants} onValueChange={setCovenants} className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="streng" id="cov-streng" />
                <Label htmlFor="cov-streng" className="cursor-pointer">Strenge Covenants</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderat" id="cov-moderat" />
                <Label htmlFor="cov-moderat" className="cursor-pointer">Moderate Covenants</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keine" id="cov-keine" />
                <Label htmlFor="cov-keine" className="cursor-pointer">Keine/wenige</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-3 block">Restlaufzeiten der Finanzierungen</Label>
            <RadioGroup value={laufzeiten} onValueChange={setLaufzeiten} className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kurz" id="lauf-kurz" />
                <Label htmlFor="lauf-kurz" className="cursor-pointer">&lt; 2 Jahre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mittel" id="lauf-mittel" />
                <Label htmlFor="lauf-mittel" className="cursor-pointer">2-5 Jahre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lang" id="lauf-lang" />
                <Label htmlFor="lauf-lang" className="cursor-pointer">&gt; 5 Jahre</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-3 block">Nachbesicherungspflichten</Label>
            <RadioGroup value={nachbesicherung} onValueChange={setNachbesicherung} className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ja" id="nach-ja" />
                <Label htmlFor="nach-ja" className="cursor-pointer">Ja, aktiv</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moeglich" id="nach-moeglich" />
                <Label htmlFor="nach-moeglich" className="cursor-pointer">Möglich</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nein" id="nach-nein" />
                <Label htmlFor="nach-nein" className="cursor-pointer">Nein</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Banken-Abhängigkeits-Score</p>
                
                {/* Ampel */}
                <div className="flex justify-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${score >= 60 ? 'bg-red-500' : 'bg-red-200'} transition-colors`} />
                  <div className={`w-12 h-12 rounded-full ${score >= 30 && score < 60 ? 'bg-yellow-500' : 'bg-yellow-200'} transition-colors`} />
                  <div className={`w-12 h-12 rounded-full ${score < 30 ? 'bg-green-500' : 'bg-green-200'} transition-colors`} />
                </div>
                
                <p className={`text-2xl font-bold ${
                  score >= 60 ? 'text-red-600' : 
                  score >= 30 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {ampel.label}
                </p>
                
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${ampel.bg}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Risiko-Score: {score}/100</p>
              </div>
            </CardContent>
          </Card>
          
          {score >= 30 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {score >= 60 ? 'Kritische Abhängigkeit' : 'Erhöhte Abhängigkeit'}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Eine Diversifizierung der Finanzierungsquellen durch Private Debt oder Kapitalmarktinstrumente kann das Risiko reduzieren.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. ZINS- & REFINANZIERUNGSRISIKO-CHECK
// ============================================
function ZinsrisikoCheck() {
  const [darlehen, setDarlehen] = useState(10000000);
  const [aktuellerZins, setAktuellerZins] = useState(3.5);
  const [restlaufzeit, setRestlaufzeit] = useState(24);
  const [zinsbindung, setZinsbindung] = useState(12);

  const zinsPlus1 = (darlehen * (aktuellerZins + 1) / 100) - (darlehen * aktuellerZins / 100);
  const zinsPlus2 = (darlehen * (aktuellerZins + 2) / 100) - (darlehen * aktuellerZins / 100);
  const anschlussrisiko = zinsbindung < restlaufzeit;
  const monate_bis_refinanzierung = zinsbindung;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Darlehenssumme</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[darlehen]}
                onValueChange={(v) => setDarlehen(v[0])}
                min={1000000}
                max={100000000}
                step={500000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(darlehen)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Aktueller Zinssatz (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[aktuellerZins * 10]}
                onValueChange={(v) => setAktuellerZins(v[0] / 10)}
                min={10}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{aktuellerZins.toFixed(1)}%</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Restlaufzeit Projekt (Monate)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[restlaufzeit]}
                onValueChange={(v) => setRestlaufzeit(v[0])}
                min={6}
                max={120}
                step={6}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{restlaufzeit} Monate</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Zinsbindung (Monate)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[zinsbindung]}
                onValueChange={(v) => setZinsbindung(v[0])}
                min={6}
                max={120}
                step={6}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{zinsbindung} Monate</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Zinssensitivität</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Bei +1% Zins</p>
                  <p className="text-xl font-bold text-orange-600">+{formatCurrency(zinsPlus1)}</p>
                  <p className="text-xs text-muted-foreground">pro Jahr</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Bei +2% Zins</p>
                  <p className="text-xl font-bold text-red-600">+{formatCurrency(zinsPlus2)}</p>
                  <p className="text-xs text-muted-foreground">pro Jahr</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {anschlussrisiko && (
            <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">Anschlussrisiko erkannt!</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Ihre Zinsbindung ({zinsbindung} Monate) endet vor Projektabschluss ({restlaufzeit} Monate). 
                      Eine Refinanzierung zu unbekannten Konditionen wird erforderlich.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-muted-foreground">Refinanzierung erforderlich in</p>
            <p className="text-2xl font-bold">{monate_bis_refinanzierung} Monaten</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. PROJEKT-RENDITE REALITY-CHECK
// ============================================
function ProjektRenditeCheck() {
  const [verkaufspreis, setVerkaufspreis] = useState(15000000);
  const [baukosten, setBaukosten] = useState(10000000);
  const [puffer, setPuffer] = useState(10);
  const [verzoegerung, setVerzoegerung] = useState(6);
  const [kapitalbindung, setKapitalbindung] = useState(24);
  const [geplanteRendite, setGeplanteRendite] = useState(15);

  const baukostenMitPuffer = baukosten * (1 + puffer / 100);
  const verzugskosten = baukosten * 0.005 * verzoegerung;
  const gesamtkosten = baukostenMitPuffer + verzugskosten;
  const gewinn = verkaufspreis - gesamtkosten;
  const tatsaechlicheRendite = (gewinn / gesamtkosten) * 100;
  const tatsaechlicheIRR = (Math.pow(1 + gewinn / gesamtkosten, 12 / (kapitalbindung + verzoegerung)) - 1) * 100;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Geplanter Verkaufspreis</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[verkaufspreis]}
                onValueChange={(v) => setVerkaufspreis(v[0])}
                min={1000000}
                max={100000000}
                step={500000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(verkaufspreis)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Baukosten (ohne Puffer)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[baukosten]}
                onValueChange={(v) => setBaukosten(v[0])}
                min={1000000}
                max={80000000}
                step={500000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(baukosten)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Kostenpuffer (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[puffer]}
                onValueChange={(v) => setPuffer(v[0])}
                min={0}
                max={30}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{puffer}%</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Erwartete Verzögerung (Monate)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[verzoegerung]}
                onValueChange={(v) => setVerzoegerung(v[0])}
                min={0}
                max={24}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{verzoegerung} Monate</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Geplante Kapitalbindung (Monate)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[kapitalbindung]}
                onValueChange={(v) => setKapitalbindung(v[0])}
                min={12}
                max={60}
                step={3}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{kapitalbindung} Monate</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Geplante Rendite (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[geplanteRendite]}
                onValueChange={(v) => setGeplanteRendite(v[0])}
                min={5}
                max={30}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{geplanteRendite}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rendite Reality-Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Geplante IRR</p>
                  <p className="text-2xl font-bold text-primary">{geplanteRendite}%</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${
                  tatsaechlicheIRR < geplanteRendite * 0.7 
                    ? 'bg-red-100 dark:bg-red-950/30' 
                    : tatsaechlicheIRR < geplanteRendite 
                    ? 'bg-yellow-100 dark:bg-yellow-950/30'
                    : 'bg-green-100 dark:bg-green-950/30'
                }`}>
                  <p className="text-xs text-muted-foreground">Realistische IRR</p>
                  <p className={`text-2xl font-bold ${
                    tatsaechlicheIRR < geplanteRendite * 0.7 
                      ? 'text-red-600' 
                      : tatsaechlicheIRR < geplanteRendite 
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>{tatsaechlicheIRR.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gesamtkosten inkl. Puffer & Verzug</span>
                  <span className="font-medium">{formatCurrency(gesamtkosten)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Erwarteter Gewinn</span>
                  <span className={`font-medium ${gewinn < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(gewinn)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tatsächliche Kapitalbindung</span>
                  <span className="font-medium">{kapitalbindung + verzoegerung} Monate</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {tatsaechlicheIRR < geplanteRendite && (
            <div className={`p-4 rounded-lg border ${
              tatsaechlicheIRR < geplanteRendite * 0.7 
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  tatsaechlicheIRR < geplanteRendite * 0.7 ? 'text-red-600' : 'text-amber-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    tatsaechlicheIRR < geplanteRendite * 0.7 
                      ? 'text-red-800 dark:text-red-200' 
                      : 'text-amber-800 dark:text-amber-200'
                  }`}>
                    Renditeerwartung unrealistisch
                  </p>
                  <p className={`text-xs mt-1 ${
                    tatsaechlicheIRR < geplanteRendite * 0.7 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    Die realistische IRR liegt {(geplanteRendite - tatsaechlicheIRR).toFixed(1)} Prozentpunkte unter Ihrer Planung.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 5. MIET- & CASHFLOW-SIMULATOR
// ============================================
function CashflowSimulator() {
  const [mieteinnahmen, setMieteinnahmen] = useState(50000);
  const [leerstand, setLeerstand] = useState(5);
  const [kapitaldienst, setKapitaldienst] = useState(35000);
  const [nebenkosten, setNebenkosten] = useState(5000);

  const effektiveMiete = mieteinnahmen * (1 - leerstand / 100);
  const cashflow = effektiveMiete - kapitaldienst - nebenkosten;
  const dscr = effektiveMiete / (kapitaldienst + nebenkosten);
  const tragfaehig = dscr >= 1.2;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Monatliche Mieteinnahmen (brutto)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[mieteinnahmen]}
                onValueChange={(v) => setMieteinnahmen(v[0])}
                min={10000}
                max={500000}
                step={5000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(mieteinnahmen)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Erwarteter Leerstand (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[leerstand]}
                onValueChange={(v) => setLeerstand(v[0])}
                min={0}
                max={30}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{leerstand}%</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Monatlicher Kapitaldienst</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[kapitaldienst]}
                onValueChange={(v) => setKapitaldienst(v[0])}
                min={5000}
                max={400000}
                step={5000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(kapitaldienst)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Monatliche Nebenkosten/Verwaltung</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[nebenkosten]}
                onValueChange={(v) => setNebenkosten(v[0])}
                min={0}
                max={50000}
                step={1000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(nebenkosten)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className={`border-2 ${cashflow >= 0 ? 'border-green-500' : 'border-red-500'}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Monatlicher Cashflow</p>
                <p className={`text-4xl font-bold ${cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashflow)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {formatCurrency(cashflow * 12)} pro Jahr
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Debt Service Coverage Ratio (DSCR)</p>
                <p className={`text-3xl font-bold ${dscr >= 1.2 ? 'text-green-600' : dscr >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {dscr.toFixed(2)}x
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  {dscr >= 1.2 ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> Investoren-tauglich
                    </span>
                  ) : dscr >= 1.0 ? (
                    <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" /> Grenzwertig
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" /> Nicht tragfähig
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">CLN/Investoren-Eignung</p>
            <p className="text-sm">
              {dscr >= 1.3 
                ? "Sehr gut geeignet für CLN-Strukturen und institutionelle Investoren."
                : dscr >= 1.2 
                ? "Grundsätzlich geeignet, ggf. mit Nachbesserungen."
                : dscr >= 1.0
                ? "Strukturelle Anpassungen erforderlich für Kapitalmarktfähigkeit."
                : "Nicht kapitalmarktfähig ohne grundlegende Restrukturierung."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. KAPITALMARKTFÄHIGKEITS-SCORE
// ============================================
function KapitalmarktfaehigkeitsScore() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    { id: "struktur", label: "Wie klar ist Ihre Unternehmensstruktur dokumentiert?", category: "Strukturklarheit" },
    { id: "holding", label: "Haben Sie eine Holding-Struktur?", category: "Strukturklarheit" },
    { id: "reporting", label: "Wie aktuell ist Ihr Finanzreporting?", category: "Reporting" },
    { id: "controlling", label: "Haben Sie ein professionelles Controlling?", category: "Reporting" },
    { id: "pipeline", label: "Wie gefüllt ist Ihre Projektpipeline?", category: "Projektpipeline" },
    { id: "track_record", label: "Wie ist Ihr Track Record der letzten 5 Jahre?", category: "Projektpipeline" },
    { id: "skalierung", label: "Ist Ihr Geschäftsmodell skalierbar?", category: "Skalierbarkeit" },
    { id: "team", label: "Haben Sie ein erfahrenes Management-Team?", category: "Skalierbarkeit" },
    { id: "investoren", label: "Haben Sie bereits Erfahrung mit Investoren?", category: "Investoren-Readiness" },
    { id: "dokumentation", label: "Wie gut ist Ihre Investoren-Dokumentation?", category: "Investoren-Readiness" },
    { id: "compliance", label: "Wie ist Ihr Compliance-Stand?", category: "Investoren-Readiness" },
    { id: "digitalisierung", label: "Wie digitalisiert sind Ihre Prozesse?", category: "Skalierbarkeit" },
  ];

  const options = [
    { value: 0, label: "Nicht vorhanden" },
    { value: 33, label: "Grundlegend" },
    { value: 66, label: "Gut entwickelt" },
    { value: 100, label: "Professionell" },
  ];

  const calculateScore = () => {
    const answered = Object.values(answers);
    if (answered.length === 0) return 0;
    return Math.round(answered.reduce((a, b) => a + b, 0) / questions.length);
  };

  const score = calculateScore();
  const answeredCount = Object.keys(answers).length;

  const getScoreCategory = () => {
    if (score <= 40) return { label: "Nicht kapitalmarktfähig", color: "text-red-600", bg: "bg-red-100 dark:bg-red-950/30" };
    if (score <= 70) return { label: "Strukturell blockiert", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950/30" };
    return { label: "Grundsätzlich platzierbar", color: "text-green-600", bg: "bg-green-100 dark:bg-green-950/30" };
  };

  const category = getScoreCategory();

  return (
    <div className="space-y-6">
      {!showResult ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Beantwortet: {answeredCount} von {questions.length} Fragen
            </p>
            <Progress value={(answeredCount / questions.length) * 100} className="w-32" />
          </div>
          
          <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((q, index) => (
              <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs text-primary font-medium">{q.category}</span>
                    <p className="text-sm font-medium mt-1">{index + 1}. {q.label}</p>
                  </div>
                </div>
                <RadioGroup 
                  value={answers[q.id]?.toString()} 
                  onValueChange={(v) => setAnswers({...answers, [q.id]: parseInt(v)})}
                  className="flex flex-wrap gap-2"
                >
                  {options.map((opt) => (
                    <div key={opt.value} className="flex items-center">
                      <RadioGroupItem value={opt.value.toString()} id={`${q.id}-${opt.value}`} className="sr-only" />
                      <Label 
                        htmlFor={`${q.id}-${opt.value}`} 
                        className={`cursor-pointer px-3 py-1.5 rounded-full text-xs transition-colors ${
                          answers[q.id] === opt.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border'
                        }`}
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => setShowResult(true)} 
            disabled={answeredCount < questions.length}
            className="w-full"
          >
            Auswertung anzeigen
          </Button>
        </>
      ) : (
        <div className="space-y-6">
          <Card className={`border-2 ${category.bg}`}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Ihr Kapitalmarktfähigkeits-Score</p>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${score * 3.52} 352`}
                      className={score <= 40 ? 'text-red-500' : score <= 70 ? 'text-yellow-500' : 'text-green-500'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${category.color}`}>{score}</span>
                  </div>
                </div>
                <p className={`text-xl font-semibold ${category.color}`}>{category.label}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <p className="text-xs text-muted-foreground">0-40</p>
              <p className="text-sm font-medium text-red-600">Nicht kapitalmarktfähig</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
              <p className="text-xs text-muted-foreground">41-70</p>
              <p className="text-sm font-medium text-yellow-600">Strukturell blockiert</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <p className="text-xs text-muted-foreground">71-100</p>
              <p className="text-sm font-medium text-green-600">Grundsätzlich platzierbar</p>
            </div>
          </div>
          
          {score <= 70 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Strukturelle Optimierung empfohlen
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Ihr Score zeigt Verbesserungspotenzial. Eine professionelle Analyse kann die konkreten Handlungsfelder identifizieren.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button variant="outline" onClick={() => setShowResult(false)} className="w-full">
            Neu starten
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// 7. VERZÖGERUNGS- & STRUKTURKOSTEN-RECHNER
// ============================================
function VerzuegungskostenRechner() {
  const [kapitalbindung, setKapitalbindung] = useState(10000000);
  const [verzugsMonat, setVerzugsMonat] = useState(6);
  const [zinssatz, setZinssatz] = useState(5);
  const [opportunitaetskosten, setOpportunitaetskosten] = useState(8);

  const zinskosten = (kapitalbindung * (zinssatz / 100) / 12) * verzugsMonat;
  const opportunitaet = (kapitalbindung * (opportunitaetskosten / 100) / 12) * verzugsMonat;
  const gesamtkosten = zinskosten + opportunitaet;
  const kostenProJahr = gesamtkosten * (12 / verzugsMonat);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Gebundenes Kapital</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[kapitalbindung]}
                onValueChange={(v) => setKapitalbindung(v[0])}
                min={1000000}
                max={100000000}
                step={500000}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{formatCurrency(kapitalbindung)}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Monate Verzögerung</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[verzugsMonat]}
                onValueChange={(v) => setVerzugsMonat(v[0])}
                min={1}
                max={36}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{verzugsMonat} Monate</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Finanzierungszinssatz (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[zinssatz * 10]}
                onValueChange={(v) => setZinssatz(v[0] / 10)}
                min={10}
                max={150}
                step={5}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{zinssatz.toFixed(1)}%</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Opportunitätskosten / Zielrendite (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[opportunitaetskosten * 10]}
                onValueChange={(v) => setOpportunitaetskosten(v[0] / 10)}
                min={50}
                max={200}
                step={5}
                className="flex-1"
              />
              <span className="text-sm font-mono w-28 text-right">{opportunitaetskosten.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Diese Struktur kostet Sie aktuell</p>
                <p className="text-4xl font-bold text-red-600">
                  {formatCurrency(gesamtkosten)}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  bei {verzugsMonat} Monaten Verzögerung
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Zinskosten</p>
              <p className="text-lg font-semibold text-orange-600">{formatCurrency(zinskosten)}</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Opportunitätskosten</p>
              <p className="text-lg font-semibold text-purple-600">{formatCurrency(opportunitaet)}</p>
            </div>
          </div>
          
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Hochgerechnet auf 12 Monate</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(kostenProJahr)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">pro Jahr</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Zeit ist Geld – buchstäblich
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Jeder Monat Verzögerung kostet Sie {formatCurrency(gesamtkosten / verzugsMonat)}. 
                  Eine optimierte Finanzierungsstruktur kann diese Kosten signifikant reduzieren.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function FinanceCalculator() {
  // Auth and navigation for Analyse button
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Stripe checkout mutation
  const checkoutMutation = trpc.order.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Checkout');
    },
  });

  // Handle Analyse anfordern button click
  const handleAnalyseClick = () => {
    if (!user) {
      setLocation('/sign-in?redirect=/');
      toast.info('Bitte melden Sie sich an, um fortzufahren');
      return;
    }
    // Trigger Stripe checkout for ANALYSIS product
    checkoutMutation.mutate({ productId: 'ANALYSIS' });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="kapitalluecke" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="kapitalluecke" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
          >
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Kapitallücke</span>
          </TabsTrigger>
          <TabsTrigger 
            value="banken" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Banken-Score</span>
          </TabsTrigger>
          <TabsTrigger 
            value="zinsrisiko" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Zinsrisiko</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rendite" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Rendite-Check</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-auto gap-2 bg-transparent p-0 mt-2">
          <TabsTrigger 
            value="cashflow" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Cashflow</span>
          </TabsTrigger>
          <TabsTrigger 
            value="kapitalmarkt" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Kapitalmarkt-Score</span>
          </TabsTrigger>
          <TabsTrigger 
            value="verzugskosten" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Verzugskosten</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="kapitalluecke" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  Kapitallücken-Rechner
                </CardTitle>
                <CardDescription>
                  Berechnen Sie Ihre aktuelle Finanzierungslücke unter Berücksichtigung von Zeitverzug
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KapitallueckenRechner />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banken" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Banken-Abhängigkeits-Score
                </CardTitle>
                <CardDescription>
                  Bewerten Sie Ihre Abhängigkeit von Bankfinanzierungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BankenAbhaengigkeitsScore />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="zinsrisiko" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Zins- & Refinanzierungsrisiko-Check
                </CardTitle>
                <CardDescription>
                  Analysieren Sie Ihre Zinssensitivität und Anschlussrisiken
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ZinsrisikoCheck />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rendite" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Projekt-Rendite Reality-Check
                </CardTitle>
                <CardDescription>
                  Vergleichen Sie geplante vs. realistische Projektrenditen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjektRenditeCheck />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Miet- & Cashflow-Simulator
                </CardTitle>
                <CardDescription>
                  Berechnen Sie die Tragfähigkeit für Investoren und CLN-Strukturen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CashflowSimulator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kapitalmarkt" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Kapitalmarktfähigkeits-Score
                </CardTitle>
                <CardDescription>
                  Bewerten Sie Ihre Readiness für Kapitalmarktinstrumente (10-15 Fragen)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KapitalmarktfaehigkeitsScore />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verzugskosten" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Verzögerungs- & Strukturkosten-Rechner
                </CardTitle>
                <CardDescription>
                  Berechnen Sie die wahren Kosten von Projektverzögerungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VerzuegungskostenRechner />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ergebnis zeigt strukturelle Risiken?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Unsere Analyse identifiziert konkrete Handlungsfelder und entwickelt maßgeschneiderte Lösungsansätze.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="whitespace-nowrap"
              onClick={handleAnalyseClick}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? 'Lädt...' : 'Analyse anfordern'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
