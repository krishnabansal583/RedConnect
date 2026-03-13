import axios from './axios';

// Auth API
export const authAPI = {
  signup: async (userData: any) => {
    const response = await axios.post('/auth/signup', userData);
    return response.data;
  },
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },
  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },
};

// Donor API
export const donorAPI = {
  getDonors: async (filters?: {
    bloodGroup?: string;
    city?: string;
    requestedBloodGroup?: string;
    requestCity?: string;
  }) => {
    const response = await axios.get('/donors', { params: filters });
    return response.data;
  },
  getDonorById: async (id: string) => {
    const response = await axios.get(`/donors/${id}`);
    return response.data;
  },
  updateDonor: async (id: string, data: any) => {
    const response = await axios.put(`/donors/${id}`, data);
    return response.data;
  },
};

// Blood Request API
export const requestAPI = {
  createRequest: async (requestData: any) => {
    const response = await axios.post('/requests', requestData);
    return response.data;
  },
  getRequests: async (filters?: {
    urgencyLevel?: string;
    bloodGroup?: string;
    city?: string;
    status?: string;
  }) => {
    const response = await axios.get('/requests', { params: filters });
    return response.data;
  },
  getRequestById: async (id: string) => {
    const response = await axios.get(`/requests/${id}`);
    return response.data;
  },
  getMyRequests: async () => {
    const response = await axios.get('/requests/my-requests');
    return response.data;
  },
  updateRequestStatus: async (id: string, status: string) => {
    const response = await axios.put(`/requests/${id}`, { status });
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: async (limit?: number) => {
    const response = await axios.get('/leaderboard', {
      params: { limit },
    });
    return response.data;
  },
};

// Campus API
export const campusAPI = {
  getCampuses: async () => {
    const response = await axios.get('/campuses');
    return response.data;
  },
  getCampusById: async (id: string) => {
    const response = await axios.get(`/campuses/${id}`);
    return response.data;
  },
  createCampus: async (campusData: {
    collegeName: string;
    city: string;
    state: string;
  }) => {
    const response = await axios.post('/campuses', campusData);
    return response.data;
  },
  joinCampus: async (campusId: string) => {
    const response = await axios.post('/campuses/join', { campusId });
    return response.data;
  },
  leaveCampus: async () => {
    const response = await axios.post('/campuses/leave');
    return response.data;
  },
  getMyCampus: async () => {
    const response = await axios.get('/campuses/my-campus');
    return response.data;
  },
};

// Donation API
export const donationAPI = {
  recordDonation: async (donationData: {
    requestId?: string;
    recipientName?: string;
    hospitalName?: string;
    notes?: string;
  }) => {
    const response = await axios.post('/donations', donationData);
    return response.data;
  },
  getEligibility: async () => {
    const response = await axios.get('/donations/eligibility');
    return response.data;
  },
  getDonationHistory: async () => {
    const response = await axios.get('/donations/history');
    return response.data;
  },
  getAllDonations: async () => {
    const response = await axios.get('/donations/all');
    return response.data;
  },
};
