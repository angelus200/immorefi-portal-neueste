import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Calculator,
  TrendingDown,
  Calendar,
  Euro,
  PiggyBank,
  Info
} from "lucide-react";
import DashboardLayout from '@/components/DashboardLayout';

interface AmortizationRow {
  year: number;
  startBalance: number;
  annualPayment: number;
  interestPortion: number;
  principalPortion: number;
  endBalance: number;
}

export default function InterestCalculator() {
  // Eingabewerte
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [repaymentRate, setRepaymentRate] = useState(2);

  // Berechnungen
  const calculations = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const annualRate = interestRate / 100;
    const initialRepayment = repaymentRate / 100;
    
    // Annuität berechnen (Zins + anfängliche Tilgung)
    const annuity = principal * (annualRate + initialRepayment);
    const monthlyPayment = annuity / 12;
    
    // Tilgungsplan erstellen
    const amortizationSchedule: AmortizationRow[] = [];
    let remainingBalance = principal;
    let totalInterest = 0;
    let totalPayment = 0;
    let yearsToPayoff = 0;
    
    for (let year = 1; year <= Math.min(loanTerm, 50) && remainingBalance > 0; year++) {
      const startBalance = remainingBalance;
      const interestPortion = startBalance * annualRate;
      let principalPortion = annuity - interestPortion;
      
      // Letzte Rate anpassen falls Restschuld kleiner als Tilgung
      if (principalPortion > remainingBalance) {
        principalPortion = remainingBalance;
      }
      
      const endBalance = Math.max(0, startBalance - principalPortion);
      const actualPayment = interestPortion + principalPortion;
      
      totalInterest += interestPortion;
      totalPayment += actualPayment;
      remainingBalance = endBalance;
      yearsToPayoff = year;
      
      amortizationSchedule.push({
        year,
        startBalance,
        annualPayment: actualPayment,
        interestPortion,
        principalPortion,
        endBalance
      });
      
      if (endBalance <= 0) break;
    }
    
    // Restschuld nach Zinsbindung
    const remainingAfterTerm = amortizationSchedule[loanTerm - 1]?.endBalance || 0;
    
    return {
      monthlyPayment,
      annuity,
      totalInterest,
      totalPayment,
      remainingAfterTerm,
      yearsToPayoff: remainingBalance > 0 ? `>${loanTerm}` : yearsToPayoff.toString(),
      amortizationSchedule
    };
  }, [loanAmount, interestRate, loanTerm, repaymentRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCurrencyPrecise = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Eingabebereich */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Euro className="w-5 h-5 text-primary" />
                Finanzierungsparameter
              </h2>

              <div className="space-y-6">
                {/* Darlehenssumme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Darlehenssumme
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="50000"
                      max="10000000"
                      step="10000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">€50.000</span>
                      <span className="text-lg font-bold text-primary">{formatCurrency(loanAmount)}</span>
                      <span className="text-xs text-gray-500">€10 Mio.</span>
                    </div>
                  </div>
                </div>

                {/* Zinssatz */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sollzinssatz (p.a.)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">0,5%</span>
                      <span className="text-lg font-bold text-primary">{interestRate.toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">10%</span>
                    </div>
                  </div>
                </div>

                {/* Anfängliche Tilgung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anfängliche Tilgung (p.a.)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={repaymentRate}
                      onChange={(e) => setRepaymentRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">1%</span>
                      <span className="text-lg font-bold text-primary">{repaymentRate.toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">10%</span>
                    </div>
                  </div>
                </div>

                {/* Zinsbindung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zinsbindung (Jahre)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">5 Jahre</span>
                      <span className="text-lg font-bold text-primary">{loanTerm} Jahre</span>
                      <span className="text-xs text-gray-500">30 Jahre</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info-Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Hinweis</p>
                    <p>Die Berechnung basiert auf einem Annuitätendarlehen mit gleichbleibender Rate. Die tatsächlichen Konditionen können abweichen.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ergebnisbereich */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hauptergebnisse */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Monatliche Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyPrecise(calculations.monthlyPayment)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Euro className="w-4 h-4" />
                  <span className="text-xs font-medium">Jährliche Annuität</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.annuity)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">Restschuld nach {loanTerm} J.</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(calculations.remainingAfterTerm)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <PiggyBank className="w-4 h-4" />
                  <span className="text-xs font-medium">Zinskosten gesamt</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(calculations.totalInterest)}</p>
              </div>
            </div>

            {/* Visualisierung */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kostenaufteilung</h3>
              <div className="h-8 rounded-full overflow-hidden flex bg-gray-100">
                <div 
                  className="bg-primary transition-all duration-500"
                  style={{ width: `${(loanAmount / calculations.totalPayment) * 100}%` }}
                  title={`Tilgung: ${formatCurrency(loanAmount)}`}
                />
                <div 
                  className="bg-red-400 transition-all duration-500"
                  style={{ width: `${(calculations.totalInterest / calculations.totalPayment) * 100}%` }}
                  title={`Zinsen: ${formatCurrency(calculations.totalInterest)}`}
                />
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-gray-600">Tilgung: {formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-gray-600">Zinsen: {formatCurrency(calculations.totalInterest)}</span>
                </div>
              </div>
            </div>

            {/* Tilgungsplan */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tilgungsplan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600">Jahr</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Restschuld Anfang</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Rate/Jahr</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Zinsanteil</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Tilgungsanteil</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Restschuld Ende</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.amortizationSchedule.slice(0, 10).map((row, index) => (
                      <tr 
                        key={row.year} 
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                      >
                        <td className="py-3 px-2 font-medium">{row.year}</td>
                        <td className="py-3 px-2 text-right">{formatCurrency(row.startBalance)}</td>
                        <td className="py-3 px-2 text-right">{formatCurrency(row.annualPayment)}</td>
                        <td className="py-3 px-2 text-right text-red-600">{formatCurrency(row.interestPortion)}</td>
                        <td className="py-3 px-2 text-right text-green-600">{formatCurrency(row.principalPortion)}</td>
                        <td className="py-3 px-2 text-right font-medium">{formatCurrency(row.endBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {calculations.amortizationSchedule.length > 10 && (
                  <p className="text-center text-gray-500 text-sm mt-4">
                    ... und {calculations.amortizationSchedule.length - 10} weitere Jahre
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
