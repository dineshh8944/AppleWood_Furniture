// Emergency reset:  npm run reset-admin -w server
// Sets the dashboard owner email + password from .env (ADMIN_EMAIL / ADMIN_PASSWORD). No data is deleted.
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { cols, connectDb, nextId } from './db.js';

await connectDb();
const owner = await cols.admins().findOne({});
const passwordHash = bcrypt.hashSync(config.adminPassword, 10);
if (owner) await cols.admins().updateOne({ _id: owner._id }, { $set: { email: config.adminEmail, passwordHash, seededPassword: true } });
else await cols.admins().insertOne({ _id: await nextId('admins'), email: config.adminEmail, passwordHash, seededPassword: true, createdAt: new Date().toISOString() });
console.log(`Owner login reset. Email: ${config.adminEmail}  Password: (the ADMIN_PASSWORD value in .env)`);
process.exit(0);
