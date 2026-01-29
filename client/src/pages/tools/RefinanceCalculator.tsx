import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Euro,
  Percent,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import DashboardLayout from '@/components/DashboardLayout';

export default function RefinanceCalculator() {
  // Aktuelle Finanzierung
  const [currentLoan, setCurrentLoan] = useState(500000);
  const [currentRate, setCurrentRate] = useState(4.5);
  const [currentTilgung, setCurrentTilgung] = useState(2);
  const [remainingYears, setRemainingYears] = useState(15);
  
  // Neue Finanzierung
  const [newRate, setNewRate] = useState(3.5);
  const [newTilgung, setNewTilgung] = useState(2.5);
  const [newLaufzeit, setNewLaufzeit] = useState(15);
  
  // Refinanzierungskosten
  const [vorfaelligkeitsentschaedigung, setVorfaelligkeitsentschaedigung] = useState(10000);
  const [notarkosten, setNotarkosten] = useState(5000);
  const [sonstigeKosten, setSonstigeKosten] = useState(2000);

  const calculations = useMemo(() => {
    // Aktuelle Finanzierung berechnen
    const currentMonthlyRate = (currentLoan * (currentRate / 100 + currentTilgung / 100)) / 12;
    const currentYearlyRate = currentMonthlyRate * 12;
    
    // Restschuld und Zinskosten für aktuelle Finanzierung
    let currentRestschuld = currentLoan;
    let currentTotalZinsen = 0;
    for (let i = 0; i < remainingYears; i++) {
      const zinsen = currentRestschuld * (currentRate / 100);
      const tilgung = currentYearlyRate - zinsen;
      currentTotalZinsen += zinsen;
      currentRestschuld = Math.max(0, currentRestschuld - tilgung);
    }
    
    // Neue Finanzierung berechnen
    const newMonthlyRate = (currentLoan * (newRate / 100 + newTilgung / 100)) / 12;
    const newYearlyRate = newMonthlyRate * 12;
    
    // Restschuld und Zinskosten für neue Finanzierung
    let newRestschuld = currentLoan;
    let newTotalZinsen = 0;
    for (let i = 0; i < newLaufzeit; i++) {
      const zinsen = newRestschuld * (newRate / 100);
      const tilgung = newYearlyRate - zinsen;
      newTotalZinsen += zinsen;
      newRestschuld = Math.max(0, newRestschuld - tilgung);
    }
    
    // Gesamtkosten Refinanzierung
    const refinanzierungsKosten = vorfaelligkeitsentschaedigung + notarkosten + sonstigeKosten;
    
    // Ersparnis berechnen
    const zinsErsparnis = currentTotalZinsen - newTotalZinsen;
    const nettoErsparnis = zinsErsparnis - refinanzierungsKosten;
    const monatlicheErsparnis = currentMonthlyRate - newMonthlyRate;
    
    // Break-Even in Monaten
    const breakEvenMonths = refinanzierungsKosten > 0 && monatlicheErsparnis > 0 
      ? Math.ceil(refinanzierungsKosten / monatlicheErsparnis)
      : 0;
    
    // Lohnt sich die Refinanzierung?
    const lohntSich = nettoErsparnis > 0 && breakEvenMonths < remainingYears * 12;
    
    return {
      current: {
        monthlyRate: currentMonthlyRate,
        yearlyRate: currentYearlyRate,
        totalZinsen: currentTotalZinsen,
        restschuld: currentRestschuld
      },
      new: {
        monthlyRate: newMonthlyRate,
        yearlyRate: newYearlyRate,
        totalZinsen: newTotalZinsen,
        restschuld: newRestschuld
      },
      refinanzierungsKosten,
      zinsErsparnis,
      nettoErsparnis,
      monatlicheErsparnis,
      breakEvenMonths,
      lohntSich
    };
  }, [currentLoan, currentRate, currentTilgung, remainingYears, newRate, newTilgung, newLaufzeit, vorfaelligkeitsentschaedigung, notarkosten, sonstigeKosten]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Ergebnis-Banner */}
        <Card className={`mb-8 border-2 ${calculations.lohntSich ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {calculations.lohntSich ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-amber-600" />
                )}
                <div>
                  <h2 className={`text-xl font-bold ${calculations.lohntSich ? 'text-green-800' : 'text-amber-800'}`}>
                    {calculations.lohntSich ? 'Refinanzierung empfohlen!' : 'Refinanzierung prüfen'}
                  </h2>
                  <p className={calculations.lohntSich ? 'text-green-700' : 'text-amber-700'}>
                    {calculations.lohntSich 
                      ? `Sie sparen netto ${formatCurrency(calculations.nettoErsparnis)} über die Laufzeit`
                      : 'Die Kosten übersteigen möglicherweise die Ersparnis'}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(Math.abs(calculations.monatlicheErsparnis))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {calculations.monatlicheErsparnis > 0 ? 'monatliche Ersparnis' : 'monatliche Mehrkosten'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Linke Spalte: Aktuelle Finanzierung */}
          <div className="space-y-6">
            <Card className="border-red-200">
              <CardHeader className="bg-red-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <TrendingUp className="h-5 w-5" />
                  Aktuelle Finanzierung
                </CardTitle>
                <CardDescription>Ihre bestehenden Konditionen</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Restschuld */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Aktuelle Restschuld
                    </label>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(currentLoan)}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="10000000"
                    step="10000"
                    value={currentLoan}
                    onChange={(e) => setCurrentLoan(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>€50.000</span>
                    <span>€10 Mio.</span>
                  </div>
                </div>

                {/* Aktueller Zinssatz */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Aktueller Zinssatz
                    </label>
                    <span className="text-sm font-bold text-red-600">{currentRate.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.1"
                    value={currentRate}
                    onChange={(e) => setCurrentRate(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0,5%</span>
                    <span>10%</span>
                  </div>
                </div>

                {/* Aktuelle Tilgung */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Aktuelle Tilgung
                    </label>
                    <span className="text-sm font-bold text-red-600">{currentTilgung.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={currentTilgung}
                    onChange={(e) => setCurrentTilgung(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1%</span>
                    <span>10%</span>
                  </div>
                </div>

                {/* Restlaufzeit */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Restlaufzeit
                    </label>
                    <span className="text-sm font-bold text-red-600">{remainingYears} Jahre</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={remainingYears}
                    onChange={(e) => setRemainingYears(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 Jahr</span>
                    <span>30 Jahre</span>
                  </div>
                </div>

                {/* Ergebnis aktuelle Finanzierung */}
                <div className="bg-red-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Monatliche Rate:</span>
                    <span className="font-bold text-red-700">{formatCurrency(calculations.current.monthlyRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Zinskosten gesamt:</span>
                    <span className="font-bold text-red-700">{formatCurrency(calculations.current.totalZinsen)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Restschuld nach {remainingYears} J.:</span>
                    <span className="font-bold text-red-700">{formatCurrency(calculations.current.restschuld)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refinanzierungskosten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Refinanzierungskosten</CardTitle>
                <CardDescription>Einmalige Kosten für den Wechsel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Vorfälligkeitsentschädigung</label>
                    <span className="text-sm font-bold">{formatCurrency(vorfaelligkeitsentschaedigung)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={vorfaelligkeitsentschaedigung}
                    onChange={(e) => setVorfaelligkeitsentschaedigung(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Notar- & Grundbuchkosten</label>
                    <span className="text-sm font-bold">{formatCurrency(notarkosten)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    step="500"
                    value={notarkosten}
                    onChange={(e) => setNotarkosten(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Sonstige Kosten</label>
                    <span className="text-sm font-bold">{formatCurrency(sonstigeKosten)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={sonstigeKosten}
                    onChange={(e) => setSonstigeKosten(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="bg-slate-100 rounded-lg p-3 flex justify-between">
                  <span className="font-medium">Gesamtkosten:</span>
                  <span className="font-bold text-primary">{formatCurrency(calculations.refinanzierungsKosten)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rechte Spalte: Neue Finanzierung */}
          <div className="space-y-6">
            <Card className="border-green-200">
              <CardHeader className="bg-green-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Sparkles className="h-5 w-5" />
                  Neue Finanzierung
                </CardTitle>
                <CardDescription>Ihre neuen Wunschkonditionen</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Neuer Zinssatz */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Neuer Zinssatz
                    </label>
                    <span className="text-sm font-bold text-green-600">{newRate.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.1"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0,5%</span>
                    <span>10%</span>
                  </div>
                  {newRate < currentRate && (
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {(currentRate - newRate).toFixed(2)}% günstiger
                    </div>
                  )}
                </div>

                {/* Neue Tilgung */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Neue Tilgung
                    </label>
                    <span className="text-sm font-bold text-green-600">{newTilgung.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={newTilgung}
                    onChange={(e) => setNewTilgung(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1%</span>
                    <span>10%</span>
                  </div>
                </div>

                {/* Neue Laufzeit */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Neue Zinsbindung
                    </label>
                    <span className="text-sm font-bold text-green-600">{newLaufzeit} Jahre</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={newLaufzeit}
                    onChange={(e) => setNewLaufzeit(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5 Jahre</span>
                    <span>30 Jahre</span>
                  </div>
                </div>

                {/* Ergebnis neue Finanzierung */}
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Monatliche Rate:</span>
                    <span className="font-bold text-green-700">{formatCurrency(calculations.new.monthlyRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Zinskosten gesamt:</span>
                    <span className="font-bold text-green-700">{formatCurrency(calculations.new.totalZinsen)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Restschuld nach {newLaufzeit} J.:</span>
                    <span className="font-bold text-green-700">{formatCurrency(calculations.new.restschuld)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vergleichsergebnis */}
            <Card className="border-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Ihr Einsparpotenzial
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(Math.abs(calculations.monatlicheErsparnis))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calculations.monatlicheErsparnis > 0 ? 'mtl. Ersparnis' : 'mtl. Mehrkosten'}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(calculations.zinsErsparnis)}
                      </div>
                      <div className="text-xs text-muted-foreground">Zinsersparnis</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Zinsersparnis:</span>
                      <span className="text-green-600 font-medium">+{formatCurrency(calculations.zinsErsparnis)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Refinanzierungskosten:</span>
                      <span className="text-red-600 font-medium">-{formatCurrency(calculations.refinanzierungsKosten)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Netto-Ersparnis:</span>
                      <span className={calculations.nettoErsparnis > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(calculations.nettoErsparnis)}
                      </span>
                    </div>
                  </div>

                  {calculations.breakEvenMonths > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-800">
                        <strong>Break-Even:</strong> Die Refinanzierungskosten haben sich nach{' '}
                        <strong>{calculations.breakEvenMonths} Monaten</strong> ({(calculations.breakEvenMonths / 12).toFixed(1)} Jahren) amortisiert.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
