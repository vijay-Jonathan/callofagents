import { useState } from "react";
import Navigation from "@/components/Navigation";
import ChatBot from "@/components/ChatBot";
import AdminDashboard from "@/components/AdminDashboard";
import CallHistory from "@/components/CallHistory";
import ManualReview from "@/components/ManualReview";
import CustomerData from "@/components/CustomerData";
import ReceiptProcessing from "@/components/ReceiptProcessing";
import FinancialServices from "@/components/FinancialServices";

const Index = () => {
  const [activeTab, setActiveTab] = useState('chatbot');

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pt-16">
        {activeTab === 'chatbot' && <ChatBot />}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'call-history' && <CallHistory />}
        {activeTab === 'manual-review' && <ManualReview />}
        {activeTab === 'customers' && <CustomerData />}
        {activeTab === 'receipts' && <ReceiptProcessing />}
        {activeTab === 'financial' && <FinancialServices />}
      </main>
    </div>
  );
};

export default Index;
