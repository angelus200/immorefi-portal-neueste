import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, GripVertical, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "./DashboardLayout";

const TENANT_ID = 1;

function DealsContent() {
  const { data: stages, isLoading: stagesLoading } = trpc.pipeline.stages.useQuery({ tenantId: TENANT_ID });
  const { data: deals, isLoading: dealsLoading, refetch } = trpc.deal.list.useQuery({ tenantId: TENANT_ID });
  const { data: contacts } = trpc.contact.list.useQuery({ tenantId: TENANT_ID });
  
  const moveDeal = trpc.deal.move.useMutation({
    onSuccess: () => {
      toast.success("Deal verschoben");
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Verschieben");
    },
  });

  const [draggedDeal, setDraggedDeal] = useState<number | null>(null);

  const getContactName = (contactId: number | null) => {
    if (!contactId) return "Unbekannt";
    const contact = contacts?.find(c => c.id === contactId);
    return contact?.name || "Unbekannt";
  };

  const getDealsByStage = (stageId: number) => {
    return deals?.filter(d => d.stageId === stageId) || [];
  };

  const handleDragStart = (dealId: number) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: number) => {
    if (draggedDeal) {
      moveDeal.mutate({
        id: draggedDeal,
        tenantId: TENANT_ID,
        stageId,
      });
      setDraggedDeal(null);
    }
  };

  const formatCurrency = (value: number | null, currency: string | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isLoading = stagesLoading || dealsLoading;

  // Default stages if none exist
  const displayStages = stages && stages.length > 0 ? stages : [
    { id: 1, name: "Neu", color: "#6B7280", order: 1 },
    { id: 2, name: "Qualifiziert", color: "#3B82F6", order: 2 },
    { id: 3, name: "Angebot", color: "#F59E0B", order: 3 },
    { id: 4, name: "Verhandlung", color: "#8B5CF6", order: 4 },
    { id: 5, name: "Gewonnen", color: "#10B981", order: 5 },
    { id: 6, name: "Verloren", color: "#EF4444", order: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Deals im Kanban-Board</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Deal
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Laden...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {displayStages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: stage.color || '#6B7280' }}
                        />
                        <CardTitle className="text-sm font-medium">
                          {stage.name}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {stageDeals.length}
                        </span>
                      </div>
                    </div>
                    {totalValue > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Gesamt: {formatCurrency(totalValue, 'EUR')}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[200px]">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal.id)}
                        className={`bg-background border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow ${
                          draggedDeal === deal.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{deal.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {getContactName(deal.contactId)}
                              </p>
                              {deal.value && (
                                <p className="text-sm font-semibold text-primary mt-1">
                                  {formatCurrency(deal.value, deal.currency)}
                                </p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                              <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        Keine Deals
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Deals() {
  return (
    <DashboardLayout>
      <DealsContent />
    </DashboardLayout>
  );
}
