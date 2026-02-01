import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// DID API
export const didAPI = {
  create: async (data: { controller: string; publicKey: string; authentication?: string[]; services?: any[] }) => {
    const response = await api.post('/did/create', data);
    return response.data;
  },

  resolve: async (did: string) => {
    const response = await api.get(`/did/${did}`);
    return response.data;
  },

  update: async (did: string, data: any) => {
    const response = await api.put(`/did/${did}`, data);
    return response.data;
  },

  deactivate: async (did: string, controller: string) => {
    const response = await api.delete(`/did/${did}`, { data: { controller } });
    return response.data;
  },

  getByController: async (address: string) => {
    const response = await api.get(`/did/controller/${address}`);
    return response.data;
  },
};

// Credentials API
export const credentialsAPI = {
  issue: async (data: {
    issuerDID: string;
    subjectDID: string;
    credentialType: string;
    claims: any;
    expirationDate?: string;
  }) => {
    const response = await api.post('/credentials/issue', data);
    return response.data;
  },

  get: async (credentialId: string) => {
    const response = await api.get(`/credentials/${credentialId}`);
    return response.data;
  },

  getBySubject: async (did: string, status?: string) => {
    const response = await api.get(`/credentials/subject/${did}`, {
      params: { status },
    });
    return response.data;
  },

  getByIssuer: async (did: string) => {
    const response = await api.get(`/credentials/issuer/${did}`);
    return response.data;
  },

  revoke: async (credentialId: string, issuerAddress: string, reason?: string) => {
    const response = await api.post(`/credentials/${credentialId}/revoke`, {
      issuerAddress,
      reason,
    });
    return response.data;
  },

  verify: async (credentialId: string) => {
    const response = await api.post('/credentials/verify', { credentialId });
    return response.data;
  },
};

// ZK Proof API
export const zkProofAPI = {
  generate: async (data: { proofType: string; inputs: any }) => {
    const response = await api.post('/zkproof/generate', data);
    return response.data;
  },

  verify: async (data: { proofType: string; proof: any; publicSignals: any }) => {
    const response = await api.post('/zkproof/verify', data);
    return response.data;
  },

  get: async (proofId: string) => {
    const response = await api.get(`/zkproof/${proofId}`);
    return response.data;
  },

  getByProver: async (prover: string, proofType?: string) => {
    const response = await api.get(`/zkproof/prover/${prover}`, {
      params: { proofType },
    });
    return response.data;
  },

  ageVerification: async (data: {
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    salt: number;
    currentYear: number;
    currentMonth: number;
    currentDay: number;
    minAge: number;
    prover: string;
    credentialId?: string;
  }) => {
    const response = await api.post('/zkproof/age-verification', data);
    return response.data;
  },
};

// Access Control API
export const accessAPI = {
  request: async (data: { resourceId: string; proof: any; publicSignals: any; requester: string }) => {
    const response = await api.post('/access/request', data);
    return response.data;
  },

  check: async (requester: string, resourceId: string) => {
    const response = await api.get(`/access/check/${requester}/${resourceId}`);
    return response.data;
  },

  createPolicy: async (data: {
    policyId: string;
    resourceId: string;
    requiredCredentialType?: string;
    minAge?: number;
    requireMembership?: boolean;
    verifierContract: string;
  }) => {
    const response = await api.post('/access/policy', data);
    return response.data;
  },

  getPolicy: async (policyId: string) => {
    const response = await api.get(`/access/policy/${policyId}`);
    return response.data;
  },

  revoke: async (requester: string, resourceId: string) => {
    const response = await api.delete('/access/revoke', {
      data: { requester, resourceId },
    });
    return response.data;
  },

  getHistory: async (requester: string) => {
    const response = await api.get(`/access/history/${requester}`);
    return response.data;
  },
};

export default api;
