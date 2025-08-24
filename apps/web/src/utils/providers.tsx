import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { PaletteMode } from '@mui/material';
import useDynamicTheme from './theme';

type ProviderProps = {
    children: ReactNode;
};

type ThemeContextType = {
    colorScheme: PaletteMode;
    setColorScheme: (mode: PaletteMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
};

const queryClient = new QueryClient();

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

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
                <ReactQueryDevtools initialIsOpen={false} />
                <ToastContainer theme={colorScheme} />
            </ThemeContext.Provider>
        </QueryClientProvider>
    );
};

export default Providers;
