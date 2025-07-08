import { DefaultChatTransport } from 'ai';
// import { defaultChatStore } from 'ai';

// Create a chat transport for AI SDK 5 Alpha
export const chatTransport = new DefaultChatTransport({
  api: '/api/chat/stream',
});

// export const chatStore = defaultChatStore({
//   api: '/api/chat/stream',
// });
