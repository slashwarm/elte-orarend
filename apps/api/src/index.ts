import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { load } from 'cheerio';
import { z } from 'zod';

const ModeSchema = z.enum(['subject', 'teacher', 'course']);
const RequestBodySchema = z.object({
    mode: ModeSchema,
    year: z.string().regex(/^\d{4}-\d{4}-\d{1}$/),
    name: z.union([
        z.string().min(1),
        z.array(z.string().min(1)).min(1).max(100)
    ])
});

type Mode = z.infer<typeof ModeSchema>;

const app = new Hono();

app.use(
    '*',
    cors({
        origin: '*',
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: ['*'],
        maxAge: 86400,
    })
);

const SEARCH_MODES: Record<Mode, string[]> = {
    subject: ['keresnevre', 'keres_kod_azon'],
    teacher: ['keres_okt', 'keres_oktnk'],
    course: ['keres_kod_azon'],
};

const CACHE = new Map<string, { data: string[][], timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchSearchData(searchMode: string, searchName: string, year: string): Promise<string[][]> {
    const baseUrl = 'https://tanrend.elte.hu/tanrendnavigation.php';
    const qs = new URLSearchParams({ 
        m: searchMode, 
        f: year, 
        k: searchName 
    });
    
    const cacheKey = `${searchMode}:${searchName}:${year}`;
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch(`${baseUrl}?${qs.toString()}`, { 
        signal: controller.signal,
        redirect: 'manual' 
    });

    clearTimeout(timeoutId);

    if (!resp.ok || resp.status !== 200) {
        return [];
    }

    const html = await resp.text();
    const $ = load(html);
    const data: string[][] = [];

    $('tbody tr').each((_, tr) => {
        const row: string[] = [];
        $(tr)
            .find('td')
            .each((__, td) => {
                row.push($(td).text().trim());
            });
        if (row.length) data.push(row);
    });

    CACHE.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

app.post('/api', async c => {
    try {
        const rawBody = await c.req.json().catch(() => null);
        if (!rawBody) {
            return c.json({ error: 'No body provided' }, 400);
        }

        const validationResult = RequestBodySchema.safeParse(rawBody);
        if (!validationResult.success) {
            return c.json({ 
                error: 'Validation failed', 
                details: validationResult.error.errors 
            }, 400);
        }

        const { mode, year, name } = validationResult.data;
        const names = Array.isArray(name) ? name : [name];
        const data: string[][] = [];
        const searchModes = SEARCH_MODES[mode];

        for (const searchMode of searchModes) {
            const nameTasks = names.map(searchName => 
                fetchSearchData(searchMode, searchName, year)
            );
            
            const nameResults = await Promise.allSettled(nameTasks);
            
            // ha van ebben a searchMode-ban találat akkor kihagyhatjuk a kövit
            let foundData = false;
            for (const result of nameResults) {
                if (result.status === 'fulfilled' && result.value.length > 0) {
                    data.push(...result.value);
                    foundData = true;
                }
            }
            
            if (foundData) break;
        }

        return c.json(data);
    } catch (error) {
        console.error('API error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

app.get('/', (c) => {
    return c.json({ status: 'ok', message: 'ELTE Órarend API is running 🚀' });
});

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    console.log(`🚀 Server starting on port ${port}...`);
    
    const { serve } = await import('@hono/node-server');
    serve({
        fetch: app.fetch,
        port: Number(port)
    });
    console.log(`✅ Server running at http://localhost:${port}`);
}

export default app;