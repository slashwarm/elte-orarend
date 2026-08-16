import { Hono } from 'hono';
import { load } from 'cheerio';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getSearchMode } from './utils/getSearchMode.js';
import { getCacheControl, getMaxAge, mapWithConcurrency } from './utils/cache.js';

const YearSchema = z.string().regex(/^\d{4}-\d{4}-\d$/);
const NameSchema = z.union([z.string().min(1), z.array(z.string().min(1)).min(1).max(100)]);

const RequestBodySchema = z.object({
    year: YearSchema,
    name: NameSchema,
});

type SearchRequest = z.infer<typeof RequestBodySchema>;

const app = new Hono();

type CacheEntry = { data: string[][]; timestamp: number; ttl: number };

const CACHE = new Map<string, CacheEntry>();

// Az éppen futó kérések, hogy ugyanarra a kulcsra egyszerre csak egy menjen ki
const INFLIGHT = new Map<string, Promise<string[][]>>();

const UPSTREAM_CONCURRENCY = 6;
const UPSTREAM_TIMEOUT = 10000;
const MAX_CACHE_ENTRIES = 500;

function setCacheEntry(cacheKey: string, entry: CacheEntry): void {
    CACHE.set(cacheKey, entry);

    if (CACHE.size <= MAX_CACHE_ENTRIES) {
        return;
    }

    for (const [key, value] of CACHE) {
        if (CACHE.size <= MAX_CACHE_ENTRIES) {
            break;
        }
        if (key !== cacheKey && Date.now() - value.timestamp >= value.ttl) {
            CACHE.delete(key);
        }
    }

    for (const key of CACHE.keys()) {
        if (CACHE.size <= MAX_CACHE_ENTRIES) {
            break;
        }
        if (key !== cacheKey) {
            CACHE.delete(key); // a Map a beszúrás sorrendjét tartja, tehát a legrégebbi megy először
        }
    }
}

// Hiba esetén dob, hogy a hibás választ ne tegyük el
async function fetchFromUpstream(searchMode: string, searchName: string, year: string): Promise<string[][]> {
    const baseUrl = 'https://tanrend.elte.hu/tanrendnavigation.php';
    const qs = new URLSearchParams({
        m: searchMode,
        f: year,
        k: searchName,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

    let resp: Response;

    try {
        resp = await fetch(`${baseUrl}?${qs.toString()}`, {
            signal: controller.signal,
            redirect: 'manual',
        });
    } finally {
        clearTimeout(timeoutId);
    }

    if (resp.status !== 200) {
        throw new Error(`Upstream responded with ${resp.status}`);
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

    return data;
}

// A memóriacache példányonként él (Vercel), a globális védelmet a válasz CDN fejléce adja
async function fetchSearchData(searchMode: string, searchName: string, year: string): Promise<string[][]> {
    const cacheKey = `${searchMode}:${searchName}:${year}`;
    const cached = CACHE.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
    }

    const running = INFLIGHT.get(cacheKey);

    if (running) {
        return running;
    }

    const task = fetchFromUpstream(searchMode, searchName, year)
        .then((data) => {
            setCacheEntry(cacheKey, {
                data,
                timestamp: Date.now(),
                ttl: getMaxAge(year, data.length === 0) * 1000,
            });
            return data;
        })
        .finally(() => {
            INFLIGHT.delete(cacheKey);
        });

    INFLIGHT.set(cacheKey, task);

    return task;
}

// A `complete` hamis, ha bármelyik részlekérdezés elszállt - a hiányos választ nem szabad cache-elni
async function getTimetable({ year, name }: SearchRequest): Promise<{ data: string[][]; complete: boolean }> {
    const isListSearch = Array.isArray(name);
    const names = [...new Set(isListSearch ? name : [name])]; // duplikált kód nem indít új kérést
    const searchModes = isListSearch ? ['keres_kod_azon'] : getSearchMode(name);
    const data: string[][] = [];
    let complete = true;

    for (const searchMode of searchModes) {
        const nameResults = await mapWithConcurrency(names, UPSTREAM_CONCURRENCY, (searchName) =>
            fetchSearchData(searchMode, searchName, year),
        );

        // ha van ebben a searchMode-ban találat akkor kihagyhatjuk a kövit
        let foundData = false;

        for (const result of nameResults) {
            if (result.status === 'rejected') {
                complete = false;
                continue;
            }

            if (result.value.length > 0) {
                data.push(...result.value);
                foundData = true;
            }
        }

        if (foundData) break;
    }

    return { data, complete };
}

// Cache-elhető keresés: `?year=2025-2026-1&name=Analízis` vagy `?year=2025-2026-1&code=IP-18KVSZG&code=IP-18AB1EG`
app.get('/api', async (c) => {
    const year = c.req.query('year');
    const codes = c.req.queries('code');
    const name = c.req.query('name');

    if (!year && !codes && !name) {
        return c.json({ status: 'ok', message: 'ELTE Órarend API is running 🚀' });
    }

    // rendezve és duplikáció nélkül, hogy ugyanaz a keresés ugyanazt a cache kulcsot kapja
    const query = codes?.length ? [...new Set(codes)].sort() : name;
    const parsed = RequestBodySchema.safeParse({ year, name: query });

    if (!parsed.success) {
        c.header('Cache-Control', 'no-store');
        return c.json({ error: 'Invalid query' }, 400);
    }

    try {
        const { data, complete } = await getTimetable(parsed.data);

        c.header(
            'Cache-Control',
            complete ? getCacheControl(getMaxAge(parsed.data.year, data.length === 0)) : 'no-store',
        );

        return c.json(data);
    } catch (error) {
        console.error('API error:', error);
        c.header('Cache-Control', 'no-store');
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// Régi hívók miatt marad. POST-ot a CDN nem tud cache-elni, tehát a GET az olcsóbb út.
app.post('/api', zValidator('json', RequestBodySchema), async (c) => {
    try {
        const { data } = await getTimetable(c.req.valid('json'));

        return c.json(data);
    } catch (error) {
        console.error('API error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export default app;
