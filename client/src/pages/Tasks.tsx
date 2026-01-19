import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { 
  Search, 
  Plus, 
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  Calendar
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

const TENANT_ID = 1;

const statusConfig = {
  todo: { label: "Offen", color: "bg-gray-100 text-gray-800", icon: Circle },
  in_progress: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-800", icon: Clock },
  done: { label: "Erledigt", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Abgebrochen", color: "bg-red-100 text-red-800", icon: XCircle },
};

function TasksContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueAt: "" });

  const { data: tasks, isLoading, refetch} = trpc.task.list.useQuery({ tenantId: TENANT_ID });
  
  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      toast.success("Aufgabe erstellt");
      setIsDialogOpen(false);
      setNewTask({ title: "", description: "", dueAt: "" });
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Erstellen");
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      toast.success("Aufgabe aktualisiert");
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren");
    },
  });

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein");
      return;
    }
    createTask.mutate({
      tenantId: TENANT_ID,
      title: newTask.title,
      description: newTask.description || undefined,
      dueAt: newTask.dueAt ? new Date(newTask.dueAt) : undefined,
    });
  };

  const handleToggleStatus = (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    updateTask.mutate({
      id: taskId,
      tenantId: TENANT_ID,
      status: newStatus as "todo" | "in_progress" | "done" | "cancelled",
      completedAt: newStatus === "done" ? new Date() : undefined,
    });
  };

  const todoCount = tasks?.filter(t => t.status === "todo").length || 0;
  const inProgressCount = tasks?.filter(t => t.status === "in_progress").length || 0;
  const doneCount = tasks?.filter(t => t.status === "done").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aufgaben</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Aufgaben und To-Dos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Aufgabe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Aufgabe für Ihr Projekt.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  placeholder="Aufgabentitel eingeben..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Optionale Beschreibung..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueAt" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fälligkeitsdatum
                </Label>
                <Input
                  id="dueAt"
                  type="date"
                  value={newTask.dueAt}
                  onChange={(e) => setNewTask({ ...newTask, dueAt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                {createTask.isPending ? "Erstellen..." : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Aufgaben</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offen</CardTitle>
            <Circle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoCount}</div>
            <p className="text-xs text-muted-foreground">zu erledigen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">aktiv</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erledigt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneCount}</div>
            <p className="text-xs text-muted-foreground">abgeschlossen</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen nach Aufgabe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aufgaben-Übersicht</CardTitle>
          <CardDescription>{filteredTasks?.length || 0} Aufgaben gefunden</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laden...</div>
          ) : filteredTasks && filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Aufgabe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fällig</TableHead>
                  <TableHead>Erstellt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.todo;
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(task.id, task.status)}
                        >
                          <StatusIcon className={`h-5 w-5 ${task.status === "done" ? "text-green-500" : "text-muted-foreground"}`} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {task.dueAt ? new Date(task.dueAt).toLocaleDateString("de-DE") : "-"}
                      </TableCell>
                      <TableCell>
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString("de-DE") : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Aufgaben gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Tasks() {
  return (
    <DashboardLayout>
      <TasksContent />
    </DashboardLayout>
  );
}
