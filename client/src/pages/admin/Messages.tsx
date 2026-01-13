import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Archive, CheckCheck } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardLayout from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminMessages() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

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

  const selectedConversation = conversationData?.conversation;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Nachrichten</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie Kundengespräche
            </p>
          </div>
          {unreadCount && unreadCount > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {unreadCount} ungelesen
            </Badge>
          )}
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
                            Kunde #{conv.customerId}
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
                      Kunde #{selectedConversation?.customerId}
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
    </DashboardLayout>
  );
}
