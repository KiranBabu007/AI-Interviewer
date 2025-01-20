import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  schema: './utils/schema.ts',
  out: './utils/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres.pnrksftpwmsiosbveyda:XContactus123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
  }
});