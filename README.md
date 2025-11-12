# TangentAd SDK

JavaScript/TypeScript SDK for integrating streaming AI avatars into your applications. Turn AI conversations into revenue.

## Installation

```bash
npm install @tangentad/sdk
```

## Quick Start

```typescript

import { TangentSDK, AvatarSessionManager, AVATAR_PROVIDERS } from '@tangentad/sdk';

const sdk = new TangentSDK({
  apiKey: "your-api-key",
});

// Get avatars
const avatars = await sdk.getAvatars();

// Create session
const sessionManager = await sdk.createSession({
  avatarId: avatars[0].id,
  userId: "user-123",
});

// Connect (video for Hedra, audio-only for RPM)
const videoEl = document.getElementById("video");
const audioEl = document.getElementById("audio");

if (avatars[0].provider === AVATAR_PROVIDERS.HEDRA) {
  await sessionManager.connect(videoEl, audioEl);
} else {
  await sessionManager.connect(undefined, audioEl);
}

// Listen for responses
sessionManager.on("avatar.response", (event) => {
  console.log("Avatar said:", event.data.text);
});

// Send message
await sessionManager.sendMessage("Hello!");
```

## Provider Types

- **Hedra**: Video + audio avatars
- **RPM**: Audio-only avatars

## Creating Avatars

You can create custom avatars with voice and image files:

```typescript
// For Hedra avatars (requires image + audio)
const imageFile = document.getElementById("imageInput").files[0];
const audioFiles = Array.from(document.getElementById("audioInput").files);

const hedraAvatar = await sdk.createAvatar({
  name: "My Hedra Avatar",
  description: "Custom avatar with video",
  provider: "hedra",
  image: imageFile, // Required for Hedra
  audioFiles: audioFiles, // Required for voice creation
  systemPrompt: "You are a helpful assistant.",
});

// For RPM avatars (audio files only)
const rpmAvatar = await sdk.createAvatar({
  name: "My RPM Avatar",
  description: "Custom voice-only avatar",
  provider: "rpm",
  audioFiles: audioFiles, // Required for voice creation
  systemPrompt: "You are a knowledgeable expert.",
});

console.log("Avatar created with voice ID:", avatar.voiceId);
```

### File Requirements

- **Audio files**: Required for ALL avatars (voice creation via ElevenLabs)
  - Supported formats: MP3, WAV, M4A, AAC, OGG, FLAC
  - Up to 5 files, 25MB total limit
- **Image file**: Required only for Hedra avatars
  - Supported formats: JPEG, PNG, GIF, WebP
  - Used for avatar appearance

## Events

- `session.started` - Session connected
- `session.ended` - Session disconnected
- `avatar.response` - Text response from avatar
- `avatar.video` - Video track available (Hedra only)
- `avatar.audio` - Audio track available

## Manual Session Creation

If using your own API routes:

```typescript
// Create via your API
const sessionData = await fetch("/api/sessions", {
  method: "POST",
  body: JSON.stringify({ avatarId, userId }),
}).then((r) => r.json());

// Use session data directly
const sessionManager = new AvatarSessionManager(sessionData);
```

## API Reference

### SDK Methods

- `getAvatars()` → `Avatar[]`
- `getAvatar(id)` → `Avatar`
- `createSession(request)` → `AvatarSessionManager`
- `endSession(sessionId)` → `void`

### Session Manager

- `connect(videoEl?, audioEl?)` → Connect to LiveKit
- `sendMessage(text)` → Send message to avatar
- `disconnect()` → End session
- `on(event, handler)` → Listen for events

### Types

```typescript
interface Avatar {
  id: string;
  slug: string;
  name: string;
  provider: "rpm" | "hedra";
  // ... other fields
}
```

## License

MIT License

## Support

- [Website](https://tangent.ad)
- [Report Issues](https://github.com/tangentad/sdk/issues)
