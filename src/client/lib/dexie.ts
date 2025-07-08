import type { UIMessage } from '@ai-sdk/react';
import DexieDb, { type Table } from 'dexie';

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
}

export interface Message extends UIMessage {
  chatId: string;
}

export class Database extends DexieDb {
  chats!: Table<Chat>;
  messages!: Table<Message>;
  constructor() {
    super('app_database');
    this.version(1).stores({
      chats: 'id, title, messages, createdAt',
      messages: 'id, chatId, role, parts',
    });
  }
}

export const db = new Database();
