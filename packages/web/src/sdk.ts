/**
 * Main TangentAd SDK Class
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

export class TangentSDK {
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
   * Delete an avatar
   * Only the creator project can delete the avatar
   */
  async deleteAvatar(avatarId: string): Promise<void> {
    return this.apiClient.deleteAvatar(avatarId);
  }

  /**
   * Get all knowledge items for an avatar
   */
  async getAvatarKnowledge(avatarId: string): Promise<any[]> {
    return this.apiClient.getAvatarKnowledge(avatarId);
  }

  /**
   * Add knowledge to an avatar from text or file
   *
   * @param avatarId - ID of the avatar
   * @param data - Knowledge data (text, file, or both)
   * @param data.text - Optional: Text content to add
   * @param data.file - Optional: File to upload (PDF, TXT, etc.)
   * @param data.title - Optional: Title for the knowledge item
   */
  async addAvatarKnowledge(avatarId: string, data: { text?: string; file?: File; title?: string }): Promise<any> {
    const formData = new FormData();

    // Determine sourceType based on what's provided
    if (data.file) {
      formData.append('sourceType', 'file');
      formData.append('file', data.file);
    } else if (data.text) {
      formData.append('sourceType', 'text');
      formData.append('content', data.text); // Backend expects 'content' for text
    } else {
      throw new Error('Either text or file must be provided');
    }

    if (data.title) {
      formData.append('title', data.title);
    }

    return this.apiClient.addAvatarKnowledge(avatarId, formData);
  }

  /**
   * Delete a knowledge item from an avatar
   */
  async deleteAvatarKnowledge(avatarId: string, knowledgeId: string): Promise<void> {
    return this.apiClient.deleteAvatarKnowledge(avatarId, knowledgeId);
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
   * Get conversation history for a user and avatar
   */
  async getConversations(params: {
    userId: string;
    avatarId: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.apiClient.getConversations(params);
  }

  /**
   * Merge anonymous user's conversation history into authenticated user
   * Called when an anonymous user signs up or logs in
   *
   * @param anonymousUserId - The UUID of the anonymous user
   * @param authenticatedUserId - The user ID of the authenticated user
   * @returns Result with number of rows updated
   */
  async mergeAnonymousSession(params: {
    anonymousUserId: string;
    authenticatedUserId: string;
  }): Promise<{ success: boolean; rowsUpdated: number; message: string }> {
    return this.apiClient.mergeAnonymousSession(params);
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
   * Get affiliate products for an avatar
   */
  async getAffiliateProducts(avatarId: string, includeInactive: boolean = false) {
    return this.apiClient.getAffiliateProducts(avatarId, includeInactive);
  }

  /**
   * Get a single affiliate product by ID
   */
  async getAffiliateProduct(productId: string) {
    return this.apiClient.getAffiliateProduct(productId);
  }

  /**
   * Create a new affiliate product for an avatar
   */
  async createAffiliateProduct(avatarId: string, productData: any) {
    return this.apiClient.createAffiliateProduct(avatarId, productData);
  }

  /**
   * Update an existing affiliate product
   */
  async updateAffiliateProduct(productId: string, updates: any) {
    return this.apiClient.updateAffiliateProduct(productId, updates);
  }

  /**
   * Delete an affiliate product
   */
  async deleteAffiliateProduct(productId: string) {
    return this.apiClient.deleteAffiliateProduct(productId);
  }

  /**
   * Track an affiliate product click
   */
  async trackAffiliateClick(productId: string, clickData: {
    userId?: string;
    sessionId: string;
    userQuery: string;
    avatarResponse: string;
  }) {
    return this.apiClient.trackAffiliateClick(productId, clickData);
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
