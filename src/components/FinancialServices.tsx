import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { financialApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { usePlaidLink } from 'react-plaid-link';
import { 
  Link as LinkIcon,
  DollarSign,
  CreditCard,
  TrendingUp,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface LinkedAccount {
  id: string;
  name: string;
  institution: string;
  type: string;
  mask: string;
  current_balance: number;
  available_balance: number | null;
  last_synced: string | null;
}

interface Transaction {
  account_name: string;
  institution: string;
  date: string;
  name: string;
  merchant_name?: string;
  amount: number;
  category: string[];
  pending: boolean;
}

interface Payment {
  id: string;
  payment_intent_id: string;
  amount: number;
  status: string;
  description: string;
  payment_method_type: string;
  fee: number;
  net: number;
  refunded_amount: number;
  created_at: string;
}

const FinancialServices = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [isLinking, setIsLinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const { toast } = useToast();

  const customerId = 123; // Demo customer ID

  // Plaid Link hook - opens the bank selection widget
  const { open: openPlaidLink, ready } = usePlaidLink({
    token: linkToken || null,  // Pass null explicitly if no token
    onSuccess: async (public_token: string, metadata: any) => {
      try {
        // Exchange public token for access token
        await financialApi.exchangeToken(customerId, public_token);
        
        toast({
          title: "Bank Linked Successfully!",
          description: `Connected ${metadata.institution?.name || 'your bank'}`,
        });
        
        // Reload account data
        await loadFinancialData();
        setIsLinking(false);
      } catch (error) {
        console.error('Failed to exchange token:', error);
        toast({
          title: "Error",
          description: "Failed to complete bank linking",
          variant: "destructive",
        });
        setIsLinking(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast({
          title: "Linking Cancelled",
          description: err.display_message || "Bank linking was cancelled",
          variant: "destructive",
        });
      }
      setIsLinking(false);
    },
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      // Load all financial data
      const [balancesRes, transactionsRes, paymentsRes, summaryRes] = await Promise.all([
        financialApi.getBalances(customerId),
        financialApi.getTransactions(customerId, 30),
        financialApi.getPaymentHistory(customerId, 20),
        financialApi.getPaymentSummary(customerId)
      ]);

      if (balancesRes.success) {
        setLinkedAccounts(balancesRes.accounts || []);
        setTotalBalance(balancesRes.total_balance || 0);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.transactions || []);
      }

      if (paymentsRes.success) {
        setPayments(paymentsRes.payments || []);
      }

      if (summaryRes.success) {
        setPaymentSummary(summaryRes);
      }
    } catch (error) {
      console.error('Failed to load financial data:', error);
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkBank = async () => {
    setIsLinking(true);
    try {
      // Create link token from backend
      const result = await financialApi.createLinkToken(customerId);
      
      if (result.success) {
        setIsDemoMode(result.demo_mode || false);
        
        if (result.demo_mode) {
          // Demo mode: simulate linking
          await financialApi.exchangeToken(customerId, "demo-token");
          
          toast({
            title: "Bank Linked! (Demo Mode)",
            description: "Demo Bank account linked. Add real Plaid API keys in .env to link actual banks.",
          });
          
          await loadFinancialData();
          setIsLinking(false);
        } else {
          // Production mode: Open real Plaid Link widget!
          setLinkToken(result.link_token);
          
          toast({
            title: "Opening Plaid Link...",
            description: "Select your bank from the list",
          });
          
          // The usePlaidLink hook will detect the token and enable the widget
          // We'll call open() after token is set
          setTimeout(() => {
            if (ready && result.link_token) {
              openPlaidLink();
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to link bank:', error);
      toast({
        title: "Error",
        description: "Failed to link bank account",
        variant: "destructive",
      });
      setIsLinking(false);
    }
  };

  // Open Plaid Link when link token is set and ready
  useEffect(() => {
    if (linkToken && linkToken !== "link-sandbox-demo-token-12345" && ready && !isDemoMode) {
      openPlaidLink();
    }
  }, [linkToken, ready, isDemoMode, openPlaidLink]);

  const handleProcessPayment = async () => {
    try {
      const result = await financialApi.processPayment(
        customerId,
        150.00,
        "Credit card payment",
        "card"
      );

      if (result.success) {
        toast({
          title: "Payment Processed",
          description: `Paid $${result.amount}. Fee: $${result.fee}`,
        });
        
        // Reload payment data
        const paymentsRes = await financialApi.getPaymentHistory(customerId, 20);
        if (paymentsRes.success) {
          setPayments(paymentsRes.payments || []);
        }
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          🔗 Financial Services
        </h1>
        <p className="text-muted-foreground">
          Plaid Bank Linking + Stripe Payments | Powered by Nemotron
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">
            <Building2 className="w-4 h-4 mr-2" />
            Linked Accounts
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <TrendingUp className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="overview">
            <DollarSign className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Linked Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Linked Bank Accounts</h2>
            <Button onClick={handleLinkBank} disabled={isLinking}>
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link Bank Account
                </>
              )}
            </Button>
          </div>

          {linkedAccounts.length === 0 && !isLoading && (
            <Card className="glass p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Banks Linked</h3>
              <p className="text-muted-foreground mb-4">
                Link your bank account to see balances and transactions
              </p>
              <Button onClick={handleLinkBank} disabled={isLinking}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Link Your First Bank
              </Button>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedAccounts.map((account) => (
              <Card key={account.id} className="glass p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">{account.institution}</p>
                    <Badge variant="outline" className="mt-1">
                      {account.type} •••• {account.mask}
                    </Badge>
                  </div>
                  <Building2 className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="text-2xl font-bold">
                      ${account.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {account.available_balance !== null && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium">
                        ${account.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {account.last_synced && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Last synced: {new Date(account.last_synced).toLocaleString()}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {linkedAccounts.length > 0 && (
            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance Across All Accounts</p>
                  <p className="text-4xl font-bold mt-2">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-16 h-16 text-success" />
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <Button variant="outline" size="sm" onClick={loadFinancialData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {transactions.length === 0 ? (
            <Card className="glass p-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Transactions</h3>
              <p className="text-muted-foreground">
                Link a bank account to see your transaction history
              </p>
            </Card>
          ) : (
            <Card className="glass p-6">
              <div className="space-y-3">
                {transactions.map((txn, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-smooth">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.amount < 0 ? 'bg-red-500/20' : 'bg-green-500/20'
                      }`}>
                        {txn.amount < 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{txn.merchant_name || txn.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {txn.account_name} • {new Date(txn.date).toLocaleDateString()}
                        </p>
                        {txn.category && txn.category.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {txn.category.slice(0, 2).map((cat, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        txn.amount < 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toFixed(2)}
                      </p>
                      {txn.pending && (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Payment History</h2>
            <Button onClick={handleProcessPayment}>
              <CreditCard className="w-4 h-4 mr-2" />
              Make Demo Payment
            </Button>
          </div>

          {payments.length === 0 ? (
            <Card className="glass p-12 text-center">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Payments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Process a payment to see your payment history
              </p>
              <Button onClick={handleProcessPayment}>
                Make Your First Payment
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="glass p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{payment.description}</h3>
                        {payment.status === 'succeeded' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>ID: {payment.payment_intent_id.substring(0, 20)}...</span>
                        <span>•</span>
                        <span>{new Date(payment.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge>{payment.status}</Badge>
                        <Badge variant="outline">{payment.payment_method_type}</Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-2xl font-bold">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Fee: ${payment.fee.toFixed(2)}</p>
                      <p className="text-sm font-medium">Net: ${payment.net.toFixed(2)}</p>
                      {payment.refunded_amount > 0 && (
                        <Badge variant="destructive">
                          Refunded: ${payment.refunded_amount.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <h2 className="text-2xl font-bold">Financial Overview</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <p className="text-3xl font-bold">${totalBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {linkedAccounts.length} account{linkedAccounts.length !== 1 && 's'}
              </p>
            </Card>

            {paymentSummary && (
              <>
                <Card className="glass p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">${paymentSummary.total_paid?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {paymentSummary.total_payments || 0} payment{paymentSummary.total_payments !== 1 && 's'}
                  </p>
                </Card>

                <Card className="glass p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Avg Payment</p>
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-3xl font-bold">${paymentSummary.avg_payment?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Net: ${paymentSummary.net_paid?.toFixed(2) || '0.00'}
                  </p>
                </Card>
              </>
            )}
          </div>

          <Card className="glass p-6">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Linked Accounts</span>
                </div>
                <span className="text-xl font-bold">{linkedAccounts.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="font-medium">Transactions (30 days)</span>
                </div>
                <span className="text-xl font-bold">{transactions.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <span className="font-medium">Total Payments</span>
                </div>
                <span className="text-xl font-bold">{payments.length}</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialServices;
