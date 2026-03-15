import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Building2, ClipboardCheck, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

// ─── Schritt-Definition ───────────────────────────────────────────────────────

const steps = [
  { id: 1, title: "Ihr Profil",    icon: Building2 },
  { id: 2, title: "Bestätigung",   icon: ClipboardCheck },
];

// ─── Typen ────────────────────────────────────────────────────────────────────

type InvestorType = "private_professional" | "institutional" | "family_office" | "fund" | "other";
type ExperienceType = "under_2_years" | "2_to_5_years" | "5_to_10_years" | "over_10_years";
type InvestmentPrefType = "nachrangdarlehen" | "stille_beteiligung" | "anleihe" | "genussrecht";

interface FormData {
  companyName: string;
  investorType: InvestorType | "";
  investmentExperience: ExperienceType | "";
  preferredVolume: string;
  preferredTypes: InvestmentPrefType[];
  selfDeclaration: boolean;
}

// ─── Investmenttypen als Checkboxen ──────────────────────────────────────────

const INVESTMENT_TYPES: { value: InvestmentPrefType; label: string }[] = [
  { value: "nachrangdarlehen",   label: "Nachrangdarlehen" },
  { value: "stille_beteiligung", label: "Stille Beteiligung" },
  { value: "anleihe",            label: "Anleihe" },
  { value: "genussrecht",        label: "Genussrecht" },
];

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function InvestorOnboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormData>({
    companyName: "",
    investorType: "",
    investmentExperience: "",
    preferredVolume: "",
    preferredTypes: [],
    selfDeclaration: false,
  });

  // Wenn User bereits Investor ist → direkt weiterleiten
  const { data: statusData, isLoading: statusLoading } = trpc.clubDeal.checkStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (statusData?.isInvestor) {
      setLocation("/investor/dashboard");
    }
  }, [statusData, setLocation]);

  const onboardMutation = trpc.clubDeal.onboard.useMutation({
    onSuccess: () => {
      toast.success("Willkommen im Investoren-Bereich!");
      window.location.href = "/investor/dashboard";
    },
    onError: (e) => {
      toast.error(`Fehler: ${e.message}`);
      setIsSubmitting(false);
    },
  });

  // Loading-State
  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nicht eingeloggt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Bitte melden Sie sich an, um sich als Investor zu registrieren.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/sign-in"}>
              Anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  function togglePrefType(type: InvestmentPrefType) {
    setForm(prev => ({
      ...prev,
      preferredTypes: prev.preferredTypes.includes(type)
        ? prev.preferredTypes.filter(t => t !== type)
        : [...prev.preferredTypes, type],
    }));
  }

  function handleNext() {
    // Schritt 1 Validierung
    if (currentStep === 1) {
      if (!form.investorType) {
        toast.error("Bitte wählen Sie Ihren Investorentyp");
        return;
      }
      if (!form.investmentExperience) {
        toast.error("Bitte wählen Sie Ihre Investmenterfahrung");
        return;
      }
      setCurrentStep(2);
      window.scrollTo(0, 0);
      return;
    }

    // Schritt 2: Absenden
    if (!form.selfDeclaration) {
      toast.error("Bitte bestätigen Sie die Selbstauskunft");
      return;
    }
    setIsSubmitting(true);
    onboardMutation.mutate({
      companyName: form.companyName || undefined,
      investorType: form.investorType as InvestorType,
      investmentExperience: form.investmentExperience as ExperienceType,
      selfDeclaration: true,
      preferredVolume: form.preferredVolume ? Math.round(parseFloat(form.preferredVolume) * 100) : undefined,
      preferredTypes: form.preferredTypes.length > 0 ? form.preferredTypes : undefined,
    });
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-3xl">

        {/* ─── Header ─── */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-bold text-2xl text-primary">NON</span>
            <span className="font-bold text-2xl text-primary bg-primary/10 px-2 rounded">DOM</span>
            <span className="font-bold text-2xl text-primary">GROUP</span>
          </div>
          <h1 className="text-2xl font-bold">Investoren-Registrierung</h1>
          <p className="text-muted-foreground mt-2">
            Erhalten Sie Zugang zu exklusiven Club Deal Projekten
          </p>
        </div>

        {/* ─── Progress ─── */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                          ? "border-primary text-primary bg-primary/10"
                          : "border-muted-foreground/30 text-muted-foreground/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isCurrent ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Schritt 1: Profil ─── */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Ihr Investoren-Profil</CardTitle>
              <CardDescription>
                Diese Informationen helfen uns, Ihnen passende Projekte vorzuschlagen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Firmenname */}
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Firmenname <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                  placeholder="z.B. Mustermann Investments GmbH"
                />
              </div>

              {/* Investorentyp */}
              <div className="space-y-1.5">
                <Label>Investorentyp *</Label>
                <Select
                  value={form.investorType}
                  onValueChange={v => setForm(p => ({ ...p, investorType: v as InvestorType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bitte wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private_professional">Professioneller Privatanleger</SelectItem>
                    <SelectItem value="institutional">Institutioneller Investor</SelectItem>
                    <SelectItem value="family_office">Family Office</SelectItem>
                    <SelectItem value="fund">Fonds</SelectItem>
                    <SelectItem value="other">Sonstige</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Investmenterfahrung */}
              <div className="space-y-1.5">
                <Label>Investmenterfahrung in Immobilien *</Label>
                <Select
                  value={form.investmentExperience}
                  onValueChange={v => setForm(p => ({ ...p, investmentExperience: v as ExperienceType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bitte wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_2_years">Unter 2 Jahre</SelectItem>
                    <SelectItem value="2_to_5_years">2 – 5 Jahre</SelectItem>
                    <SelectItem value="5_to_10_years">5 – 10 Jahre</SelectItem>
                    <SelectItem value="over_10_years">Über 10 Jahre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bevorzugtes Investitionsvolumen */}
              <div className="space-y-1.5">
                <Label htmlFor="prefVolume">
                  Bevorzugtes Investitionsvolumen pro Projekt (€)
                  <span className="text-muted-foreground text-xs ml-1">(optional)</span>
                </Label>
                <Input
                  id="prefVolume"
                  type="number"
                  value={form.preferredVolume}
                  onChange={e => setForm(p => ({ ...p, preferredVolume: e.target.value }))}
                  placeholder="z.B. 250000"
                />
              </div>

              {/* Bevorzugte Investmenttypen */}
              <div className="space-y-2">
                <Label>Bevorzugte Investmenttypen <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <div className="grid grid-cols-2 gap-3">
                  {INVESTMENT_TYPES.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`pref-${value}`}
                        checked={form.preferredTypes.includes(value)}
                        onCheckedChange={() => togglePrefType(value)}
                      />
                      <label htmlFor={`pref-${value}`} className="text-sm cursor-pointer">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Schritt 2: Bestätigung ─── */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Selbstauskunft & Bestätigung</CardTitle>
              <CardDescription>
                Bitte lesen und bestätigen Sie die folgende Erklärung sorgfältig.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Zusammenfassung */}
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <p className="font-medium">Ihre Angaben:</p>
                <dl className="grid grid-cols-2 gap-2 text-muted-foreground">
                  {form.companyName && (
                    <>
                      <dt>Unternehmen</dt>
                      <dd className="font-medium text-foreground">{form.companyName}</dd>
                    </>
                  )}
                  <dt>Investorentyp</dt>
                  <dd className="font-medium text-foreground capitalize">
                    {({
                      private_professional: "Prof. Privatanleger",
                      institutional: "Institutionell",
                      family_office: "Family Office",
                      fund: "Fonds",
                      other: "Sonstige",
                    } as Record<string, string>)[form.investorType] ?? form.investorType}
                  </dd>
                  <dt>Erfahrung</dt>
                  <dd className="font-medium text-foreground">
                    {({
                      under_2_years: "Unter 2 Jahre",
                      "2_to_5_years": "2 – 5 Jahre",
                      "5_to_10_years": "5 – 10 Jahre",
                      over_10_years: "Über 10 Jahre",
                    } as Record<string, string>)[form.investmentExperience] ?? form.investmentExperience}
                  </dd>
                </dl>
              </div>

              {/* Pflicht-Checkbox */}
              <div className="flex items-start gap-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <Checkbox
                  id="selfDeclaration"
                  checked={form.selfDeclaration}
                  onCheckedChange={(checked) =>
                    setForm(p => ({ ...p, selfDeclaration: checked === true }))
                  }
                  className="mt-0.5 flex-shrink-0"
                />
                <label htmlFor="selfDeclaration" className="text-sm leading-relaxed cursor-pointer">
                  Ich bestätige, dass ich ein <strong>professioneller oder qualifizierter Investor</strong> bin
                  und die mit Immobilien-Investments verbundenen Risiken verstehe und akzeptiere.
                  Ich bin mir bewusst, dass Club Deal Investments illiquide sind und ein
                  vollständiger Kapitalverlust möglich ist.
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                Mit der Registrierung bestätigen Sie, die Nutzungsbedingungen und Datenschutzrichtlinien
                von Non Dom Group / ImmoRefi gelesen und akzeptiert zu haben.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ─── Navigation ─── */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            {currentStep === steps.length ? "Registrierung abschließen" : "Weiter"}
          </Button>
        </div>
      </div>
    </div>
  );
}
