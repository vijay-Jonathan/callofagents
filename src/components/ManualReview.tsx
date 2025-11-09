import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, MessageSquare, User, X } from "lucide-react";

interface ManualReview {
  id: string;
  request_id: string;
  review_reasons: string;
  priority_level: string;
  review_status: string;
  assigned_to: string;
  review_notes: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string;
  auto_flagged: boolean;
  flagging_criteria: string;
  customer_info?: {
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    region: string;
    address: string;
  };
  account_info: any;
  request_details: {
    caller_phone: string;
    customer_id: number;
    status: string;
    created_at: string;
    user_query: string;
    intents: string[];
    response: string;
    error?: string;
  };
}

const ManualReview = () => {
  const [reviews, setReviews] = useState<ManualReview[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<ManualReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const { toast } = useToast();

  const fetchReviews = async (status: string) => {
    try {
      const data = await adminApi.getManualReviews(status, 50);
      
      if (data.success) {
        setReviews(data.reviews);
        setStatusCounts(data.status_counts);
      } else {
        console.error('Failed to fetch reviews:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReview = async (reviewId: string, status: string) => {
    try {
      const data = await adminApi.updateManualReview(reviewId, status, reviewNotes, assignedTo);
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Review updated successfully",
        });
        fetchReviews(activeTab);
        setSelectedReview(null);
        setReviewNotes('');
        setAssignedTo('');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update review",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const autoFlagRequests = async () => {
    try {
      const data = await adminApi.autoFlagSuspiciousRequests();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Auto-flagged ${data.flagged_count} requests for review`,
        });
        fetchReviews(activeTab);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to auto-flag requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error auto-flagging requests:', error);
      toast({
        title: "Error",
        description: "Failed to auto-flag requests",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading manual reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manual Review Queue</h1>
          <p className="text-muted-foreground">Review and manage flagged requests</p>
        </div>
        <Button onClick={autoFlagRequests} variant="outline">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Auto-Flag Suspicious
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="p-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(status)}
              <div>
                <p className="text-sm text-muted-foreground capitalize">{status.replace('_', ' ')}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reviews List */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_review">In Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="escalated">Escalated</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No reviews found with status: {activeTab}</p>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="p-4 hover:shadow-md transition-all duration-200 border border-border" 
                        onClick={() => setSelectedReview(review)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className={`${getPriorityColor(review.priority_level)} text-white`}>
                            {review.priority_level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {review.review_status.replace('_', ' ')}
                          </Badge>
                          {review.auto_flagged && (
                            <Badge variant="secondary">Auto-flagged</Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold mb-2 text-sm leading-tight">
                          {review.review_reasons}
                        </h3>
                        
                        <div className="text-xs text-muted-foreground mb-3 space-y-1">
                          <div>Request ID: {review.request_id?.slice(-8) || 'N/A'}</div>
                          <div>Customer: {review.customer_info ? `${review.customer_info.first_name} ${review.customer_info.last_name}` : `***${review.request_details.caller_phone?.slice(-4) || 'Unknown'}`}</div>
                          <div>Created: {new Date(review.created_at).toLocaleString()}</div>
                        </div>
                        
                        {/* User Query */}
                        {review.request_details.user_query && review.request_details.user_query !== 'No transcription available' && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">User Query:</p>
                            <div className="text-xs p-2 rounded border overflow-hidden bg-muted border-border text-foreground" style={{ 
                              display: '-webkit-box', 
                              WebkitLineClamp: 3, 
                              WebkitBoxOrient: 'vertical' 
                            }}>
                              <MessageSquare className="w-3 h-3 inline mr-1 text-blue-600 dark:text-blue-400" />
                              {review.request_details.user_query}
                            </div>
                          </div>
                        )}
                        
                        {/* Intents */}
                        {review.request_details.intents && review.request_details.intents.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Intents:</p>
                            <div className="flex flex-wrap gap-1">
                              {review.request_details.intents.map((intent: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                                  {intent}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Response */}
                        {review.request_details.response && review.request_details.response !== 'No response available' && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Response:</p>
                            <div className="text-xs p-2 rounded border overflow-hidden bg-muted border-border text-foreground" style={{ 
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical' 
                            }}>
                              {review.request_details.response}
                            </div>
                          </div>
                        )}
                        
                        {review.request_details.error && (
                          <div className="text-xs p-2 rounded border bg-muted border-border text-foreground">
                            <AlertTriangle className="w-3 h-3 inline mr-1 text-red-600 dark:text-red-400" />
                            Error: {review.request_details.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Review Details */}
        <div className="lg:col-span-1">
          {selectedReview ? (
            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Review Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReview(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Review Reason</label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded border border-border">{selectedReview.review_reasons}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Priority</label>
                  <div className="mt-1">
                    <Badge className={`${getPriorityColor(selectedReview.priority_level)} text-white`}>
                      {selectedReview.priority_level.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                {/* Customer Information */}
                {selectedReview.customer_info && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Customer Information</label>
                    <div className="text-sm mt-1 p-3 bg-muted rounded border border-border space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <p><strong>Name:</strong> {selectedReview.customer_info.first_name} {selectedReview.customer_info.last_name}</p>
                        <p><strong>Phone:</strong> {selectedReview.customer_info.phone}</p>
                        <p><strong>Email:</strong> {selectedReview.customer_info.email}</p>
                        <p><strong>ID:</strong> {selectedReview.customer_info.customer_id}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Request Details */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Request Details</label>
                  <div className="text-sm mt-1 p-3 bg-muted rounded border border-border space-y-1">
                    <p>Phone: ***{selectedReview.request_details.caller_phone?.slice(-4) || 'Unknown'}</p>
                    <p>Status: {selectedReview.request_details.status}</p>
                    <p>Created: {new Date(selectedReview.request_details.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* User Query */}
                {selectedReview.request_details.user_query && selectedReview.request_details.user_query !== 'No transcription available' && (
                  <div>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">User Query</p>
                    <p className="text-sm mt-1 p-3 bg-muted rounded border border-border text-foreground">
                      {selectedReview.request_details.user_query}
                    </p>
                  </div>
                )}
                
                {/* Intents */}
                {selectedReview.request_details.intents && selectedReview.request_details.intents.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">Detected Intents</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedReview.request_details.intents.map((intent: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {intent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Response */}
                {selectedReview.request_details.response && selectedReview.request_details.response !== 'No response available' && (
                  <div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">System Response</p>
                    <p className="text-sm mt-1 p-3 bg-muted rounded border border-border text-foreground">
                      {selectedReview.request_details.response}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">Assign To</label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent1">Agent 1</SelectItem>
                      <SelectItem value="agent2">Agent 2</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Review Notes</label>
                  <Textarea 
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes..."
                    rows={4}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={() => updateReview(selectedReview.id, 'approved')} 
                          className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button onClick={() => updateReview(selectedReview.id, 'rejected')} 
                          variant="destructive" className="flex-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => updateReview(selectedReview.id, 'escalated')} 
                          variant="outline" className="flex-1">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Select a review to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualReview;
