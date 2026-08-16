const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const LIVE_MAX_AGE = 15 * MINUTE;
export const ARCHIVE_MAX_AGE = 24 * HOUR;

// Lehet, hogy a tárgyat csak most hirdették meg, ezért az üres találatot rövidebb ideig tartjuk
export const EMPTY_MAX_AGE = 5 * MINUTE;

const getCurrentSemester = (now: Date): string => {
    const year = now.getFullYear();

    return now.getMonth() < 6 ? `${year - 1}-${year}-2` : `${year}-${year + 1}-1`;
};

/** "2025-2026-1" -> 20251 */
const toSortableSemester = (semester: string): number => {
    const [startYear, , half] = semester.split('-');
    return Number(startYear) * 10 + Number(half);
};

export const getMaxAge = (year: string, isEmpty: boolean, now: Date = new Date()): number => {
    if (isEmpty) {
        return EMPTY_MAX_AGE;
    }

    const isArchived = toSortableSemester(year) < toSortableSemester(getCurrentSemester(now));

    return isArchived ? ARCHIVE_MAX_AGE : LIVE_MAX_AGE;
};

/**
 * Az upstream nem küld ETag-et vagy Last-Modified-ot, tehát olcsó feltételes kérés nincs.
 * A `stale-while-revalidate` viszont azonnal válaszol, és a háttérben frissít.
 */
export const getCacheControl = (maxAge: number): string =>
    `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=${7 * 24 * HOUR}`;

// Egy 100 elemű kurzuslista se indítson 100 egyidejű kérést az upstream felé
export const mapWithConcurrency = async <T, R>(
    items: T[],
    limit: number,
    task: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> => {
    const results: PromiseSettledResult<R>[] = new Array(items.length);
    let cursor = 0;

    const worker = async () => {
        for (let index = cursor++; index < items.length; index = cursor++) {
            try {
                results[index] = { status: 'fulfilled', value: await task(items[index]) };
            } catch (reason) {
                results[index] = { status: 'rejected', reason };
            }
        }
    };

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));

    return results;
};
