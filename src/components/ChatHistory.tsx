import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";
import { 
  MessageCircle, 
  Users, 
  Activity, 
  Clock, 
  Bot, 
  User, 
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Eye
} from "lucide-react";

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

interface ChatAnalytics {
  total_sessions: number;
  active_sessions: number;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  total_tokens_used: number;
  avg_response_time_ms: number;
  error_count: number;
  estimated_cost: number;
}

const ChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();

  const fetchSessions = async (status?: string) => {
    try {
      const data = await adminApi.getChatSessions(50, status === 'all' ? undefined : status);
      
      if (data.success) {
        setSessions(data.sessions);
        setStatusCounts(data.status_counts);
      } else {
        console.error('Failed to fetch sessions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const data = await adminApi.getChatMessages(sessionId);
      
      if (data.success) {
        setMessages(data.messages);
      } else {
        console.error('Failed to fetch messages:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to load messages",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await adminApi.getChatAnalytics('today');
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to fetch analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchSessions(selectedStatus);
    fetchAnalytics();
  }, [selectedStatus]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession.session_id);
    }
  }, [selectedSession]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'ended': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'timeout': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat History</h1>
          <p className="text-muted-foreground">View and analyze chat sessions and messages</p>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{analytics.total_sessions}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{analytics.active_sessions}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{analytics.total_messages}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
                <p className="text-2xl font-bold">${analytics.estimated_cost}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                {Object.keys(statusCounts).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                  </option>
                ))}
              </select>
            </div>
            
            <TabsContent value="sessions" className="space-y-4">
              {sessions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No chat sessions found</p>
                </Card>
              ) : (
                sessions.map((session) => (
                  <Card 
                    key={session.session_id} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getStatusColor(session.status)} text-white`}>
                            {session.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{session.session_type}</Badge>
                        </div>
                        
                        <h3 className="font-semibold mb-1">
                          Session: {session.session_id.slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          User: {session.user_id} | 
                          Messages: {session.total_messages} | 
                          Tokens: {session.total_tokens_used}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Created: {formatTime(session.created_at)}
                          </span>
                          <span className="flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            Duration: {formatDuration(session.created_at, session.ended_at || undefined)}
                          </span>
                          {session.ip_address && (
                            <span>IP: {session.ip_address}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Message Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>User Messages:</span>
                        <span className="font-semibold">{analytics.user_messages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assistant Messages:</span>
                        <span className="font-semibold">{analytics.assistant_messages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Response Time:</span>
                        <span className="font-semibold">{analytics.avg_response_time_ms}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Errors:</span>
                        <span className="font-semibold text-red-600">{analytics.error_count}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Token Usage & Cost
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Tokens:</span>
                        <span className="font-semibold">{analytics.total_tokens_used.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Cost:</span>
                        <span className="font-semibold">${analytics.estimated_cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost per Session:</span>
                        <span className="font-semibold">
                          ${analytics.total_sessions > 0 ? (analytics.estimated_cost / analytics.total_sessions).toFixed(4) : '0.0000'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Messages Panel */}
        <div>
          {selectedSession ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chat Messages</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Session Details</p>
                <p className="text-xs text-muted-foreground">
                  ID: {selectedSession.session_id} | 
                  User: {selectedSession.user_id} | 
                  Status: {selectedSession.status}
                </p>
              </div>
              
              <div className="h-96 w-full overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={message.message_id}>
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            {message.role === 'user' ? (
                              <User className="w-3 h-3" />
                            ) : (
                              <Bot className="w-3 h-3" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {message.role === 'user' ? 'User' : 'Assistant'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {message.role === 'assistant' && (
                            <div className="text-xs text-muted-foreground mt-1 space-x-2">
                              <span>Tokens: {message.tokens_used}</span>
                              {message.response_time_ms > 0 && (
                                <span>Time: {message.response_time_ms}ms</span>
                              )}
                              {message.error_message && (
                                <span className="text-red-600 flex items-center">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Error
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < messages.length - 1 && <div className="border-t my-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a session to view messages</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
