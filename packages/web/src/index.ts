/**
 * TangentAd SDK - Main Export
 */

export { TangentSDK } from './sdk';
export { AvatarSessionManager } from './session';
export { APIClient } from './api-client';

// Export constants
export {
  AVATAR_PROVIDERS,
  CONVERSATION_MODES,
  SESSION_EVENTS,
  AVATAR_EVENTS,
  CONNECTION_EVENTS,
  ALL_EVENTS,
  SESSION_STATUS,
  SDK_ENVIRONMENTS,
  ERROR_CODES,
  MESSAGE_TYPES
} from './constants';

// Export types
export type {
  SDKConfig,
  Avatar,
  AvatarSession,
  CreateSessionRequest,
  CreateAvatarRequest,
  SessionEventData,
  UsageMetrics,
  AvatarProvider,
  ConversationMode,
  SessionEventType,
  SessionStatus,
  SDKEnvironment,
  ErrorCode
} from './types';

// Export errors
export {
  SoulCypherError,
  AuthenticationError,
  RateLimitError,
  SessionError,
  ConnectionError
} from './types';

