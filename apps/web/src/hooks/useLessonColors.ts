import { useState, useEffect, useCallback } from 'react';

export const LESSON_TYPES = [
    { key: 'előadás', label: 'Előadás' },
    { key: 'gyakorlat', label: 'Gyakorlat' },
    { key: 'konzultáció', label: 'Konzultáció' },
    { key: 'szeminárium', label: 'Szeminárium' },
    { key: 'labor', label: 'Labor' },
    { key: 'vizsgakurzus', label: 'Vizsgakurzus' },
    { key: 'házidolgozat', label: 'Házidolgozat' },
    { key: 'szakmai gyakorlat', label: 'Szakmai gyakorlat' },
    { key: 'elfoglaltság', label: 'Elfoglaltság' },
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

const toCssVarName = (key: string): string => {
    return `--lesson-color-${key.replace(/\s+/g, '-').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ö/g, 'o').replace(/ő/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u').replace(/ű/g, 'u')}`;
};

export const getLessonTypeClass = (type: string): string => {
    return `lesson-${type.replace(/\s+/g, '-').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ö/g, 'o').replace(/ő/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u').replace(/ű/g, 'u')}`;
};

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
        
        LESSON_TYPES.forEach(({ key }) => {
            const cssVarName = toCssVarName(key);
            document.documentElement.style.setProperty(cssVarName, colors[key]);
        });
    }, [colors]);

    const setColor = useCallback((type: LessonTypeKey, color: string) => {
        setColors((prev) => ({ ...prev, [type]: color }));
    }, []);

    const resetColors = useCallback(() => {
        setColors(DEFAULT_COLORS);
    }, []);

    const isDefault = useCallback(() => {
        return LESSON_TYPES.every(({ key }) => colors[key] === DEFAULT_COLORS[key]);
    }, [colors]);

    return {
        colors,
        setColor,
        resetColors,
        isDefault,
        defaultColors: DEFAULT_COLORS,
        lessonTypes: LESSON_TYPES,
    };
};
