import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { toast } from "sonner";

interface ContractGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContractCreated?: (contract: any) => void;
}

export function ContractGenerator({ open, onOpenChange, onContractCreated }: ContractGeneratorProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState<string>("");

  const { data: templates = [] } = trpc.contractTemplate.list.useQuery();
  const { data: users = [] } = trpc.user.list.useQuery();
  const { data: selectedTemplate } = trpc.contractTemplate.get.useQuery(
    { id: selectedTemplateId! },
    { enabled: !!selectedTemplateId }
  );

  const previewMutation = trpc.contractTemplate.preview.useQuery(
    {
      id: selectedTemplateId!,
      values: placeholderValues,
    },
    { enabled: false }
  );

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setStep(2);
  };

  const handleUserSelect = (value: string) => {
    setSelectedUserId(value);
  };

  const handleNextToPlaceholders = () => {
    if (!selectedUserId) {
      toast.error("Bitte wählen Sie einen Kunden aus");
      return;
    }

    // Initialize placeholder values with empty strings or defaults
    if (selectedTemplate?.placeholders) {
      const initialValues: Record<string, string> = {};
      selectedTemplate.placeholders.forEach((ph) => {
        initialValues[ph] = "";
      });

      // Auto-fill DATUM with today's date
      if (initialValues["DATUM"] !== undefined) {
        initialValues["DATUM"] = new Date().toLocaleDateString("de-DE");
      }

      // Auto-fill customer data if available
      const selectedUser = users.find((u) => u.id.toString() === selectedUserId);
      if (selectedUser) {
        if (initialValues["AUFTRAGGEBER_NAME"] !== undefined) {
          initialValues["AUFTRAGGEBER_NAME"] = selectedUser.name || "";
        }
        if (initialValues["AUFTRAGGEBER_ADRESSE"] !== undefined) {
          const address = [selectedUser.street, selectedUser.zip, selectedUser.city]
            .filter(Boolean)
            .join(", ");
          initialValues["AUFTRAGGEBER_ADRESSE"] = address;
        }
      }

      setPlaceholderValues(initialValues);
    }
    setStep(3);
  };

  const handleGeneratePreview = async () => {
    // Validate all placeholders are filled
    const emptyFields = Object.entries(placeholderValues).filter(
      ([_, value]) => !value.trim()
    );

    if (emptyFields.length > 0) {
      toast.error(`Bitte füllen Sie alle Felder aus`);
      return;
    }

    try {
      const result = await previewMutation.refetch();
      if (result.data) {
        setPreviewContent(result.data.content);
        setStep(4);
      }
    } catch (error: any) {
      toast.error(`Fehler beim Generieren: ${error.message}`);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedTemplateId(null);
    setSelectedUserId("");
    setPlaceholderValues({});
    setPreviewContent("");
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSave = async () => {
    // Here you would save the contract to the database
    // For now, just show success message
    toast.success("Vertrag erfolgreich erstellt");

    if (onContractCreated) {
      onContractCreated({
        templateId: selectedTemplateId,
        userId: selectedUserId,
        content: previewContent,
      });
    }

    handleClose();
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      fondstrukturierung: "Fondstrukturierung",
      anleihen: "Anleihen / CLN / AMC",
      beratung: "Beratung",
      sonstige: "Sonstige",
    };
    return labels[category] || category;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vertrag erstellen</DialogTitle>
          <DialogDescription>
            Schritt {step} von 4: {
              step === 1 ? "Vorlage auswählen" :
              step === 2 ? "Kunde auswählen" :
              step === 3 ? "Platzhalter ausfüllen" :
              "Vorschau & Speichern"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wählen Sie eine Vertragsvorlage</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <FileText className="h-8 w-8 text-primary" />
                      <Badge>{getCategoryLabel(template.category)}</Badge>
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {Array.isArray(template.placeholders)
                        ? template.placeholders.length
                        : 0}{" "}
                      Platzhalter
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: User Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wählen Sie den Kunden</h3>
            <div className="space-y-2">
              <Label htmlFor="user">Kunde</Label>
              <Select value={selectedUserId} onValueChange={handleUserSelect}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Kunde auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Placeholder Values */}
        {step === 3 && selectedTemplate && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vertragsdetails eingeben</h3>
            <div className="grid gap-4">
              {selectedTemplate.placeholders &&
                selectedTemplate.placeholders.map((placeholder) => (
                  <div key={placeholder} className="space-y-2">
                    <Label htmlFor={placeholder}>
                      {placeholder.replace(/_/g, " ")}
                    </Label>
                    <Input
                      id={placeholder}
                      value={placeholderValues[placeholder] || ""}
                      onChange={(e) =>
                        setPlaceholderValues({
                          ...placeholderValues,
                          [placeholder]: e.target.value,
                        })
                      }
                      placeholder={`${placeholder} eingeben...`}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vorschau</h3>
            <div className="p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
              <div className="text-sm whitespace-pre-wrap font-mono">
                {previewContent}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            {step === 2 && (
              <Button onClick={handleNextToPlaceholders}>
                Weiter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleGeneratePreview}>
                Vorschau generieren
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Vertrag speichern
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
