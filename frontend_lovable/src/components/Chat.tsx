import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage, Property } from '@/types';
import { parseNLP, searchProperties } from '@/services/api';
import { PropertyCard } from './PropertyCard';
import { cn } from '@/lib/utils';

interface ChatProps {
  savedPropertyIds: Set<string>;
  selectedPropertyIds: Set<string>;
  onSelectProperty: (property: Property) => void;
  onSaveProperty: (property: Property) => void;
  onUnsaveProperty: (property: Property) => void;
}

export function Chat({
  savedPropertyIds,
  selectedPropertyIds,
  onSelectProperty,
  onSaveProperty,
  onUnsaveProperty,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your real estate assistant. Tell me what you're looking for, like 'Show me 3-bedroom houses in Boston under $800K' or 'Find luxury condos with a pool'.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Parse NLP
      const nlpResponse = await parseNLP(userMessage.content);

      let assistantContent = '';
      let properties: Property[] = [];

      // Show NLP text if present
      if (nlpResponse.text) {
        assistantContent = nlpResponse.text;
      }

      // If filters returned, search properties
      if (nlpResponse.filters && Object.keys(nlpResponse.filters).length > 0) {
        const searchResponse = await searchProperties(nlpResponse.filters as any);
        properties = searchResponse.results;

        if (properties.length > 0) {
          assistantContent = assistantContent
            ? `${assistantContent}\n\nI found ${searchResponse.total} properties matching your criteria:`
            : `I found ${searchResponse.total} properties matching your criteria:`;
        } else {
          assistantContent = assistantContent
            ? `${assistantContent}\n\nI couldn't find any properties matching those criteria. Try adjusting your search.`
            : "I couldn't find any properties matching those criteria. Try adjusting your search.";
        }
      } else if (!assistantContent) {
        assistantContent = "I understand. Could you tell me more about what you're looking for? For example, location, price range, or number of bedrooms.";
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        properties: properties.length > 0 ? properties : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Property Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask me anything about properties</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 animate-fade-in',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-muted-foreground" />
              </div>
            )}

            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5',
                message.role === 'user'
                  ? 'chat-bubble-user rounded-tr-sm'
                  : 'chat-bubble-assistant rounded-tl-sm'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {/* Property results */}
              {message.properties && message.properties.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {message.properties.slice(0, 4).map((property) => (
                    <div key={property.id} className="bg-card rounded-lg overflow-hidden shadow-sm">
                      <PropertyCard
                        property={property}
                        isSelected={selectedPropertyIds.has(property.id)}
                        isSaved={savedPropertyIds.has(property.id)}
                        onSelect={onSelectProperty}
                        onSave={onSaveProperty}
                        onUnsave={onUnsaveProperty}
                      />
                    </div>
                  ))}
                  {message.properties.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      +{message.properties.length - 4} more properties available
                    </p>
                  )}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-chat-assistant rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-secondary/20">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about properties..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
