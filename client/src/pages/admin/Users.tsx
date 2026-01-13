import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, UserPlus, Shield, Users as UsersIcon, MessageCircle, Edit, Trash2, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UserSource = 'all' | 'portal' | 'ghl' | 'manual';

function UsersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<UserSource>("all");
  const [, setLocation] = useLocation();

  // Invite Dialog
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("client");

  // Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const { data: users, isLoading } = trpc.user.list.useQuery();
  const utils = trpc.useUtils();

  // Mutations
  const startConversationMutation = trpc.chat.startConversationAsAdmin.useMutation({
    onSuccess: (data) => {
      setLocation(`/admin/messages?conversationId=${data.conversation.id}`);
    },
  });

  const inviteUserMutation = trpc.user.inviteUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer erfolgreich eingeladen! Eine Willkommens-E-Mail wurde versendet.");
      resetInviteForm();
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Einladen des Benutzers");
    },
  });

  const updateUserMutation = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer erfolgreich aktualisiert");
      setIsEditDialogOpen(false);
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren des Benutzers");
    },
  });

  const deleteUserMutation = trpc.user.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer erfolgreich gelöscht");
      setIsDeleteDialogOpen(false);
      setDeleteUserId(null);
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Löschen des Benutzers");
    },
  });

  // Filtering
  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = sourceFilter === 'all' || user.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const roleLabels: Record<string, string> = {
    superadmin: "Super Admin",
    tenant_admin: "Tenant Admin",
    staff: "Mitarbeiter",
    client: "Kunde",
  };

  const roleColors: Record<string, string> = {
    superadmin: "bg-purple-100 text-purple-800",
    tenant_admin: "bg-blue-100 text-blue-800",
    staff: "bg-green-100 text-green-800",
    client: "bg-gray-100 text-gray-800",
  };

  const sourceLabels: Record<string, string> = {
    portal: "Portal",
    ghl: "GHL Import",
    manual: "Manuell",
  };

  const sourceColors: Record<string, string> = {
    portal: "bg-blue-50 text-blue-700 border-blue-200",
    ghl: "bg-green-50 text-green-700 border-green-200",
    manual: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const handleSendMessage = (userId: number, userName: string) => {
    const defaultMessage = `Hallo ${userName}, wie kann ich Ihnen helfen?`;
    startConversationMutation.mutate({
      customerId: userId,
      message: defaultMessage,
    });
  };

  const handleInviteUser = () => {
    if (!inviteEmail || !inviteName) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }

    inviteUserMutation.mutate({
      email: inviteEmail,
      name: inviteName,
      role: inviteRole as 'client' | 'staff' | 'tenant_admin',
    });
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteName("");
    setInviteRole("client");
    setIsInviteDialogOpen(false);
  };

  const handleEditUser = (user: any) => {
    setEditUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditCompany(user.company || "");
    setEditRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editUser) return;

    updateUserMutation.mutate({
      id: editUser.id,
      name: editName,
      email: editEmail,
      phone: editPhone || undefined,
      company: editCompany || undefined,
      role: editRole as any,
    });
  };

  const handleDeleteUser = (userId: number) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate({ id: deleteUserId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
          <p className="text-muted-foreground">Verwalten Sie Benutzer und deren Rollen</p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Benutzer einladen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(u => u.role === 'superadmin' || u.role === 'tenant_admin').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GHL Import</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(u => u.source === 'ghl').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunden</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(u => u.role === 'client').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, E-Mail oder Firma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as UserSource)}>
              <TabsList>
                <TabsTrigger value="all">Alle</TabsTrigger>
                <TabsTrigger value="portal">Portal</TabsTrigger>
                <TabsTrigger value="ghl">GHL Import</TabsTrigger>
                <TabsTrigger value="manual">Manuell</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzer-Übersicht</CardTitle>
          <CardDescription>
            {filteredUsers?.length || 0} Benutzer gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Laden...
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Quelle</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        {user.name || "-"}
                      </div>
                    </TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{user.company || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={sourceColors[user.source || 'portal']}>
                        {sourceLabels[user.source || 'portal']}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === 'client' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendMessage(user.id, user.name || 'Kunde')}
                            disabled={startConversationMutation.isPending}
                            title="Nachricht senden"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          title="Bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Benutzer gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Benutzer einladen</DialogTitle>
            <DialogDescription>
              Laden Sie einen neuen Benutzer ein. Eine Willkommens-E-Mail wird automatisch versendet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name *</Label>
              <Input
                id="invite-name"
                placeholder="Max Mustermann"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-Mail-Adresse *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="max@beispiel.de"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Rolle</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Kunde</SelectItem>
                  <SelectItem value="staff">Mitarbeiter</SelectItem>
                  <SelectItem value="tenant_admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetInviteForm} disabled={inviteUserMutation.isPending}>
              Abbrechen
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={!inviteEmail || !inviteName || inviteUserMutation.isPending}
            >
              {inviteUserMutation.isPending ? 'Lädt...' : 'Einladen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Benutzerdaten.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Max Mustermann"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-Mail-Adresse</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="max@beispiel.de"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+49 123 456789"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Firma</Label>
              <Input
                id="edit-company"
                placeholder="Beispiel GmbH"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rolle</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Kunde</SelectItem>
                  <SelectItem value="staff">Mitarbeiter</SelectItem>
                  <SelectItem value="tenant_admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateUserMutation.isPending}>
              Abbrechen
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Speichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten des Benutzers (Bestellungen, Nachrichten, Notizen) werden ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <DashboardLayout>
      <UsersContent />
    </DashboardLayout>
  );
}
