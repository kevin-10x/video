import { config } from '../config/index.js';

export interface AiJobInput {
  type: string;
  projectId: string;
  userId: string;
  input: Record<string, any>;
  priority?: number;
}

export interface AiJobResponse {
  jobId: string;
  status: string;
}

export interface AiJobStatus {
  jobId: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep?: string;
  output?: Record<string, any>;
  error?: string;
}

class AiServiceClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = config.aiServiceUrl;
    this.token = config.aiServiceToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`AI Service Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async createJob(input: AiJobInput): Promise<AiJobResponse> {
    return this.request<AiJobResponse>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getJobStatus(jobId: string): Promise<AiJobStatus> {
    return this.request<AiJobStatus>(`/api/jobs/${jobId}/status`);
  }

  async cancelJob(jobId: string): Promise<void> {
    return this.request(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }

  async getStyles(): Promise<string[]> {
    return this.request('/api/styles');
  }

  async getAfricanAssets(): Promise<any> {
    return this.request('/api/assets/african');
  }
}

export const aiService = new AiServiceClient();