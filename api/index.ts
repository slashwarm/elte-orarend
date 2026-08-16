// vercel turns files in this dir into functions, so this one serves /api
import app from '../apps/api/src/index.js';

// keep the single arg - vercel counts args to tell web handlers from (req, res) ones
export default function handler(request: Request): Response | Promise<Response> {
    return app.fetch(request);
}
