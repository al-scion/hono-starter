import * as schema from "./schema";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

export const dbClient = (databaseURL: string) => {
  const sql = neon(databaseURL);
  return drizzle(sql, { schema });
}