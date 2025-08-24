import { PaletteMode } from '@mui/material';
import { huHU } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';
import { useMemo } from 'react';

const useDynamicTheme = (colorScheme: PaletteMode) => {
    return useMemo(
        () =>
            createTheme(
                {
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
                },
                huHU,
            ),
        [colorScheme],
    );
};

export default useDynamicTheme;
