import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, User, Building2, FileText, Target, Upload } from "lucide-react";
import OnboardingDocumentUpload from "@/components/OnboardingDocumentUpload";
import { trpc } from "@/lib/trpc";

const steps = [
  { id: 1, title: "Persönliche Daten", icon: User },
  { id: 2, title: "Unternehmen", icon: Building2 },
  { id: 3, title: "Projektdetails", icon: Target },
  { id: 4, title: "Dokumente", icon: FileText },
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Personal
    firstName: "",
    lastName: "",
    phone: "",
    position: "",
    // Company
    companyName: "",
    companyType: "",
    industry: "",
    employees: "",
    website: "",
    // Project
    kapitalbedarf: "",
    zeithorizont: "",
    verwendungszweck: "",
    projektbeschreibung: "",
    // Documents
    documents: [] as string[],
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Bitte melden Sie sich an, um das Onboarding zu starten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => window.location.href = "/sign-in"}
            >
              Anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  const completeOnboarding = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      toast.success("Onboarding abgeschlossen! Wir melden uns innerhalb von 2 Werktagen bei Ihnen.");
      setLocation("/dashboard");
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit onboarding with all form data
      completeOnboarding.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-bold text-2xl text-primary">NON</span>
            <span className="font-bold text-2xl text-primary bg-primary/10 px-2 rounded">DOM</span>
          </div>
          <h1 className="text-2xl font-bold">Willkommen bei ImmoRefi</h1>
          <p className="text-muted-foreground mt-2">
            Vervollständigen Sie Ihr Profil, um loszulegen
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-primary text-primary-foreground' : 
                      isCurrent ? 'bg-primary/20 border-2 border-primary' : 
                      'bg-muted'}
                  `}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              Schritt {currentStep} von {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Data */}
            {currentStep === 1 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      placeholder="Max"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="+49 123 456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => updateFormData("position", e.target.value)}
                      placeholder="Geschäftsführer"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Company */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Unternehmensname *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData("companyName", e.target.value)}
                    placeholder="Musterfirma GmbH"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyType">Rechtsform</Label>
                    <Select 
                      value={formData.companyType} 
                      onValueChange={(v) => updateFormData("companyType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmbh">GmbH</SelectItem>
                        <SelectItem value="ag">AG</SelectItem>
                        <SelectItem value="kg">KG</SelectItem>
                        <SelectItem value="ohg">OHG</SelectItem>
                        <SelectItem value="einzelunternehmen">Einzelunternehmen</SelectItem>
                        <SelectItem value="other">Sonstige</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Branche</Label>
                    <Select 
                      value={formData.industry} 
                      onValueChange={(v) => updateFormData("industry", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immobilien">Immobilien</SelectItem>
                        <SelectItem value="handel">Handel</SelectItem>
                        <SelectItem value="dienstleistung">Dienstleistung</SelectItem>
                        <SelectItem value="produktion">Produktion</SelectItem>
                        <SelectItem value="tech">Technologie</SelectItem>
                        <SelectItem value="other">Sonstige</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employees">Mitarbeiter</Label>
                    <Select 
                      value={formData.employees} 
                      onValueChange={(v) => updateFormData("employees", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateFormData("website", e.target.value)}
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Project Details */}
            {currentStep === 3 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="kapitalbedarf">Kapitalbedarf *</Label>
                    <Select 
                      value={formData.kapitalbedarf} 
                      onValueChange={(v) => updateFormData("kapitalbedarf", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500k-1m">500.000 € - 1 Mio. €</SelectItem>
                        <SelectItem value="1m-5m">1 Mio. € - 5 Mio. €</SelectItem>
                        <SelectItem value="5m-10m">5 Mio. € - 10 Mio. €</SelectItem>
                        <SelectItem value="10m-50m">10 Mio. € - 50 Mio. €</SelectItem>
                        <SelectItem value="50m+">Über 50 Mio. €</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zeithorizont">Zeithorizont *</Label>
                    <Select 
                      value={formData.zeithorizont} 
                      onValueChange={(v) => updateFormData("zeithorizont", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sofort">Sofort</SelectItem>
                        <SelectItem value="1-3m">1-3 Monate</SelectItem>
                        <SelectItem value="3-6m">3-6 Monate</SelectItem>
                        <SelectItem value="6-12m">6-12 Monate</SelectItem>
                        <SelectItem value="12m+">Über 12 Monate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verwendungszweck">Verwendungszweck</Label>
                  <Select 
                    value={formData.verwendungszweck} 
                    onValueChange={(v) => updateFormData("verwendungszweck", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refinanzierung">Refinanzierung</SelectItem>
                      <SelectItem value="akquisition">Akquisition</SelectItem>
                      <SelectItem value="entwicklung">Projektentwicklung</SelectItem>
                      <SelectItem value="bestand">Bestandsfinanzierung</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projektbeschreibung">Projektbeschreibung</Label>
                  <Textarea
                    id="projektbeschreibung"
                    rows={4}
                    value={formData.projektbeschreibung}
                    onChange={(e) => updateFormData("projektbeschreibung", e.target.value)}
                    placeholder="Beschreiben Sie Ihr Projekt kurz..."
                  />
                </div>
              </>
            )}

            {/* Step 4: Documents (Optional) */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Optional:</strong> Sie können Dokumente jetzt hochladen oder später im Dashboard nachholen. 
                    Klicken Sie auf "Abschließen", um fortzufahren.
                  </p>
                </div>
                <OnboardingDocumentUpload />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <div className="flex gap-2">
                {currentStep === 4 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => completeOnboarding.mutate(formData)}
                    disabled={completeOnboarding.isPending}
                  >
                    Überspringen & Abschließen
                  </Button>
                )}
                <Button onClick={handleNext} disabled={completeOnboarding.isPending}>
                  {currentStep === steps.length ? (
                    <>
                      {completeOnboarding.isPending ? "Speichern..." : "Abschließen"}
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Weiter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
