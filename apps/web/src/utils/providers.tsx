import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider, removeOldestQuery } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { PaletteMode } from '@mui/material';
import useDynamicTheme from './theme';
import { TimetableProvider } from '../contexts';
import { useTimetableStorage, useLessonColors } from '../hooks';

type ProviderProps = {
    children: ReactNode;
};

type ThemeContextType = {
    colorScheme: PaletteMode;
    setColorScheme: (mode: PaletteMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
};

const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 óra

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 45, // 45 perc
            gcTime: CACHE_MAX_AGE, // legalább akkora, mint a staleTime, különben feleslegesen kérdezünk újra
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
        },
    },
});

// Az újratöltés így nem indít új lekérdezést a tanrend.elte.hu felé
const persister = createAsyncStoragePersister({
    storage: window.localStorage,
    key: 'elte-orarend-query-cache',
    retry: removeOldestQuery, // ha megtelne a localStorage, a legrégebbi keresés esik ki
});

const Providers: React.FC<ProviderProps> = ({ children }: ProviderProps) => {
    const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
    const getSavedTheme = (): PaletteMode =>
        (localStorage.getItem('theme') as PaletteMode) ?? (themePreference.matches ? 'dark' : 'light');

    const [colorScheme, setColorScheme] = useState<PaletteMode>(getSavedTheme);

    useEffect(() => {
        const themePreferenceListener = (event: MediaQueryListEvent) =>
            setColorScheme(event.matches ? 'dark' : 'light');
        themePreference.addEventListener('change', themePreferenceListener);

        return () => {
            themePreference.removeEventListener('change', themePreferenceListener);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', colorScheme);
    }, [colorScheme]);

    const theme = useDynamicTheme(colorScheme);
    const { timetable } = useTimetableStorage();

    useLessonColors();

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: CACHE_MAX_AGE }}>
            <TimetableProvider initialLessons={timetable}>
                <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
                    <ThemeProvider theme={theme}>{children}</ThemeProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                    <ToastContainer theme={colorScheme} />
                </ThemeContext.Provider>
            </TimetableProvider>
        </PersistQueryClientProvider>
    );
};

export default Providers;
