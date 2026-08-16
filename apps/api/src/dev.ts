// local only - on vercel the app is mounted by api/index.ts in the repo root
import { serve } from '@hono/node-server';
import app from './index.js';

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port });

console.log(`✅ API running at http://localhost:${port}/api`);
