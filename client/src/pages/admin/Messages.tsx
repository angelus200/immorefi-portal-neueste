import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Archive, CheckCheck, Plus, User } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardLayout from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminMessages() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Check if current user is admin
  const isAdmin = user?.role === 'superadmin' || user?.role === 'tenant_admin' || user?.role === 'staff';

  // Get all users (for new conversation dialog)
  // Admins get full user list, clients get staff list
  const { data: allUsers = [] } = trpc.user.list.useQuery(undefined, { enabled: isAdmin });
  const { data: staffUsers = [] } = trpc.user.listStaff.useQuery(undefined, { enabled: !isAdmin });
  const users = isAdmin ? allUsers : staffUsers;

  // Get all conversations
  const { data: conversations = [] } = trpc.chat.getConversations.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Get selected conversation with messages
  const { data: conversationData } = trpc.chat.getConversation.useQuery(
    { conversationId: selectedConversationId! },
    {
      enabled: !!selectedConversationId,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  // Get unread count
  const { data: unreadCount } = trpc.chat.getUnreadCount.useQuery(undefined, {
    refetchInterval: 10000,
  });

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      if (selectedConversationId) {
        utils.chat.getConversation.invalidate({ conversationId: selectedConversationId });
        utils.chat.getConversations.invalidate();
      }
      utils.chat.getUnreadCount.invalidate();
    },
  });

  // Close conversation mutation
  const closeConversationMutation = trpc.chat.closeConversation.useMutation({
    onSuccess: () => {
      utils.chat.getConversations.invalidate();
      setSelectedConversationId(null);
    },
  });

  // Start conversation as admin mutation
  const startConversationAsAdminMutation = trpc.chat.startConversationAsAdmin.useMutation({
    onSuccess: (data) => {
      utils.chat.getConversations.invalidate();
      setIsNewMessageDialogOpen(false);
      setSelectedUserId('');
      setNewMessage('');
      // Select the newly created conversation
      setSelectedConversationId(data.conversation.id);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationData?.messages]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseConversation = () => {
    if (!selectedConversationId) return;
    closeConversationMutation.mutate({ conversationId: selectedConversationId });
  };

  const handleStartNewConversation = () => {
    if (!selectedUserId || !newMessage.trim()) return;

    startConversationAsAdminMutation.mutate({
      customerId: parseInt(selectedUserId),
      message: newMessage.trim(),
    });
  };

  const selectedConversation = conversationData?.conversation;

  // Filter users based on current user role
  // - Admins can see customers to start conversations
  // - Customers can only see admins/staff (NEVER other customers - DATENSCHUTZ!)
  const availableUsers = isAdmin
    ? users.filter(u => u.role === 'client') // Admins see customers
    : users.filter(u => u.role === 'superadmin' || u.role === 'tenant_admin' || u.role === 'staff'); // Customers see only admins/staff

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Nachrichten</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie Kundengespräche
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount && unreadCount > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {unreadCount} ungelesen
              </Badge>
            )}
            <Button onClick={() => setIsNewMessageDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Nachricht
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Konversationen ({conversations.length})
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {conversations.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Keine Konversationen
                  </div>
                )}
                {conversations.map((conv) => {
                  const isSelected = selectedConversationId === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {conv.customer?.firstName && conv.customer?.lastName
                              ? `${conv.customer.firstName} ${conv.customer.lastName}`
                              : conv.customer?.email
                              ? conv.customer.email
                              : `Kunde #${conv.customerId}`}
                          </div>
                          {conv.orderId && (
                            <div className="text-xs opacity-80 mt-1">
                              Bestellung #{conv.orderId}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            conv.conversationStatus === 'open'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-[10px] shrink-0"
                        >
                          {conv.conversationStatus === 'open' ? 'Offen' : 'Geschlossen'}
                        </Badge>
                      </div>
                      {conv.lastMessageAt && (
                        <div className="text-xs opacity-70 mt-2">
                          {format(new Date(conv.lastMessageAt), 'dd.MM.yyyy HH:mm', {
                            locale: de,
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>

          {/* Conversation View */}
          <Card className="lg:col-span-2 flex flex-col">
            {!selectedConversationId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Wählen Sie eine Konversation aus
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation?.customer?.firstName && selectedConversation?.customer?.lastName
                        ? `${selectedConversation.customer.firstName} ${selectedConversation.customer.lastName}`
                        : selectedConversation?.customer?.email
                        ? selectedConversation.customer.email
                        : `Kunde #${selectedConversation?.customerId}`}
                    </h3>
                    {selectedConversation?.orderId && (
                      <p className="text-xs text-muted-foreground">
                        Bestellung #{selectedConversation.orderId}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation?.conversationStatus === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCloseConversation}
                        disabled={closeConversationMutation.isPending}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Schließen
                      </Button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {!conversationData?.messages?.length && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        Keine Nachrichten
                      </div>
                    )}

                    {conversationData?.messages?.map((msg) => {
                      const isAdmin = msg.messageSenderRole === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex',
                            isAdmin ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[75%] rounded-lg px-4 py-2',
                              isAdmin
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium opacity-80">
                                {isAdmin ? 'Admin' : 'Kunde'}
                              </span>
                              {msg.readAt && (
                                <CheckCheck className="h-3 w-3 opacity-70" />
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <p
                              className={cn(
                                'text-[10px] mt-1',
                                isAdmin
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {format(new Date(msg.createdAt), 'dd.MM.yyyy HH:mm', {
                                locale: de,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Input */}
                {selectedConversation?.conversationStatus === 'open' && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nachricht eingeben..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sendMessageMutation.isPending}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neue Konversation starten</DialogTitle>
            <DialogDescription>
              {isAdmin
                ? 'Wählen Sie einen Kunden aus und senden Sie die erste Nachricht.'
                : 'Wählen Sie einen Berater aus und senden Sie die erste Nachricht.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">{isAdmin ? 'Kunde' : 'Berater'}</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder={isAdmin ? 'Kunde auswählen...' : 'Berater auswählen...'} />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 && (
                    <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                      {isAdmin ? 'Keine Kunden gefunden' : 'Keine Berater gefunden'}
                    </div>
                  )}
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.name || user.email}</span>
                        {user.email && user.name && (
                          <span className="text-xs text-muted-foreground">
                            ({user.email})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Nachricht</Label>
              <Textarea
                id="message"
                placeholder="Ihre Nachricht..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewMessageDialogOpen(false);
                setSelectedUserId('');
                setNewMessage('');
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleStartNewConversation}
              disabled={!selectedUserId || !newMessage.trim() || startConversationAsAdminMutation.isPending}
            >
              {startConversationAsAdminMutation.isPending ? (
                'Wird gesendet...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Nachricht senden
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
