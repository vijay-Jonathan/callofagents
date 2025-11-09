import { useState, useEffect, useRef } from "react";
import { Send, ThumbsUp, ThumbsDown, Loader2, Bot, User, MessageCircle, Clock, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { chatbotApi, adminApi } from "@/lib/api";
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

interface ChatSession {
  session_id: string;
  user_id: string;
  customer_id: number | null;
  created_at: string;
  last_activity: string;
  ended_at: string | null;
  session_type: string;
  total_messages: number;
  total_tokens_used: number;
  status: string;
  user_agent: string | null;
  ip_address: string | null;
}

interface ChatMessage {
  message_id: number;
  role: string;
  content: string;
  timestamp: string;
  tokens_used: number;
  model_used: string;
  response_time_ms: number;
  was_streamed: boolean;
  error_message: string | null;
  rag_sources: any;
  rag_score: number | null;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    initSession();
    fetchChatSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatSessions = async () => {
    try {
      // Get all sessions, not just active ones, to see chat history
      const data = await adminApi.getChatSessions(20);
      if (data.success) {
        // Sort sessions by last activity and show those with messages first
        const sortedSessions = data.sessions.sort((a: ChatSession, b: ChatSession) => {
          // First sort by message count (sessions with messages first)
          if (b.total_messages !== a.total_messages) {
            return b.total_messages - a.total_messages;
          }
          // Then sort by last activity
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        });
        setChatSessions(sortedSessions);
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      const data = await adminApi.getChatMessages(sessionId);
      if (data.success) {
        const historyMessages: Message[] = data.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.timestamp,
          ragSources: msg.rag_sources
        }));
        setMessages(historyMessages);
        setSelectedHistorySession(sessionId);
        setSessionId(sessionId);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const startNewChat = () => {
    initSession();
    setSelectedHistorySession(null);
  };

  const deleteChatSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent loading the session when clicking delete
    
    try {
      const data = await adminApi.deleteChatSession(sessionId);
      if (data.success) {
        toast({
          title: "Success",
          description: "Chat session deleted successfully",
        });
        
        // Refresh sessions list
        fetchChatSessions();
        
        // If the deleted session was selected, start a new chat
        if (selectedHistorySession === sessionId) {
          startNewChat();
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete chat session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  };

  const saveMessageToHistory = async (message: Message) => {
    if (!sessionId) return;
    
    try {
      // This would typically call an API to save the message
      // For now, the backend should handle this automatically when sending messages
      console.log('Message would be saved to session:', sessionId, message);
    } catch (error) {
      console.error('Error saving message to history:', error);
    }
  };

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
      // Refresh chat sessions to show the updated message count
      fetchChatSessions();
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
    <div className="flex h-[calc(100vh-5rem)] max-w-full mx-auto">
      {/* Chat History Sidebar */}
      <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-border bg-background overflow-hidden flex-shrink-0`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center text-sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat History
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              ×
            </Button>
          </div>
          
          <Button
            onClick={startNewChat}
            className="mb-4 w-full"
            variant="outline"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No previous chats
                </p>
              </div>
            ) : (
              chatSessions.map((session) => (
                <Card
                  key={session.session_id}
                  className={`p-3 cursor-pointer hover:bg-accent transition-all duration-200 group relative ${
                    selectedHistorySession === session.session_id 
                      ? 'bg-accent border-primary' 
                      : 'hover:border-muted-foreground/20'
                  }`}
                  onClick={() => loadChatHistory(session.session_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate flex-1 mr-2">
                      {session.user_id}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={session.total_messages > 0 ? "default" : "secondary"} 
                        className="text-xs px-2 py-0.5"
                      >
                        {session.total_messages}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => deleteChatSession(session.session_id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(session.last_activity).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status: <span className="capitalize">{session.status}</span>
                    {session.total_tokens_used > 0 && (
                      <span className="ml-2">• {session.total_tokens_used} tokens</span>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="border-b border-border bg-muted/30 p-4 flex items-center justify-between">
          <div className="flex items-center">
            {!showHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="mr-3 h-8 w-8 p-0"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {selectedHistorySession ? 'Previous Chat' : 'AI Banking Assistant'}
              </h2>
              {selectedHistorySession && (
                <p className="text-xs text-muted-foreground">
                  Session ID: {selectedHistorySession.slice(-8)}
                </p>
              )}
            </div>
          </div>
          {selectedHistorySession && (
            <Button variant="outline" size="sm" onClick={startNewChat}>
              <MessageCircle className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 max-w-4xl mx-auto w-full animate-fade-in",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[70%] space-y-2",
                message.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <Card className={cn(
                  "p-4 shadow-sm transition-all duration-200 hover:shadow-md",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground ml-auto border-primary/20" 
                    : "bg-card border-border"
                )}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </Card>
                
                {message.timestamp && (
                  <div className={cn(
                    "flex items-center gap-3 text-xs text-muted-foreground px-1",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}>
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted"
                          onClick={() => handleFeedback(index, 'positive')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted"
                          onClick={() => handleFeedback(index, 'negative')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isStreaming && (
            <div className="flex gap-3 justify-start max-w-4xl mx-auto w-full">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <Card className="p-4 bg-card border-border shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about banking..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isStreaming}
                className="flex-1 bg-background border-border focus:border-primary"
              />
              <Button 
                onClick={handleSend} 
                disabled={isStreaming || !input.trim()}
                size="icon"
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
