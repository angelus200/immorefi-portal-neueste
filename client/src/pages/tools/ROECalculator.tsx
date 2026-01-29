import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Euro,
  Percent,
  Building2,
  PiggyBank,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";
import DashboardLayout from '@/components/DashboardLayout';

export default function ROECalculator() {
  // Immobiliendaten
  const [propertyValue, setPropertyValue] = useState(1000000);
  const [rentalIncome, setRentalIncome] = useState(48000); // Jahresmieteinnahmen
  const [operatingCosts, setOperatingCosts] = useState(12000); // Bewirtschaftungskosten p.a.
  
  // Finanzierung
  const [equityRatio, setEquityRatio] = useState(30); // Eigenkapitalquote in %
  const [interestRate, setInterestRate] = useState(4.0);
  const [appreciationRate, setAppreciationRate] = useState(2.0); // Wertsteigerung p.a.

  const calculations = useMemo(() => {
    // Grundberechnungen
    const equity = propertyValue * (equityRatio / 100);
    const debt = propertyValue - equity;
    const netRentalIncome = rentalIncome - operatingCosts;
    const annualInterest = debt * (interestRate / 100);
    const cashflowAfterInterest = netRentalIncome - annualInterest;
    const appreciation = propertyValue * (appreciationRate / 100);
    
    // Renditen berechnen
    const grossYield = (rentalIncome / propertyValue) * 100; // Bruttomietrendite
    const netYield = (netRentalIncome / propertyValue) * 100; // Nettomietrendite (Objektrendite)
    
    // ROE ohne Leverage (100% EK)
    const roeWithoutLeverage = ((netRentalIncome + appreciation) / propertyValue) * 100;
    
    // ROE mit Leverage
    const totalReturnOnEquity = cashflowAfterInterest + appreciation;
    const roeWithLeverage = (totalReturnOnEquity / equity) * 100;
    
    // Leverage-Effekt
    const leverageEffect = roeWithLeverage - roeWithoutLeverage;
    const leverageMultiplier = equity > 0 ? propertyValue / equity : 0;
    
    // Positiver oder negativer Leverage?
    const isPositiveLeverage = netYield > interestRate;
    
    // DSCR (Debt Service Coverage Ratio)
    const dscr = annualInterest > 0 ? netRentalIncome / annualInterest : 0;
    
    // Szenarien für verschiedene EK-Quoten
    const scenarios = [100, 50, 30, 20, 10].map(ekQuote => {
      const ek = propertyValue * (ekQuote / 100);
      const fk = propertyValue - ek;
      const zinsen = fk * (interestRate / 100);
      const cfNachZinsen = netRentalIncome - zinsen;
      const gesamtrendite = cfNachZinsen + appreciation;
      const roe = ek > 0 ? (gesamtrendite / ek) * 100 : 0;
      return {
        ekQuote,
        ek,
        fk,
        zinsen,
        cfNachZinsen,
        roe
      };
    });

    return {
      equity,
      debt,
      netRentalIncome,
      annualInterest,
      cashflowAfterInterest,
      appreciation,
      grossYield,
      netYield,
      roeWithoutLeverage,
      roeWithLeverage,
      leverageEffect,
      leverageMultiplier,
      isPositiveLeverage,
      dscr,
      scenarios
    };
  }, [propertyValue, rentalIncome, operatingCosts, equityRatio, interestRate, appreciationRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(2) + '%';
  };

  // Farbe basierend auf ROE
  const getRoeColor = (roe: number) => {
    if (roe >= 15) return 'text-green-600';
    if (roe >= 8) return 'text-blue-600';
    if (roe >= 0) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Leverage-Effekt Banner */}
        <Card className={`mb-8 border-2 ${calculations.isPositiveLeverage ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {calculations.isPositiveLeverage ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                )}
                <div>
                  <h2 className={`text-xl font-bold ${calculations.isPositiveLeverage ? 'text-green-800' : 'text-red-800'}`}>
                    {calculations.isPositiveLeverage ? 'Positiver Leverage-Effekt!' : 'Negativer Leverage-Effekt!'}
                  </h2>
                  <p className={calculations.isPositiveLeverage ? 'text-green-700' : 'text-red-700'}>
                    {calculations.isPositiveLeverage 
                      ? `Objektrendite (${formatPercent(calculations.netYield)}) > Fremdkapitalzins (${formatPercent(interestRate)})`
                      : `Objektrendite (${formatPercent(calculations.netYield)}) < Fremdkapitalzins (${formatPercent(interestRate)})`}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className={`text-4xl font-bold ${getRoeColor(calculations.roeWithLeverage)}`}>
                  {formatPercent(calculations.roeWithLeverage)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Eigenkapitalrendite (ROE)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Linke Spalte: Eingaben */}
          <div className="space-y-6">
            {/* Immobiliendaten */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Immobiliendaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Kaufpreis */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Kaufpreis / Verkehrswert
                    </label>
                    <span className="text-sm font-bold text-primary">{formatCurrency(propertyValue)}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="50000"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>€100.000</span>
                    <span>€10 Mio.</span>
                  </div>
                </div>

                {/* Mieteinnahmen */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Jahresmieteinnahmen (brutto)
                    </label>
                    <span className="text-sm font-bold text-primary">{formatCurrency(rentalIncome)}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="500000"
                    step="1000"
                    value={rentalIncome}
                    onChange={(e) => setRentalIncome(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>€5.000</span>
                    <span>€500.000</span>
                  </div>
                </div>

                {/* Bewirtschaftungskosten */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Bewirtschaftungskosten p.a.</label>
                    <span className="text-sm font-bold text-primary">{formatCurrency(operatingCosts)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={operatingCosts}
                    onChange={(e) => setOperatingCosts(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>€0</span>
                    <span>€100.000</span>
                  </div>
                </div>

                {/* Wertsteigerung */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Erwartete Wertsteigerung p.a.
                    </label>
                    <span className="text-sm font-bold text-primary">{appreciationRate.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="10"
                    step="0.5"
                    value={appreciationRate}
                    onChange={(e) => setAppreciationRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-5%</span>
                    <span>+10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Finanzierung */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Finanzierungsstruktur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Eigenkapitalquote */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Eigenkapitalquote</label>
                    <span className="text-sm font-bold text-primary">{equityRatio}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={equityRatio}
                    onChange={(e) => setEquityRatio(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10% (max. Hebel)</span>
                    <span>100% (kein FK)</span>
                  </div>
                </div>

                {/* Zinssatz */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Fremdkapitalzins
                    </label>
                    <span className="text-sm font-bold text-primary">{interestRate.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0,5%</span>
                    <span>10%</span>
                  </div>
                </div>

                {/* Kapitalstruktur Visualisierung */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">Kapitalstruktur</div>
                  <div className="flex h-8 rounded-lg overflow-hidden mb-2">
                    <div 
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${equityRatio}%` }}
                    >
                      {equityRatio >= 15 && 'EK'}
                    </div>
                    <div 
                      className="bg-red-400 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${100 - equityRatio}%` }}
                    >
                      {(100 - equityRatio) >= 15 && 'FK'}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">EK: {formatCurrency(calculations.equity)}</span>
                    <span className="text-red-500">FK: {formatCurrency(calculations.debt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rechte Spalte: Ergebnisse */}
          <div className="space-y-6">
            {/* Kennzahlen */}
            <Card>
              <CardHeader>
                <CardTitle>Renditekennzahlen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-slate-700">
                      {formatPercent(calculations.grossYield)}
                    </div>
                    <div className="text-xs text-muted-foreground">Bruttomietrendite</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-slate-700">
                      {formatPercent(calculations.netYield)}
                    </div>
                    <div className="text-xs text-muted-foreground">Nettomietrendite</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {formatPercent(calculations.roeWithoutLeverage)}
                    </div>
                    <div className="text-xs text-muted-foreground">ROE ohne Hebel</div>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${calculations.isPositiveLeverage ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={`text-2xl font-bold ${getRoeColor(calculations.roeWithLeverage)}`}>
                      {formatPercent(calculations.roeWithLeverage)}
                    </div>
                    <div className="text-xs text-muted-foreground">ROE mit Hebel</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Leverage-Effekt:</span>
                    <span className={`text-xl font-bold ${calculations.leverageEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculations.leverageEffect >= 0 ? '+' : ''}{formatPercent(calculations.leverageEffect)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span>Leverage-Multiplikator:</span>
                    <span className="font-medium">{calculations.leverageMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span>DSCR (Schuldendienstdeckung):</span>
                    <span className={`font-medium ${calculations.dscr >= 1.2 ? 'text-green-600' : 'text-amber-600'}`}>
                      {calculations.dscr.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cashflow-Übersicht */}
            <Card>
              <CardHeader>
                <CardTitle>Jährlicher Cashflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Mieteinnahmen (brutto):</span>
                    <span className="font-medium text-green-600">+{formatCurrency(rentalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bewirtschaftungskosten:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(operatingCosts)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Nettomieteinnahmen:</span>
                    <span className="font-medium">{formatCurrency(calculations.netRentalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zinskosten ({formatPercent(interestRate)} auf {formatCurrency(calculations.debt)}):</span>
                    <span className="font-medium text-red-600">-{formatCurrency(calculations.annualInterest)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Cashflow nach Zinsen:</span>
                    <span className={calculations.cashflowAfterInterest >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(calculations.cashflowAfterInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>+ Wertsteigerung ({formatPercent(appreciationRate)}):</span>
                    <span>+{formatCurrency(calculations.appreciation)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leverage-Szenarien */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Leverage-Szenarien
                </CardTitle>
                <CardDescription>ROE bei verschiedenen Eigenkapitalquoten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculations.scenarios.map((scenario) => (
                    <div 
                      key={scenario.ekQuote}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        scenario.ekQuote === equityRatio ? 'bg-primary/10 border-2 border-primary' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium">{scenario.ekQuote}% EK</div>
                        <div className="flex h-4 w-24 rounded overflow-hidden">
                          <div className="bg-green-500" style={{ width: `${scenario.ekQuote}%` }} />
                          <div className="bg-red-400" style={{ width: `${100 - scenario.ekQuote}%` }} />
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${getRoeColor(scenario.roe)}`}>
                        {formatPercent(scenario.roe)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    <strong>Leverage-Effekt:</strong> Bei positivem Leverage (Objektrendite {'>'} Fremdkapitalzins) 
                    steigt die EK-Rendite mit sinkendem EK-Anteil. Bei negativem Leverage ist es umgekehrt.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
