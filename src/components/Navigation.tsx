import { Bot, LayoutDashboard, Users, AlertTriangle, Receipt, Landmark, History } from "lucide-react";
import { cn } from "@/lib/utils";

// Navigation component for the app interface

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'chatbot', label: 'AI Chatbot', icon: Bot },
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'call-history', label: 'Call History', icon: History },
    { id: 'manual-review', label: 'Manual Review', icon: AlertTriangle },
    { id: 'customers', label: 'Customer Data', icon: Users },
    { id: 'receipts', label: 'Receipt Processing', icon: Receipt },
    { id: 'financial', label: 'Financial Services', icon: Landmark },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Call of Agents
              </h1>
              <p className="text-xs text-muted-foreground">AI Banking Platform</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth",
                    isActive
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
