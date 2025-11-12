/**
 * Core types for TangentAd SDK
 */

import type {
  AvatarProvider,
  SessionEventType,
  SessionStatus,
  SDKEnvironment,
  ErrorCode,
} from "./constants";

// Re-export the types
export type {
  AvatarProvider,
  SessionEventType,
  SessionStatus,
  SDKEnvironment,
  ErrorCode,
};

export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  environment?: SDKEnvironment;
}

export interface Avatar {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  previewVideoUrl?: string;
  provider: AvatarProvider;
  voiceId?: string; // ElevenLabs voice ID
  costPerMinute: number;
  isActive: boolean;
  marketplace?: boolean;
  isOwned?: boolean; // Whether the requesting project owns this avatar
  createdAt: string;
  updatedAt?: string;
  meta?: {
    source?: string;
    userId?: string;
    knowledgeText?: string;
    links?: string[];
    [key: string]: any;
  };
  // Provider-specific configurations
  hedraConfig?: {
    id: string;
  };
  modelUri?: string; // For RPM avatars
}

export interface CreateSessionRequest {
  avatarId: string;
  userId: string;
  metadata?: {
    sessionName?: string;
    customContext?: string;
    userAgent?: string;
  };
}

export interface CreateAvatarRequest {
  name: string;
  description?: string;
  systemPrompt?: string;
  personality?: {
    tone?: string;
    communicationStyle?: string;
    responseLength?: string;
    expertise?: string[];
  };
  provider?: AvatarProvider;
  rpmModelUrl?: string; // Ready Player Me avatar model URL for RPM provider
  meta?: {
    source?: string;
    userId?: string;
    knowledgeText?: string;
    links?: string[];
  };
  // File uploads
  image?: File | Blob; // Required for Hedra provider
  audioFiles: File[] | Blob[]; // Required for all providers
}

export interface AvatarSession {
  id: string;
  sessionId: string;
  provider: string;
  roomName: string;
  liveKitToken: string;
  liveKitUrl: string;
  avatar: {
    id: string;
    slug: string;
    name: string;
    systemPrompt?: string;
    voiceId?: string;
    modelUrl?: string;
    hedraAvatarId?: string;
  };
  expiresAt: string;
}

export interface SessionEventData {
  type: SessionEventType;
  session: AvatarSession;
  timestamp: string;
  data: any;
}

export interface UsageMetrics {
  sessionId: string;
  avatarId: string;
  durationMs: number;
  cost: number;
  startedAt: string;
  endedAt: string;
}

// Affiliate Product types
export interface AffiliateProduct {
  id: string;
  avatarId: string;
  name: string;
  description: string;
  category: string;
  affiliateUrl: string;
  imageUrl?: string;
  price?: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    clicks: number;
  };
}

export interface CreateAffiliateProductRequest {
  name: string;
  description: string;
  category: string;
  affiliateUrl: string;
  imageUrl?: string;
  price?: string;
  keywords?: string[];
  isActive?: boolean;
}

export interface UpdateAffiliateProductRequest {
  name?: string;
  description?: string;
  category?: string;
  affiliateUrl?: string;
  imageUrl?: string;
  price?: string;
  keywords?: string[];
  isActive?: boolean;
}

// Error types
export class SoulCypherError extends Error {
  constructor(
    message: string,
    public code?: ErrorCode,
    public statusCode?: number
  ) {
    super(message);
    this.name = "SoulCypherError";
  }
}

export class AuthenticationError extends SoulCypherError {
  constructor(message: string = "Invalid or expired API key") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends SoulCypherError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, "RATE_LIMIT_ERROR", 429);
    this.name = "RateLimitError";
  }
}

export class SessionError extends SoulCypherError {
  constructor(message: string, code?: ErrorCode) {
    super(message, code || "SESSION_ERROR");
    this.name = "SessionError";
  }
}

export class ConnectionError extends SoulCypherError {
  constructor(message: string = "Failed to connect to avatar session") {
    super(message, "CONNECTION_ERROR");
    this.name = "ConnectionError";
  }
}
