/**
 * Main SoulCypher Avatar SDK Class
 */

import { APIClient } from "./api-client";
import { AvatarSessionManager } from "./session";
import {
  SDKConfig,
  Avatar,
  AvatarSession,
  CreateSessionRequest,
  CreateAvatarRequest,
  AuthenticationError,
} from "./types";

export class SoulCypherSDK {
  private apiClient: APIClient;
  private sessions: Map<string, AvatarSessionManager> = new Map();

  constructor(config: SDKConfig) {
    if (!config.apiKey) {
      throw new AuthenticationError("API key is required");
    }

    this.apiClient = new APIClient(config);
  }

  /**
   * Get list of available avatars
   */
  async getAvatars(options?: { limit?: number; offset?: number; category?: string; search?: string }): Promise<Avatar[]> {
    const response = await this.apiClient.getAvatars(options);
    return response.avatars;
  }

  /**
   * Get specific avatar by ID
   */
  async getAvatar(avatarId: string): Promise<Avatar> {
    return this.apiClient.getAvatar(avatarId);
  }

  /**
   * Create a new avatar
   */
  async createAvatar(avatarData: CreateAvatarRequest): Promise<Avatar> {
    return this.apiClient.createAvatar(avatarData);
  }

  /**
   * Update an existing avatar
   * Only the creator project can update the avatar
   */
  async updateAvatar(avatarId: string, avatarData: Partial<CreateAvatarRequest>): Promise<Avatar> {
    return this.apiClient.updateAvatar(avatarId, avatarData);
  }

  /**
   * Set avatar marketplace visibility
   * Only the creator project can change visibility
   */
  async setAvatarVisibility(avatarId: string, marketplace: boolean): Promise<{ id: string; name: string; marketplace: boolean }> {
    return this.apiClient.setAvatarVisibility(avatarId, marketplace);
  }

  /**
   * Create a new avatar session
   */
  async createSession(
    request: CreateSessionRequest
  ): Promise<AvatarSessionManager> {
    const session = await this.apiClient.createSession(request);
    const sessionManager = new AvatarSessionManager(session);

    this.sessions.set(session.id, sessionManager);
    return sessionManager;
  }

  /**
   * Get existing session by ID
   */
  async getSession(sessionId: string): Promise<AvatarSessionManager | null> {
    // Check if we have it in memory
    const existingSession = this.sessions.get(sessionId);
    if (existingSession) {
      return existingSession;
    }

    // Fetch from API
    try {
      const session = await this.apiClient.getSession(sessionId);
      const sessionManager = new AvatarSessionManager(session);
      this.sessions.set(session.id, sessionManager);
      return sessionManager;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get session status and metadata
   */
  async getSessionStatus(sessionId: string) {
    return this.apiClient.getSessionStatus(sessionId);
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const sessionManager = this.sessions.get(sessionId);
    if (sessionManager) {
      await sessionManager.disconnect();
      this.sessions.delete(sessionId);
    }

    await this.apiClient.endSession(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): AvatarSessionManager[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clean up all sessions and disconnect
   */
  async cleanup(): Promise<void> {
    const disconnectPromises = Array.from(this.sessions.values()).map(
      (session) => session.disconnect()
    );

    await Promise.all(disconnectPromises);
    this.sessions.clear();
  }

  /**
   * Test API connectivity
   */
  async ping(): Promise<boolean> {
    try {
      await this.apiClient.ping();
      return true;
    } catch {
      return false;
    }
  }
}
