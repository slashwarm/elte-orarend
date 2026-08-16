import { Analytics } from '@vercel/analytics/react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import Footer from './components/Footer';
import { SPACING } from './utils/spacing';
import TimetableLayout from './components/TimetableLayout';
import { useTimetableStorage } from './hooks';

const App: React.FC = () => {
    const { viewOnly } = useTimetableStorage();

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
            }}
        >
            <CssBaseline />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                        position: 'absolute',
                        left: '-10000px',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                    }}
                >
                    ELTE Órarendtervező
                </Typography>

                <TimetableLayout viewOnly={viewOnly} />

                <Box component="footer" sx={{ p: SPACING.base }}>
                    <Footer />
                </Box>
            </Box>

            <Analytics />
        </Box>
    );
};

export default App;
