import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessageSquare, User, Clock, Search, ExternalLink, Cpu, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

const API_BASE_URL = 'https://worldlink-ai.xyz:8100';

const CallHistory = () => {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInteraction, setSelectedInteraction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/call-history/all?limit=100`),
        axios.get(`${API_BASE_URL}/api/call-history/stats`)
      ]);

      console.log('📞 Call History:', historyRes.data);
      console.log('📊 Stats:', statsRes.data);

      setInteractions(historyRes.data.interactions || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('❌ Failed to fetch call history:', error);
      toast({
        title: "Error",
        description: "Failed to load call history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleInteractionClick = async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/call-history/details/${id}`);
      setSelectedInteraction(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load interaction details",
        variant: "destructive",
      });
    }
  };

  const filteredInteractions = interactions.filter(item => {
    const matchesSearch = !searchTerm || 
      (item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.customer_phone?.includes(searchTerm)) ||
      (item.purpose?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.transcription?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-500',
      'active': 'bg-blue-500',
      'failed': 'bg-red-500',
      'queued': 'bg-yellow-500',
      'COMPLETED': 'bg-green-500',
      'NEW': 'bg-blue-500',
      'IN_PROGRESS': 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Call History & Conversations</h2>
          <p className="text-muted-foreground">Complete log of all user interactions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live - Updates every 10s</span>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <h3 className="text-2xl font-bold">{stats.calls?.total_calls || 0}</h3>
              </div>
              <Phone className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.calls?.completed_calls || 0}</h3>
              </div>
              <Phone className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <h3 className="text-2xl font-bold">{stats.calls?.today_calls || 0}</h3>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <h3 className="text-2xl font-bold">{Math.round(stats.calls?.avg_duration || 0)}s</h3>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, phone, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background text-foreground"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
            <option value="NEW">New</option>
            <option value="COMPLETED">Completed (Request)</option>
          </select>
        </div>
      </Card>

      {/* Interaction List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Interactions</h3>
          <Badge variant="outline">{filteredInteractions.length} total</Badge>
        </div>

        <div className="space-y-3">
          {filteredInteractions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No interactions found</p>
          ) : (
            filteredInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200 cursor-pointer",
                  "hover:bg-secondary/50 hover:border-primary"
                )}
                onClick={() => handleInteractionClick(interaction.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getStatusColor(interaction.status)
                      )} />
                      {interaction.type === 'call' ? (
                        <Phone className="w-4 h-4 text-blue-500" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-green-500" />
                      )}
                      <span className="font-semibold">
                        {interaction.customer_name || `*${interaction.customer_phone?.slice(-4)}`}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {interaction.type}
                      </Badge>
                    </div>

                    {/* Purpose/Transcription */}
                    <p className="text-sm text-muted-foreground mb-2">
                      {interaction.purpose || interaction.transcription?.substring(0, 150) || "No description"}
                      {interaction.transcription && interaction.transcription.length > 150 && "..."}
                    </p>

                    {/* Details */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {interaction.customer_phone && (
                        <span className="text-xs text-muted-foreground">
                          📱 {interaction.customer_phone}
                        </span>
                      )}
                      {interaction.department && (
                        <Badge variant="secondary" className="text-xs">
                          {interaction.department}
                        </Badge>
                      )}
                      {interaction.agent && (
                        <span className="text-xs text-muted-foreground">
                          👤 {interaction.agent}
                        </span>
                      )}
                      {interaction.ai_model && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          Nemotron 70B
                        </Badge>
                      )}
                      {interaction.trace_url && (
                        <a
                          href={interaction.trace_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          AI Trace
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status and Time */}
                  <div className="text-right">
                    <Badge variant={interaction.status === 'completed' || interaction.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {interaction.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(interaction.timestamp).toLocaleString()}
                    </p>
                    {interaction.duration > 0 && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {interaction.duration}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedInteraction} onOpenChange={() => setSelectedInteraction(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interaction Details</DialogTitle>
          </DialogHeader>
          {selectedInteraction && (
            <div className="space-y-4">
              {/* Customer Info */}
              {selectedInteraction.customer && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {selectedInteraction.customer.first_name} {selectedInteraction.customer.last_name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {selectedInteraction.customer.email}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {selectedInteraction.customer.phone}
                    </div>
                    <div>
                      <span className="text-muted-foreground">ID:</span>{" "}
                      {selectedInteraction.customer.customer_id}
                    </div>
                  </div>
                </Card>
              )}

              {/* Call/Request Details */}
              {selectedInteraction.type === 'call' && selectedInteraction.session && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Call Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Session ID:</strong> {selectedInteraction.session.session_id}</div>
                    <div><strong>Status:</strong> <Badge>{selectedInteraction.session.call_status}</Badge></div>
                    <div><strong>Purpose:</strong> {selectedInteraction.session.purpose}</div>
                    <div><strong>Department:</strong> {selectedInteraction.session.department}</div>
                    <div><strong>Agent:</strong> {selectedInteraction.session.agent_id}</div>
                    <div><strong>Duration:</strong> {selectedInteraction.session.call_duration_seconds}s</div>
                    {selectedInteraction.session.crewai_trace_url && (
                      <div>
                        <strong>AI Trace:</strong>{" "}
                        <a href={selectedInteraction.session.crewai_trace_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View CrewAI Trace
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {selectedInteraction.type === 'request' && selectedInteraction.request && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Request Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Request ID:</strong> {selectedInteraction.request.id}</div>
                    <div><strong>Status:</strong> <Badge>{selectedInteraction.request.status}</Badge></div>
                    <div><strong>Auth Status:</strong> {selectedInteraction.request.auth_status}</div>
                    {selectedInteraction.request.intents && (
                      <div><strong>Intents:</strong> {JSON.stringify(selectedInteraction.request.intents)}</div>
                    )}
                    {selectedInteraction.request.transcription_text && (
                      <div>
                        <strong>Transcription:</strong>
                        <p className="mt-1 p-2 bg-secondary rounded">{selectedInteraction.request.transcription_text}</p>
                      </div>
                    )}
                    {selectedInteraction.request.response_draft && (
                      <div>
                        <strong>Response:</strong>
                        <p className="mt-1 p-2 bg-secondary rounded whitespace-pre-wrap">{selectedInteraction.request.response_draft}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Events Timeline (for calls) */}
              {selectedInteraction.events && selectedInteraction.events.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Event Timeline</h4>
                  <div className="space-y-2">
                    {selectedInteraction.events.map((event: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <div className="font-medium">{event.event_type}</div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                          {event.event_data && (
                            <div className="text-xs mt-1">{event.event_data}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Archived Trace */}
              {selectedInteraction.trace_archive && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">AI Execution Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Summary:</strong> {selectedInteraction.trace_archive.execution_summary}</div>
                    <div><strong>Agents:</strong> {selectedInteraction.trace_archive.agents_involved?.join(", ")}</div>
                    <div><strong>Tools:</strong> {selectedInteraction.trace_archive.tools_called?.join(", ")}</div>
                    <div><strong>Model:</strong> {selectedInteraction.trace_archive.llm_model}</div>
                    <div><strong>Tokens:</strong> {selectedInteraction.trace_archive.total_tokens}</div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallHistory;
