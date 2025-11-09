import { useState, useEffect, useRef } from "react";
import { Send, ThumbsUp, ThumbsDown, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { chatbotApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  ragSources?: Array<{
    source: string;
    relevance: number;
    content: string;
  }>;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initSession = async () => {
    try {
      const data = await chatbotApi.createSession();
      setSessionId(data.session_id);
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m your AI banking assistant. How can I help you today?',
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize chat session",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch('https://worldlink-ai.xyz:8100/api/chatbot/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: input,
          use_rag: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to stream response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let ragSources: any[] = [];

      // Add empty assistant message to update
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonStr);
              
              if (data.type === 'content' && data.content) {
                assistantMessage += data.content;
                // Update the last message
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex].role === 'assistant') {
                    newMessages[lastIndex] = {
                      ...newMessages[lastIndex],
                      content: assistantMessage,
                    };
                  }
                  return newMessages;
                });
              } else if (data.type === 'done' && data.rag_sources) {
                ragSources = data.rag_sources;
                // Update with RAG sources
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex].role === 'assistant') {
                    newMessages[lastIndex] = {
                      ...newMessages[lastIndex],
                      ragSources: ragSources,
                    };
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFeedback = async (messageIndex: number, rating: number) => {
    if (!sessionId) return;

    try {
      await chatbotApi.submitFeedback(sessionId, rating);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 animate-fade-in",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] space-y-2",
              message.role === 'user' ? 'items-end' : 'items-start'
            )}>
              <Card className={cn(
                "p-4",
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'glass'
              )}>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </Card>

              {message.ragSources && message.ragSources.length > 0 && (
                <Card className="glass p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                  {message.ragSources.map((source, idx) => (
                    <div key={idx} className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(source.relevance * 100)}% relevant
                        </Badge>
                        <span className="text-muted-foreground">{source.source}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{source.content}</p>
                    </div>
                  ))}
                </Card>
              )}

              {message.role === 'assistant' && !isStreaming && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(index, 5)}
                    className="h-7 w-7 p-0"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(index, 1)}
                    className="h-7 w-7 p-0"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <Card className="glass p-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4 glass">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 glass"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="glow-primary"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
