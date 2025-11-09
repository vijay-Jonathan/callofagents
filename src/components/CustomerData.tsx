import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { customerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, MapPin, DollarSign, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomerData = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  const fetchCustomers = async (page = 0) => {
    try {
      setIsLoading(true);
      const limit = 20;
      const offset = page * limit;
      const response = await customerApi.getAllCustomers(limit, offset);
      
      if (response.success) {
        setCustomers(response.customers);
        setPagination(response.pagination);
        setCurrentPage(page);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load customers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerClick = async (customerId: number) => {
    try {
      const details = await customerApi.getCustomerDetails(customerId);
      if (details.success) {
        setSelectedCustomer(details);
      } else {
        toast({
          title: "Error",
          description: details.error || "Failed to load customer details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          Customer Data
        </h1>
        <div className="text-sm text-muted-foreground">
          Showing {customers.length} of {pagination.total || 0} customers
        </div>
      </div>

      {/* Customers Grid */}
      <Card className="glass p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div
              key={customer.customer_id}
              className={cn(
                "p-4 rounded-lg border border-border cursor-pointer transition-smooth",
                "hover:bg-secondary/50 hover:shadow-md"
              )}
              onClick={() => handleCustomerClick(customer.customer_id)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    ID: {customer.customer_id}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>DOB: {new Date(customer.dob).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{customer.region}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Accounts: </span>
                    <span className="font-medium">{customer.account_count}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Balance: </span>
                    <span className="font-medium text-green-600">
                      ${customer.total_balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {customer.review_required && (
                  <Badge variant="destructive" className="text-xs w-full justify-center">
                    Review Required
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.total > 20 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCustomers(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {Math.ceil(pagination.total / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCustomers(currentPage + 1)}
              disabled={!pagination.has_more}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedCustomer.customer.first_name} {selectedCustomer.customer.last_name}</p>
                    <p><strong>Customer ID:</strong> {selectedCustomer.customer.customer_id}</p>
                    <p><strong>Email:</strong> {selectedCustomer.customer.email}</p>
                    <p><strong>Phone:</strong> {selectedCustomer.customer.phone}</p>
                    <p><strong>DOB:</strong> {new Date(selectedCustomer.customer.dob).toLocaleDateString()}</p>
                    <p><strong>Region:</strong> {selectedCustomer.customer.region}</p>
                    <p><strong>Address:</strong> {selectedCustomer.customer.address}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Account Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Accounts:</strong> {selectedCustomer.accounts.length}</p>
                    <p><strong>Total Balance:</strong> ${selectedCustomer.accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0).toLocaleString()}</p>
                    {selectedCustomer.customer.review_required && (
                      <div className="mt-2">
                        <Badge variant="destructive">Review Required</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{selectedCustomer.customer.review_reasons}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accounts */}
              <div>
                <h4 className="font-semibold mb-3">Accounts</h4>
                <div className="space-y-2">
                  {selectedCustomer.accounts.map((account: any, index: number) => (
                    <div key={index} className="p-3 bg-secondary rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Account {account.account_id}</p>
                          <p className="text-sm text-muted-foreground">{account.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {account.branch.name}, {account.branch.city}, {account.branch.state}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Opened: {new Date(account.open_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${account.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {selectedCustomer.recent_transactions.map((txn: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-secondary rounded text-sm">
                      <div>
                        <p className="font-medium">{txn.type}: ${txn.amount}</p>
                        <p className="text-xs text-muted-foreground">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">Account {txn.account_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString()}
                        </p>
                        <Badge variant={txn.status === 'COMPLETED' ? 'default' : 'destructive'} className="text-xs mt-1">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerData;
