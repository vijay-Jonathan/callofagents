import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Activity, MessageSquare, Phone, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

const MetricCard = ({ title, value, icon, trend, className }: MetricCardProps) => (
  <Card className={cn("glass p-6 hover:glow-primary transition-smooth", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        {trend && (
          <p className="text-xs text-success flex items-center gap-1 mt-2">
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
    active: 'bg-success',
    idle: 'bg-warning',
    error: 'bg-destructive',
  };

  return (
    <Card className="glass p-6 space-y-4 hover:glow-accent transition-smooth">
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

      setOverview(overviewData);
      setAgents(agentData.agents || []);
      setActivities(activityData.activities || []);
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
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
          icon={<MessageSquare className="w-6 h-6 text-success" />}
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
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-accent" />
          Live Activity Feed
        </h2>
        <Card className="glass p-6">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
                    <div>
                      <p className="text-sm font-medium">
                        Customer {activity.customer} - {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.agent} • {activity.duration}s
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
