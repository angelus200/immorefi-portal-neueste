import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Get or create conversation
  const { data: conversation } = trpc.chat.startConversation.useQuery(
    {},
    {
      enabled: isOpen && !conversationId,
      onSuccess: (data) => {
        if (data?.id) {
          setConversationId(data.id);
        }
      },
    }
  );

  // Get conversation with messages
  const { data: conversationData } = trpc.chat.getConversation.useQuery(
    { conversationId: conversationId! },
    {
      enabled: !!conversationId,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  // Get unread count
  const { data: unreadCount } = trpc.chat.getUnreadCount.useQuery(undefined, {
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      // Refetch conversation to get new messages
      if (conversationId) {
        utils.chat.getConversation.invalidate({ conversationId });
      }
      utils.chat.getUnreadCount.invalidate();
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationData?.messages]);

  // Set conversation ID when conversation is loaded
  useEffect(() => {
    if (conversation?.id) {
      setConversationId(conversation.id);
    }
  }, [conversation]);

  const handleSendMessage = () => {
    if (!message.trim() || !conversationId) return;

    sendMessageMutation.mutate({
      conversationId,
      content: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user || user.role === 'superadmin' || user.role === 'tenant_admin') {
    return null; // Don't show chat widget for admins
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-background border border-border rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-sm">Support Chat</h3>
                <p className="text-xs text-muted-foreground">
                  Wir helfen Ihnen gerne
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {!conversationData?.messages?.length && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Keine Nachrichten. Senden Sie eine Nachricht, um zu starten.
                </div>
              )}

              {conversationData?.messages?.map((msg) => {
                const isCustomer = msg.messageSenderRole === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      isCustomer ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg px-4 py-2',
                        isCustomer
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={cn(
                          'text-[10px] mt-1',
                          isCustomer
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}
                      >
                        {format(new Date(msg.createdAt), 'HH:mm', { locale: de })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
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
        </div>
      )}
    </>
  );
}
