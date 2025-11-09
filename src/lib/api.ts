import axios from 'axios';

const API_BASE_URL = 'https://worldlink-ai.xyz:8100';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.message, error.config?.url);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Chatbot APIs
export const chatbotApi = {
  createSession: async (sessionType = 'general', userId = 'user123') => {
    const response = await api.post('/api/chatbot/sessions', {
      session_type: sessionType,
      user_id: userId,
    });
    return response.data;
  },

  getHistory: async (sessionId: string) => {
    const response = await api.get(`/api/chatbot/sessions/${sessionId}/history`);
    return response.data;
  },

  submitFeedback: async (sessionId: string, rating: number, feedbackText?: string) => {
    const response = await api.post('/api/chatbot/feedback', {
      session_id: sessionId,
      rating,
      feedback_text: feedbackText,
    });
    return response.data;
  },
};

// Customer Data APIs
export const customerApi = {
  getAllCustomers: async (limit = 50, offset = 0) => {
    const response = await api.get(`/api/admin/customers?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getCustomerDetails: async (customerId: number) => {
    const response = await api.get(`/api/admin/customers/${customerId}/details`);
    return response.data;
  },
};

// Admin APIs
export const adminApi = {
  getOverview: async (timeRange = 'today') => {
    const response = await api.get(`/api/admin/analytics/overview?time_range=${timeRange}`);
    return response.data;
  },

  getAgentPerformance: async (timeRange = 'today') => {
    const response = await api.get(`/api/admin/agents/performance?time_range=${timeRange}`);
    return response.data;
  },

  getActivityFeed: async (limit = 10) => {
    // Use interactions/timeline endpoint which has CrewAI trace data
    const response = await api.get(`/api/admin/interactions/timeline?limit=${limit}`);
    return response.data;
  },

  getFinancialReport: async (timeRange = 'month') => {
    const response = await api.get(`/api/admin/analytics/financial?time_range=${timeRange}`);
    return response.data;
  },

  getComplianceReport: async (timeRange = 'week') => {
    const response = await api.get(`/api/admin/compliance/report?time_range=${timeRange}`);
    return response.data;
  },

  // Manual Review APIs
  getManualReviews: async (status = 'pending', limit = 50) => {
    const response = await api.get(`/api/admin/manual-reviews?status=${status}&limit=${limit}`);
    return response.data;
  },

  flagRequestForReview: async (requestId: string, reason: string, priority = 'medium', criteria = 'manual') => {
    const response = await api.post(`/api/admin/manual-reviews/flag?request_id=${requestId}&reason=${reason}&priority=${priority}&criteria=${criteria}`);
    return response.data;
  },

  updateManualReview: async (reviewId: string, status: string, notes?: string, assignedTo?: string) => {
    const response = await api.put(`/api/admin/manual-reviews/${reviewId}`, {
      status,
      notes,
      assigned_to: assignedTo,
    });
    return response.data;
  },

  autoFlagSuspiciousRequests: async () => {
    const response = await api.post('/api/admin/manual-reviews/auto-flag');
    return response.data;
  },

  // Chat History APIs
  getChatSessions: async (limit = 50, status?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append('status', status);
    const response = await api.get(`/api/admin/chat/sessions?${params}`);
    return response.data;
  },

  getChatMessages: async (sessionId: string, limit = 100) => {
    const response = await api.get(`/api/admin/chat/sessions/${sessionId}/messages?limit=${limit}`);
    return response.data;
  },

  getChatAnalytics: async (timeRange = 'today') => {
    const response = await api.get(`/api/admin/chat/analytics?time_range=${timeRange}`);
    return response.data;
  },

  getCallDetails: async (sessionId: string) => {
    const response = await api.get(`/api/admin/calls/${sessionId}/details`);
    return response.data;
  },

  getTransactionDetails: async (transactionId: number) => {
    const response = await api.get(`/api/admin/transactions/${transactionId}/details`);
    return response.data;
  },

  deleteChatSession: async (sessionId: string) => {
    const response = await api.delete(`/api/admin/chat/sessions/${sessionId}`);
    return response.data;
  },
};

// Intelligence APIs
export const intelligenceApi = {
  analyzeSentiment: async (sessionId: string, message: string) => {
    const response = await api.post('/api/intelligence/sentiment', {
      session_id: sessionId,
      message,
    });
    return response.data;
  },

  classifyIntent: async (sessionId: string, message: string) => {
    const response = await api.post('/api/intelligence/intent', {
      session_id: sessionId,
      message,
    });
    return response.data;
  },

  detectUrgency: async (sessionId: string, message: string) => {
    const response = await api.post('/api/intelligence/urgency', {
      session_id: sessionId,
      message,
    });
    return response.data;
  },
};

// Receipt Processing APIs
export const receiptApi = {
  uploadReceipt: async (customerId: number, file: File) => {
    const formData = new FormData();
    formData.append('customer_id', customerId.toString());
    formData.append('file', file);
    
    const response = await api.post('/api/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCustomerReceipts: async (customerId: number, limit = 50, category?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (category) params.append('category', category);
    const response = await api.get(`/api/receipts/customer/${customerId}?${params}`);
    return response.data;
  },

  getSpendingSummary: async (customerId: number, months = 3) => {
    const response = await api.get(`/api/receipts/customer/${customerId}/summary?months=${months}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/api/receipts/categories');
    return response.data;
  },
};

// Financial Services APIs (Plaid + Stripe)
export const financialApi = {
  // Plaid - Bank Linking
  createLinkToken: async (customerId: number) => {
    const response = await api.post('/api/financial/plaid/create-link-token', {
      customer_id: customerId,
    });
    return response.data;
  },

  exchangeToken: async (customerId: number, publicToken: string) => {
    const response = await api.post('/api/financial/plaid/exchange-token', {
      customer_id: customerId,
      public_token: publicToken,
    });
    return response.data;
  },

  getBalances: async (customerId: number) => {
    const response = await api.get(`/api/financial/plaid/balances/${customerId}`);
    return response.data;
  },

  getTransactions: async (customerId: number, days = 30) => {
    const response = await api.get(`/api/financial/plaid/transactions/${customerId}?days=${days}`);
    return response.data;
  },

  // Stripe - Payments
  processPayment: async (customerId: number, amount: number, description: string, source = 'card') => {
    const response = await api.post('/api/financial/stripe/process-payment', {
      customer_id: customerId,
      amount,
      description,
      source,
    });
    return response.data;
  },

  createRefund: async (paymentId: string, amount?: number, reason = 'requested_by_customer') => {
    const response = await api.post('/api/financial/stripe/refund', {
      payment_id: paymentId,
      amount,
      reason,
    });
    return response.data;
  },

  getPaymentHistory: async (customerId: number, limit = 50) => {
    const response = await api.get(`/api/financial/stripe/payment-history/${customerId}?limit=${limit}`);
    return response.data;
  },

  getPaymentSummary: async (customerId: number) => {
    const response = await api.get(`/api/financial/stripe/payment-summary/${customerId}`);
    return response.data;
  },

  // Orchestration
  payFromLinkedAccount: async (customerId: number, amount: number, description: string) => {
    const response = await api.post(
      `/api/financial/pay-from-linked-account?customer_id=${customerId}&amount=${amount}&description=${encodeURIComponent(description)}`
    );
    return response.data;
  },

  getFinancialOverview: async (customerId: number) => {
    const response = await api.get(`/api/financial/financial-overview/${customerId}`);
    return response.data;
  },
};

export default api;
