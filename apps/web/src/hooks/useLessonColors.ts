import { useState, useEffect, useCallback } from 'react';

export const LESSON_TYPES = [
    { key: 'előadás', label: 'Előadás', cssVar: '--lesson-color-eloadas', className: 'lesson-eloadas' },
    { key: 'gyakorlat', label: 'Gyakorlat', cssVar: '--lesson-color-gyakorlat', className: 'lesson-gyakorlat' },
    { key: 'konzultáció', label: 'Konzultáció', cssVar: '--lesson-color-konzultacio', className: 'lesson-konzultacio' },
    { key: 'szeminárium', label: 'Szeminárium', cssVar: '--lesson-color-szeminarium', className: 'lesson-szeminarium' },
    { key: 'labor', label: 'Labor', cssVar: '--lesson-color-labor', className: 'lesson-labor' },
    { key: 'vizsgakurzus', label: 'Vizsgakurzus', cssVar: '--lesson-color-vizsgakurzus', className: 'lesson-vizsgakurzus' },
    { key: 'házidolgozat', label: 'Házidolgozat', cssVar: '--lesson-color-hazidolgozat', className: 'lesson-hazidolgozat' },
    { key: 'szakmai gyakorlat', label: 'Szakmai gyakorlat', cssVar: '--lesson-color-szakmai-gyakorlat', className: 'lesson-szakmai-gyakorlat' },
    { key: 'elfoglaltság', label: 'Elfoglaltság', cssVar: '--lesson-color-elfoglaltsag', className: 'lesson-elfoglaltsag' },
] as const;

export type LessonTypeKey = (typeof LESSON_TYPES)[number]['key'];

export type LessonColors = Record<LessonTypeKey, string>;

const DEFAULT_COLORS: LessonColors = {
    'előadás': '#4c77c7',
    'gyakorlat': '#634fc7',
    'konzultáció': '#2e7d32',
    'szeminárium': '#ed6c02',
    'labor': '#d32f2f',
    'vizsgakurzus': '#9c27b0',
    'házidolgozat': '#0288d1',
    'szakmai gyakorlat': '#00695c',
    'elfoglaltság': '#616161',
};

const STORAGE_KEY = 'LESSON_COLORS';

const LESSON_TYPE_MAP = new Map(LESSON_TYPES.map((t) => [t.key, t]));

export const getLessonTypeClass = (type: LessonTypeKey): string => {
    return LESSON_TYPE_MAP.get(type)!.className;
};

export { LESSON_TYPE_MAP };

export const useLessonColors = () => {
    const [colors, setColors] = useState<LessonColors>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as Partial<LessonColors>;
                return { ...DEFAULT_COLORS, ...parsed };
            } catch {
                return DEFAULT_COLORS;
            }
        }
        return DEFAULT_COLORS;
    });

    useEffect(() => {
        LESSON_TYPES.forEach(({ key, cssVar }) => {
            document.documentElement.style.setProperty(cssVar, colors[key]);
        });
    }, [colors]);

    const setColor = useCallback((type: LessonTypeKey, color: string) => {
        setColors((prev) => {
            const newColors = { ...prev, [type]: color };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
            return newColors;
        });
    }, []);

    const setAllColors = useCallback((newColors: LessonColors) => {
        setColors(newColors);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
    }, []);

    const resetColors = useCallback(() => {
        setColors(DEFAULT_COLORS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COLORS));
    }, []);

    const isDefault = useCallback(() => {
        return LESSON_TYPES.every(({ key }) => colors[key] === DEFAULT_COLORS[key]);
    }, [colors]);

    return {
        colors,
        setColor,
        setColors: setAllColors,
        resetColors,
        isDefault,
        defaultColors: DEFAULT_COLORS,
        lessonTypes: LESSON_TYPES,
    };
};