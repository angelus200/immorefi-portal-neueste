import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Scale
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const CONTRACT_TYPES = {
  analysis: "Analyse & Strukturierungsdiagnose",
  fund_structuring: "Fondsstrukturierung",
  cln_amc: "CLN/AMC Strukturierung",
  mandate: "Mandatsvertrag",
  nda: "Geheimhaltungsvereinbarung",
  other: "Sonstiges",
};

export default function ClientContracts() {
  const { user, loading: authLoading } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasAcceptedArbitration, setHasAcceptedArbitration] = useState(false);
  
  // Queries
  const { data: assignments, isLoading, refetch } = trpc.contract.myAssignments.useQuery();
  const utils = trpc.useUtils();

  // Mutations
  const acceptContract = trpc.contract.accept.useMutation({
    onSuccess: () => {
      toast.success("Vertrag erfolgreich anerkannt");
      setIsAcceptDialogOpen(false);
      setSelectedAssignment(null);
      setHasReadContract(false);
      setHasAcceptedTerms(false);
      setHasAcceptedArbitration(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const handleOpenAcceptDialog = (assignmentId: number) => {
    setSelectedAssignment(assignmentId);
    setIsAcceptDialogOpen(true);
    setHasReadContract(false);
    setHasAcceptedTerms(false);
    setHasAcceptedArbitration(false);
  };
  
  const handleAcceptContract = () => {
    if (!selectedAssignment) return;
    
    const confirmationText = `Ich bestätige hiermit als Unternehmer (nicht als Verbraucher), dass ich den Vertrag vollständig gelesen und verstanden habe. Ich erkenne den Vertrag als verbindlich an. Es gilt Schweizer Recht (Schweizer Obligationenrecht). Ich akzeptiere die Schiedsgerichtsvereinbarung und den Ausschluss des ordentlichen Rechtswegs.`;
    
    acceptContract.mutate({
      assignmentId: selectedAssignment,
      confirmationText,
    });
  };
  
  const handleDownload = async (assignmentId: number) => {
    try {
      const data = await utils.contract.getDownloadUrl.fetch({ assignmentId });
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Vertrag wird heruntergeladen");
      } else {
        throw new Error("Download URL nicht verfügbar");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Fehler beim Herunterladen des Vertrags");
    }
  };
  
  const selectedAssignmentData = assignments?.find(a => a.id === selectedAssignment);
  
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Bitte melden Sie sich an.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  const pendingContracts = assignments?.filter(a => !a.isAccepted) || [];
  const acceptedContracts = assignments?.filter(a => a.isAccepted) || [];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Verträge</h1>
          <p className="text-muted-foreground">
            Hier finden Sie alle Ihnen zugewiesenen Verträge zur Anerkennung
          </p>
        </div>
        
        {/* Legal Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Rechtlicher Hinweis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Alle Verträge unterliegen dem <strong>Schweizer Recht (Schweizer Obligationenrecht)</strong>. 
              Dieses Angebot richtet sich ausschließlich an <strong>Unternehmer</strong>, nicht an Verbraucher. 
              Mit der Anerkennung eines Vertrags akzeptieren Sie die enthaltene Schiedsgerichtsvereinbarung.
            </p>
          </CardContent>
        </Card>
        
        {/* Pending Contracts */}
        {pendingContracts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Ausstehende Verträge ({pendingContracts.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingContracts.map((assignment) => (
                <Card key={assignment.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {assignment.contract?.name || "Vertrag"}
                        </CardTitle>
                        <CardDescription>
                          {CONTRACT_TYPES[assignment.contract?.type as keyof typeof CONTRACT_TYPES] || assignment.contract?.type}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Ausstehend
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assignment.contract?.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {assignment.contract.description}
                      </p>
                    )}
                    {assignment.note && (
                      <div className="bg-muted p-3 rounded-md text-sm">
                        <strong>Hinweis:</strong> {assignment.note}
                      </div>
                    )}
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>Version: {assignment.contract?.version || "1.0"}</p>
                      <p>Zugewiesen am: {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString("de-DE") : "-"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(assignment.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Herunterladen
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleOpenAcceptDialog(assignment.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Anerkennen
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Accepted Contracts */}
        {acceptedContracts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Anerkannte Verträge ({acceptedContracts.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {acceptedContracts.map((assignment) => (
                <Card key={assignment.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {assignment.contract?.name || "Vertrag"}
                        </CardTitle>
                        <CardDescription>
                          {CONTRACT_TYPES[assignment.contract?.type as keyof typeof CONTRACT_TYPES] || assignment.contract?.type}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Anerkannt
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Version: {assignment.contract?.version || "1.0"}</p>
                      <p>Anerkannt am: {assignment.acceptance?.acceptedAt ? new Date(assignment.acceptance.acceptedAt).toLocaleString("de-DE") : "-"}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(assignment.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Herunterladen
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : assignments?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Verträge vorhanden</h3>
              <p className="text-muted-foreground text-center">
                Ihnen wurden noch keine Verträge zur Anerkennung zugewiesen.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Accept Dialog */}
        <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Vertragsanerkennung
              </DialogTitle>
              <DialogDescription>
                {selectedAssignmentData?.contract?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Contract Info */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Vertragsdetails</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Typ:</strong> {CONTRACT_TYPES[selectedAssignmentData?.contract?.type as keyof typeof CONTRACT_TYPES] || "-"}</p>
                  <p><strong>Version:</strong> {selectedAssignmentData?.contract?.version || "1.0"}</p>
                  <p><strong>Anwendbares Recht:</strong> {selectedAssignmentData?.contract?.governingLaw || "Schweizer Recht"}</p>
                </div>
              </div>
              
              {/* Download Link */}
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{selectedAssignmentData?.contract?.fileName || "Vertragsdokument.pdf"}</p>
                  <p className="text-sm text-muted-foreground">Bitte lesen Sie den Vertrag vollständig durch</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => selectedAssignment && handleDownload(selectedAssignment)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Öffnen
                </Button>
              </div>
              
              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="read" 
                    checked={hasReadContract}
                    onCheckedChange={(checked) => setHasReadContract(checked as boolean)}
                  />
                  <label htmlFor="read" className="text-sm leading-tight cursor-pointer">
                    Ich bestätige, dass ich den Vertrag <strong>vollständig gelesen und verstanden</strong> habe.
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={hasAcceptedTerms}
                    onCheckedChange={(checked) => setHasAcceptedTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                    Ich handle als <strong>Unternehmer</strong> (nicht als Verbraucher) und erkenne den Vertrag als <strong>verbindlich</strong> an. 
                    Es gilt <strong>Schweizer Recht</strong> (Schweizer Obligationenrecht).
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="arbitration" 
                    checked={hasAcceptedArbitration}
                    onCheckedChange={(checked) => setHasAcceptedArbitration(checked as boolean)}
                  />
                  <label htmlFor="arbitration" className="text-sm leading-tight cursor-pointer">
                    Ich akzeptiere die <strong>Schiedsgerichtsvereinbarung</strong> und den <strong>Ausschluss des ordentlichen Rechtswegs</strong>.
                  </label>
                </div>
              </div>
              
              {/* Warning */}
              <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Wichtiger Hinweis:</strong> Mit der Anerkennung dieses Vertrags gehen Sie eine rechtlich bindende Vereinbarung ein. 
                  Diese Anerkennung wird mit Zeitstempel protokolliert und kann nicht widerrufen werden.
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleAcceptContract}
                disabled={!hasReadContract || !hasAcceptedTerms || !hasAcceptedArbitration || acceptContract.isPending}
              >
                {acceptContract.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Vertrag anerkennen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
