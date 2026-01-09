import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Calculator, 
  ArrowLeft, 
  ChevronDown,
  Percent,
  RefreshCw,
  Scale,
  Target,
  Coins
} from "lucide-react";

interface CalculatorInfo {
  path: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  description: string;
}

const calculators: CalculatorInfo[] = [
  {
    path: "/tools/interest-calculator",
    name: "Zins- & Tilgungsrechner",
    shortName: "Zins & Tilgung",
    icon: Percent,
    description: "Annuitäten und Tilgungsplan berechnen"
  },
  {
    path: "/tools/refinance-calculator",
    name: "Refinanzierungs-Vergleichsrechner",
    shortName: "Refinanzierung",
    icon: RefreshCw,
    description: "Alt vs. Neu vergleichen"
  },
  {
    path: "/tools/roe-calculator",
    name: "Eigenkapitalrendite-Rechner",
    shortName: "ROE / Leverage",
    icon: Scale,
    description: "Leverage-Effekt analysieren"
  },
  // Zukünftige Rechner können hier hinzugefügt werden:
  // {
  //   path: "/tools/break-even-calculator",
  //   name: "Break-Even-Rechner",
  //   shortName: "Break-Even",
  //   icon: Target,
  //   description: "Wann lohnt sich Refinanzierung?"
  // },
  // {
  //   path: "/tools/currency-risk-calculator",
  //   name: "Währungsrisiko-Kalkulator",
  //   shortName: "Währungsrisiko",
  //   icon: Coins,
  //   description: "CHF/EUR Szenarien"
  // },
];

interface CalculatorNavProps {
  currentCalculator: string;
}

export function CalculatorNav({ currentCalculator }: CalculatorNavProps) {
  const [location] = useLocation();
  
  const current = calculators.find(c => c.path === location) || calculators[0];
  const CurrentIcon = current.icon;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Zurück zum Dashboard */}
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-gray-600 hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Zurück zum Dashboard</span>
              <span className="sm:hidden">Zurück</span>
            </Button>
          </Link>

          {/* Dropdown-Menü für Rechner-Auswahl */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CurrentIcon className="h-4 w-4 text-primary" />
                <span className="hidden md:inline">{current.name}</span>
                <span className="md:hidden">{current.shortName}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Finanzrechner
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {calculators.map((calc) => {
                const Icon = calc.icon;
                const isActive = calc.path === location;
                return (
                  <Link key={calc.path} href={calc.path}>
                    <DropdownMenuItem 
                      className={`cursor-pointer ${isActive ? 'bg-primary/10' : ''}`}
                    >
                      <div className="flex items-start gap-3 py-1">
                        <Icon className={`h-5 w-5 mt-0.5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                        <div>
                          <div className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                            {calc.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {calc.description}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                );
              })}
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-xs text-muted-foreground">
                Weitere Rechner in Kürze verfügbar
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default CalculatorNav;
