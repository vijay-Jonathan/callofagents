import axios from 'axios';

const API_BASE_URL = 'https://worldlink-ai.xyz:8100';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await api.get(`/api/admin/agents/activity-feed?limit=${limit}`);
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

// Tool Calling APIs
export const toolsApi = {
  runDemo: async (scenario: string) => {
    const response = await api.post(`/api/tools/demo?scenario=${scenario}`);
    return response.data;
  },

  executeCustom: async (message: string) => {
    const response = await api.post('/api/tools/execute', { message });
    return response.data;
  },

  getAvailableTools: async () => {
    const response = await api.get('/api/tools/available');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/tools/stats');
    return response.data;
  },
};

export default api;
