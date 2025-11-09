import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Activity, MessageSquare, Phone, CheckCircle, TrendingUp, Clock, User, DollarSign, Calendar, MapPin, Eye, BarChart3, List, Users, X, ExternalLink, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

const MetricCard = ({ title, value, icon, trend, className }: MetricCardProps) => (
  <Card className={cn("p-6 hover:shadow-lg transition-all duration-200", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        {trend && (
          <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </Card>
);

interface AgentCardProps {
  name: string;
  successRate: number;
  totalTasks: number;
  status: string;
}

const AgentCard = ({ name, successRate, totalTasks, status }: AgentCardProps) => {
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-warning',
    error: 'bg-destructive',
  };

  return (
    <Card className="p-6 space-y-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-xs text-muted-foreground">{totalTasks} tasks completed</p>
        </div>
        <Badge className={cn("capitalize", statusColors[status as keyof typeof statusColors] || 'bg-muted')}>
          {status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Success Rate</span>
          <span className="font-medium">{successRate}%</span>
        </div>
        <Progress value={successRate} className="h-2" />
      </div>
    </Card>
  );
};

const AdminDashboard = () => {
  const [overview, setOverview] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [overviewData, agentData, activityData] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getAgentPerformance(),
        adminApi.getActivityFeed(),
      ]);

      console.log('📊 Dashboard Data Received:');
      console.log('Overview:', overviewData);
      console.log('Agents:', agentData);
      console.log('Activities:', activityData);

      setOverview(overviewData.data);
      setAgents(agentData.agents || []);
      // Map interactions to activities format
      setActivities(activityData.interactions || activityData.activities || []);
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTransactionClick = async (transactionId: string) => {
    try {
      const details = await adminApi.getTransactionDetails(parseInt(transactionId));
      if (details.success) {
        setSelectedTransaction(details);
      } else {
        toast({
          title: "Error",
          description: details.error || "Failed to load transaction details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading transaction details:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      });
    }
  };

  const handleCallClick = async (sessionId: string) => {
    try {
      const details = await adminApi.getCallDetails(sessionId);
      if (details.success) {
        setSelectedTransaction(details);
      } else {
        toast({
          title: "Error",
          description: details.error || "Failed to load call details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading call details:', error);
      toast({
        title: "Error",
        description: "Failed to load call details",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Sessions"
          value={overview?.active_sessions || 0}
          icon={<Activity className="w-6 h-6 text-primary" />}
          trend="+12% from yesterday"
        />
        <MetricCard
          title="Calls Today"
          value={overview?.total_calls_today || 0}
          icon={<Phone className="w-6 h-6 text-accent" />}
          trend="+8% from yesterday"
        />
        <MetricCard
          title="Chats Today"
          value={overview?.total_chats_today || 0}
          icon={<MessageSquare className="w-6 h-6 text-green-600" />}
          trend="+15% from yesterday"
        />
        <MetricCard
          title="Resolution Rate"
          value={`${overview?.resolution_rate || 0}%`}
          icon={<CheckCircle className="w-6 h-6 text-warning" />}
          trend="+3% from yesterday"
        />
      </div>

      {/* Agent Performance */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          AI Agent Performance
        </h2>
        {agents.length === 0 ? (
          <Card className="glass p-12 text-center">
            <p className="text-muted-foreground">No agent data available</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <AgentCard
                key={index}
                name={agent.agent_name}
                successRate={agent.success_rate}
                totalTasks={agent.total_tasks}
                status={agent.current_status}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-accent" />
            Live Activity Feed
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === 'graph' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('graph')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Graph View
            </Button>
          </div>
        </div>
        
        <Card className="glass p-6">
          {/* Live indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live - Updates every 5s</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {activities.length} active
            </Badge>
          </div>
          
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer",
                    "hover:bg-secondary/50 border border-transparent hover:border-border"
                  )}
                  onClick={() => activity.type === 'call' && handleCallClick(activity.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      activity.call_status === 'active' ? "bg-green-500" :
                      activity.call_status === 'incoming' ? "bg-blue-500" :
                      activity.call_status === 'queued' ? "bg-yellow-500" :
                      "bg-primary"
                    )} />
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-3 h-3 text-blue-500" />
                        {activity.customer}
                        <Eye className="w-3 h-3 text-muted-foreground" />
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {activity.agent || activity.agent_stage || 'AI Agent'}
                        </Badge>
                        {activity.department && (
                          <span className="text-xs text-muted-foreground">
                            {activity.department}
                          </span>
                        )}
                        {activity.ai_model && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            Nemotron 70B
                          </Badge>
                        )}
                      </div>
                      {activity.crewai_trace_url && (
                        <a
                          href={activity.crewai_trace_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          View AI Trace
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.status === 'active' ? 'default' : activity.status === 'completed' ? 'secondary' : 'outline'} className="text-xs">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {activity.status || activity.call_status || 'processing'}
                      </span>
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                    </p>
                    {activity.duration && activity.duration > 0 && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {activity.duration}s
                      </p>
                    )}
                    {activity.priority && (
                      <Badge variant={activity.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs mt-1">
                        {activity.priority}
                      </Badge>
                    )}
                    {activity.wait_time > 0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        Wait: {activity.wait_time}s
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Call Statistics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-green-600 mb-2">Active Calls</h4>
                  <p className="text-2xl font-bold">
                    {activities.filter(a => a.call_status === 'new' || a.call_status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Right now</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">Completed Today</h4>
                  <p className="text-2xl font-bold">
                    {activities.filter(a => a.call_status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Last 30 min</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-orange-600 mb-2">Avg Wait Time</h4>
                  <p className="text-2xl font-bold">
                    {activities.filter(a => a.wait_time > 0).length > 0 
                      ? Math.round(activities.filter(a => a.wait_time > 0).reduce((sum, a) => sum + a.wait_time, 0) / activities.filter(a => a.wait_time > 0).length)
                      : 0}s
                  </p>
                  <p className="text-sm text-muted-foreground">Seconds</p>
                </Card>
              </div>

              {/* Call Stages Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Calls by Stage
                </h3>
                <div className="space-y-3">
                  {['IVR Screening', 'Agent Active', 'Call Completed', 'Call Failed'].map(stage => {
                    const count = activities.filter(a => a.agent_stage === stage).length;
                    const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-32">{stage}</span>
                        <div className="flex-1 bg-secondary rounded-full h-6 relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-primary rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${percentage}%` }}
                          >
                            {count > 0 && (
                              <span className="text-xs text-white font-medium">{count}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Activity Timeline */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  Recent Activity Timeline
                </h3>
                <div className="space-y-2">
                  {activities.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-secondary rounded">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        activity.call_status === 'new' ? "bg-blue-500" :
                        activity.call_status === 'in_progress' ? "bg-orange-500" :
                        activity.call_status === 'completed' ? "bg-green-500" :
                        "bg-red-500"
                      )} />
                      <span className="text-sm font-medium flex-1">{activity.customer}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.agent_stage}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </Card>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
             onClick={() => setSelectedTransaction(null)}>
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Customer Info */}
            {selectedTransaction.customer && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>Name:</strong> {selectedTransaction.customer.first_name} {selectedTransaction.customer.last_name}</p>
                  <p><strong>Phone:</strong> {selectedTransaction.customer.phone}</p>
                  <p><strong>Email:</strong> {selectedTransaction.customer.email}</p>
                  <p><strong>DOB:</strong> {new Date(selectedTransaction.customer.dob).toLocaleDateString()}</p>
                  <p><strong>Region:</strong> {selectedTransaction.customer.region}</p>
                  <p><strong>Address:</strong> {selectedTransaction.customer.address}</p>
                </div>
              </div>
            )}

            {/* Call Events */}
            {selectedTransaction.events && selectedTransaction.events.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Call Events</h4>
                <div className="space-y-2">
                  {selectedTransaction.events.map((event: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-secondary rounded text-sm">
                      <div>
                        <p className="font-medium">{event.event_type.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</p>
                        <p className="text-xs text-muted-foreground">{event.event_data}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
