const SEARCH_MODES = ['keresnevre', 'keres_okt', 'keres_kod_azon', 'keres_oktnk'] as const;
const COURSE_CODE_PREFIXES = ['ip-', 'ik-', 'ikp-'] as const;
const INSTRUCTOR_CODE_LENGTH = 6;

/**
 * Determines the appropriate search mode based on query characteristics
 * @param query - The search query string
 * @returns Array with primary search mode first, followed by alternative modes
 */
export function getSearchMode(query: string): string[] {
    if (!query || typeof query !== 'string') {
        return [...SEARCH_MODES];
    }

    const trimmedQuery = query.trim().toLowerCase();
    const isSingleWord = trimmedQuery.split(/\s+/).length === 1;
    let mainSearchMode = 'keresnevre';

    if (
        isSingleWord &&
        (COURSE_CODE_PREFIXES.some((prefix) => trimmedQuery.startsWith(prefix)) ||
            trimmedQuery.endsWith('ga') ||
            trimmedQuery.endsWith('ea'))
    ) {
        mainSearchMode = 'keres_kod_azon';
    } else if (isSingleWord && trimmedQuery.length === INSTRUCTOR_CODE_LENGTH) {
        mainSearchMode = 'keres_oktnk';
    } else if (trimmedQuery.includes('dr.')) {
        mainSearchMode = 'keres_okt';
    }

    return [mainSearchMode, ...SEARCH_MODES.filter((mode) => mode !== mainSearchMode)];
}
