/**
 * API Client for SoulCypher Platform Backend
 */

import {
  SDKConfig,
  Avatar,
  AvatarSession,
  CreateSessionRequest,
  CreateAvatarRequest,
  SoulCypherError,
  AuthenticationError,
  RateLimitError,
} from "./types";

export class APIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: SDKConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.soulcypher.ai";

    if (!this.apiKey) {
      throw new AuthenticationError("API key is required");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/v1${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof SoulCypherError) {
        throw error;
      }

      // Network or other errors
      throw new SoulCypherError(
        `Request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "NETWORK_ERROR"
      );
    }
  }

  private async requestFormData<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/v1${endpoint}`;

    // For FormData, don't set Content-Type - let browser set it with boundary
    const headers = {
      "X-API-Key": this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof SoulCypherError) {
        throw error;
      }

      // Network or other errors
      throw new SoulCypherError(
        `Request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "NETWORK_ERROR"
      );
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const text = await response.text();
    let errorData: any;

    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { message: text };
    }

    const message =
      errorData.message || `Request failed with status ${response.status}`;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message);
      case 429:
        throw new RateLimitError(message);
      case 400:
        throw new SoulCypherError(message, "VALIDATION_ERROR", 400);
      case 404:
        throw new SoulCypherError(message, "NOT_FOUND", 404);
      case 500:
        throw new SoulCypherError(message, "INTERNAL_ERROR", 500);
      default:
        throw new SoulCypherError(message, "API_ERROR", response.status);
    }
  }

  // Avatar operations
  async getAvatars(options?: { limit?: number; offset?: number; category?: string; search?: string }): Promise<{ avatars: Avatar[]; pagination?: any }> {
    const params = new URLSearchParams();

    // Default to 100 (max) to fetch all avatars unless specified
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    if (options?.category) {
      params.append('category', options.category);
    }
    if (options?.search) {
      params.append('search', options.search);
    }

    const queryString = params.toString();
    return this.request<{ avatars: Avatar[]; pagination?: any }>(`/avatars${queryString ? `?${queryString}` : ''}`);
  }

  async getAvatar(avatarId: string): Promise<Avatar> {
    return this.request<Avatar>(`/avatars/${avatarId}`);
  }

  /**
   * Create a new avatar with required file uploads
   *
   * @param request - Avatar creation request with files
   * @param request.audioFiles - Required: Array of audio files for voice creation (all providers)
   * @param request.image - Required for Hedra provider: Image file for avatar
   * @returns Promise resolving to the created avatar with voiceId
   */
  async createAvatar(request: CreateAvatarRequest): Promise<Avatar> {
    // Validate required files
    if (!request.audioFiles || request.audioFiles.length === 0) {
      throw new SoulCypherError(
        "Audio files are required for voice creation",
        "VALIDATION_ERROR",
        400
      );
    }

    if (request.provider === "hedra" && !request.image) {
      throw new SoulCypherError(
        "Image file is required for Hedra avatars",
        "VALIDATION_ERROR",
        400
      );
    }

    if (request.provider === "rpm" && !request.rpmModelUrl) {
      throw new SoulCypherError(
        "RPM model URL is required for animated avatars",
        "VALIDATION_ERROR",
        400
      );
    }

    // Create FormData for multipart upload
    const formData = new FormData();

    // Add text fields
    formData.append("name", request.name);
    if (request.description)
      formData.append("description", request.description);
    if (request.systemPrompt)
      formData.append("systemPrompt", request.systemPrompt);
    if (request.provider) formData.append("provider", request.provider);
    if (request.rpmModelUrl)
      formData.append("rpmModelUrl", request.rpmModelUrl);

    // Add complex objects as JSON strings
    if (request.personality) {
      formData.append("personality", JSON.stringify(request.personality));
    }
    if (request.meta) {
      formData.append("meta", JSON.stringify(request.meta));
    }

    // Add image file (required for Hedra provider)
    if (request.image) {
      formData.append("image", request.image);
    }

    // Add audio files (required for all providers)
    if (request.audioFiles && request.audioFiles.length > 0) {
      request.audioFiles.forEach((audioFile) => {
        formData.append("audio", audioFile);
      });
    }

    // Make request without Content-Type header (let browser set it for multipart)
    return this.requestFormData<Avatar>("/avatars", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Update an existing avatar
   *
   * @param avatarId - ID of the avatar to update
   * @param request - Avatar update request (all fields optional except avatarId)
   * @param request.audioFiles - Optional: Array of audio files for voice update
   * @param request.image - Optional: Image file for Hedra avatar update
   * @returns Promise resolving to the updated avatar
   */
  async updateAvatar(avatarId: string, request: Partial<CreateAvatarRequest> & { avatarId?: never }): Promise<Avatar> {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Add text fields (only if provided)
    if (request.name !== undefined) formData.append("name", request.name);
    if (request.description !== undefined) formData.append("description", request.description);
    if (request.systemPrompt !== undefined) formData.append("systemPrompt", request.systemPrompt);

    // Add complex objects as JSON strings (only if provided)
    if (request.personality !== undefined) {
      formData.append("personality", JSON.stringify(request.personality));
    }
    if (request.meta !== undefined) {
      formData.append("meta", JSON.stringify(request.meta));
    }

    // Add image file (optional for updates)
    if (request.image) {
      formData.append("image", request.image);
    }

    // Add audio files (optional for updates)
    if (request.audioFiles && request.audioFiles.length > 0) {
      request.audioFiles.forEach((audioFile) => {
        formData.append("audio", audioFile);
      });
    }

    // Make PATCH request
    return this.requestFormData<Avatar>(`/avatars/${avatarId}`, {
      method: "PATCH",
      body: formData,
    });
  }

  async setAvatarVisibility(avatarId: string, marketplace: boolean): Promise<{ id: string; name: string; marketplace: boolean }> {
    return this.request<{ id: string; name: string; marketplace: boolean }>(`/avatars/${avatarId}/visibility`, {
      method: 'POST',
      body: JSON.stringify({ marketplace }),
    });
  }

  // Session operations
  async createSession(request: CreateSessionRequest): Promise<AvatarSession> {
    return this.request<AvatarSession>("/sessions/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getSession(sessionId: string): Promise<AvatarSession> {
    return this.request<AvatarSession>(`/sessions/${sessionId}`);
  }

  async getSessionStatus(sessionId: string): Promise<{
    sessionId: string;
    status: string;
    provider: string;
    avatarId: string;
    startTime: string;
    endTime?: string;
    duration: number;
    estimatedCost: number;
    roomName: string;
  }> {
    return this.request(`/sessions/${sessionId}/status`);
  }

  async endSession(sessionId: string): Promise<void> {
    await this.request(`/sessions/${sessionId}/end`, {
      method: "POST",
    });
  }

  // Health check (mounted at root level, not under /v1)
  async ping(): Promise<{ status: string; timestamp: string }> {
    const url = `${this.baseUrl}/health`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new SoulCypherError(
          `Health check failed: ${response.status}`,
          "HEALTH_CHECK_ERROR",
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof SoulCypherError) {
        throw error;
      }

      throw new SoulCypherError(
        `Health check failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "NETWORK_ERROR"
      );
    }
  }
}
