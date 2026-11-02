import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from './app.js';
import { config } from './config.js';
import { connectDb } from './db.js';

// Local / single-server mode. (On Vercel, api/index.js uses ./app.js directly.)
try { await connectDb(); } catch (e: any) {
  console.error(`\n[ERROR] Cannot connect to MongoDB: ${e.message}\n  -> Check MONGODB_URI in .env. Atlas: allow your IP under Network Access, check user/password.\n  -> Local MongoDB: make sure the MongoDB service is running.\n`);
  process.exit(1);
}

// Serve the built React app (npm run build) from this same server
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((_req, res) => void res.sendFile(path.join(dist, 'index.html')));
}
app.listen(config.port, () => console.log(`Applewood server running on http://localhost:${config.port}`));
