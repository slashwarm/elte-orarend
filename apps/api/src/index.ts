import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { load } from 'cheerio';
import { z } from 'zod';

const ModeSchema = z.enum(['subject', 'teacher', 'course']);
const RequestBodySchema = z.object({
    mode: ModeSchema,
    year: z.union([z.string(), z.number()]).transform(val => String(val)),
    name: z.union([
        z.string().min(1),
        z.array(z.string().min(1)).min(1).max(20)
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

async function fetchSearchData(searchMode: string, searchName: string, year: string): Promise<string[][]> {
    const baseUrl = 'https://tanrend.elte.hu/tanrendnavigation.php';
    const qs = new URLSearchParams({ 
        m: searchMode, 
        f: year, 
        k: searchName 
    });
    
    const resp = await fetch(`${baseUrl}?${qs.toString()}`, { 
        redirect: 'manual' 
    });

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

    return data;
}

app.post('/api', async c => {
    try {
        const rawBody = await c.req.json().catch(() => null);
        if (!rawBody) {
            return c.json({ error: 'Hibás paraméterek' }, 400);
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
            
            let foundData = false;
            for (const result of nameResults) {
                if (result.status === 'fulfilled' && result.value.length > 0) {
                    data.push(...result.value);
                    foundData = true;
                }
            }
            
            if (foundData) break;
        }

        c.header('Content-Type', 'application/json; charset=utf-8');
        return c.body(JSON.stringify(data));
    } catch (error) {
        console.error('API error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export default app;