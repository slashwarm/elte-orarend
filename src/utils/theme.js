import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { huHU } from '@mui/material/locale';

const useDynamicTheme = (colorScheme) => {
    return useMemo(
        () =>
            createTheme({
                palette: {
                    mode: colorScheme,
                },
                typography: {
                    button: {
                        fontSize: 14,
                        fontWeight: 600,
                    },
                },
                components: {
                    MuiGrid: {
                        styleOverrides: {
                            item: {
                                width: '100%',
                                maxWidth: '100vw !important',
                            },
                        },
                    },
                    MuiCssBaseline: {
                        styleOverrides: {
                            ':root': colorScheme === 'light' ? null : { '--fc-border-color': '#515151' },
                            '.fc thead': {
                                backgroundColor: colorScheme === 'light' ? '#F0F0F0' : '#121212',
                            },
                        },
                    },
                },
                huHU,
            }),
        [colorScheme],
    );
};

export default useDynamicTheme;
