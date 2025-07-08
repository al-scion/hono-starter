import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export const dbClient = (databaseURL: string) => {
  const sql = neon(databaseURL);
  return drizzle(sql, { schema });
};
