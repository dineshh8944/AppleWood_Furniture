import dotenv from 'dotenv';
import path from 'node:path';

// .env can live in the project root (recommended) or inside /server
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  dbName: process.env.MONGODB_DB || 'applewood',
  jwtSecret: process.env.JWT_SECRET || '',
  adminEmail: (process.env.ADMIN_EMAIL || 'madanmahesh02mmm@gmail.com').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '123jas456mineSMM',
  // Only needed if the website and the API are hosted on two different addresses (comma separated)
  clientUrls: (process.env.CLIENT_URL || '').split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean),
  isProd: process.env.NODE_ENV === 'production',
};
