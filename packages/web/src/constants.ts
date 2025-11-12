/**
 * SDK Constants - Single source of truth for all string values
 */

// Avatar Provider Constants (matching platform-backend)
export const AVATAR_PROVIDERS = {
  RPM: "rpm",
  HEDRA: "hedra",
} as const;

export type AvatarProvider =
  (typeof AVATAR_PROVIDERS)[keyof typeof AVATAR_PROVIDERS];

// Session Event Types
export const SESSION_EVENTS = {
  STARTED: "session.started",
  ENDED: "session.ended",
  ERROR: "session.error",
} as const;

// Avatar Event Types
export const AVATAR_EVENTS = {
  VIDEO: "avatar.video",
  AUDIO: "avatar.audio",
  AUDIO_BLOCKED: "avatar.audio.blocked",
  AUDIO_UNBLOCKED: "avatar.audio.unblocked",
  STATUS: "avatar.status",
  INPUT: "avatar.input",
  RESPONSE: "avatar.response",
  ERROR: "avatar.error",
} as const;

// Message Type Constants (for DataChannel)
export const MESSAGE_TYPES = {
  STATUS: "status",
  INPUT: "input",
  RESPONSE: "response",
  ERROR: "error",
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

// Connection Event Types
export const CONNECTION_EVENTS = {
  QUALITY: "connection.quality",
} as const;

// All Event Types Combined
export const ALL_EVENTS = {
  ...SESSION_EVENTS,
  ...AVATAR_EVENTS,
  ...CONNECTION_EVENTS,
} as const;

export type SessionEventType = (typeof ALL_EVENTS)[keyof typeof ALL_EVENTS];

// Session Status Constants
export const SESSION_STATUS = {
  ACTIVE: "active",
  ENDED: "ended",
  ERROR: "error",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

// SDK Environment Constants
export const SDK_ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export type SDKEnvironment =
  (typeof SDK_ENVIRONMENTS)[keyof typeof SDK_ENVIRONMENTS];

// Error Code Constants
export const ERROR_CODES = {
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  SESSION_ERROR: "SESSION_ERROR",
  CONNECTION_ERROR: "CONNECTION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  API_ERROR: "API_ERROR",
  HEALTH_CHECK_ERROR: "HEALTH_CHECK_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
