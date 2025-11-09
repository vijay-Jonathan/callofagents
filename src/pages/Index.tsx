import { useState } from "react";
import Navigation from "@/components/Navigation";
import ChatBot from "@/components/ChatBot";
import AdminDashboard from "@/components/AdminDashboard";
import ToolDemo from "@/components/ToolDemo";

const Index = () => {
  const [activeTab, setActiveTab] = useState('chatbot');

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pt-16">
        {activeTab === 'chatbot' && <ChatBot />}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'tools' && <ToolDemo />}
      </main>
    </div>
  );
};

export default Index;
