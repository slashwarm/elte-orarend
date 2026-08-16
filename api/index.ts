// vercel turns files in this dir into functions, so this one serves /api
import app from '../apps/api/src/index.js';

// a default export function would be read as (req, res) and the Response thrown away.
// the { fetch } object is vercel's web-standard shape, one function for every method
export default {
    fetch(request: Request): Response | Promise<Response> {
        return app.fetch(request);
    },
};
