import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toolsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle, ArrowRight } from "lucide-react";

interface ToolCall {
  tool: string;
  arguments: any;
  result: any;
}

const scenarios = [
  {
    id: 'financial_planning',
    title: 'Financial Planning',
    description: 'Calculate interest and investment returns',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'account_inquiry',
    title: 'Account Inquiry',
    description: 'Check balance and transaction history',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'currency_exchange',
    title: 'Currency Exchange',
    description: 'Convert between different currencies',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'fraud_detection',
    title: 'Fraud Detection',
    description: 'Analyze transactions for suspicious activity',
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'comprehensive',
    title: 'Comprehensive Demo',
    description: 'Multiple tools in action',
    color: 'from-yellow-500 to-amber-500',
  },
];

const ToolDemo = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [iterations, setIterations] = useState<number>(0);
  const { toast } = useToast();

  const executeScenario = async (scenarioId: string) => {
    setIsExecuting(true);
    setSelectedScenario(scenarioId);
    setResponse("");
    setToolCalls([]);
    setIterations(0);

    try {
      const data = await toolsApi.runDemo(scenarioId);
      
      setResponse(data.response);
      setToolCalls(data.tool_calls || []);
      setIterations(data.iterations || 0);

      toast({
        title: "Success",
        description: "Demo executed successfully",
      });
    } catch (error) {
      console.error('Failed to execute demo:', error);
      toast({
        title: "Error",
        description: "Failed to execute demo scenario",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI Tool-Calling Demo
        </h1>
        <p className="text-muted-foreground">
          Watch Nemotron AI intelligently select and execute tools
        </p>
      </div>

      {/* Scenario Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className="glass p-6 cursor-pointer hover:glow-primary transition-smooth group"
            onClick={() => !isExecuting && executeScenario(scenario.id)}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`}>
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{scenario.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isExecuting}
            >
              {isExecuting && selectedScenario === scenario.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  Run Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* Execution Trace */}
      {(toolCalls.length > 0 || response) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Execution Trace</h2>
            <Badge variant="outline" className="text-sm">
              {iterations} iterations
            </Badge>
          </div>

          {/* Tool Calls */}
          {toolCalls.length > 0 && (
            <div className="space-y-4">
              {toolCalls.map((call, index) => (
                <Card key={index} className="glass p-6 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        Tool: {call.tool}
                        <CheckCircle className="w-4 h-4 text-success" />
                      </h4>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Arguments</p>
                      <Card className="bg-secondary/50 p-3">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(call.arguments, null, 2)}
                        </pre>
                      </Card>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Result</p>
                      <Card className="bg-success/10 p-3">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(call.result, null, 2)}
                        </pre>
                      </Card>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Final Response */}
          {response && (
            <Card className="glass p-6 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                AI Response
              </h4>
              <p className="text-foreground leading-relaxed">{response}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolDemo;
