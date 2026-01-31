import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Stack,
    Grid,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import RestoreIcon from '@mui/icons-material/Restore';
import { useLessonColors, LessonTypeKey } from '../hooks/useLessonColors';

const ColorPicker: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { colors, setColor, resetColors, isDefault, lessonTypes } = useLessonColors();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<PaletteIcon />}
                onClick={handleOpen}
                color="secondary"
            >
                Színek testreszabása
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Óratípusok színei</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {lessonTypes.map(({ key, label }) => (
                            <Grid item xs={12} sm={6} key={key}>
                                <Typography variant="subtitle2" gutterBottom>
                                    {label}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <input
                                        type="color"
                                        value={colors[key]}
                                        onChange={(e) => setColor(key, e.target.value)}
                                        style={{
                                            width: 50,
                                            height: 36,
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            padding: 0,
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            flex: 1,
                                            height: 36,
                                            backgroundColor: colors[key],
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        {label}
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                    <Button
                        startIcon={<RestoreIcon />}
                        onClick={resetColors}
                        color="inherit"
                        disabled={isDefault()}
                    >
                        Alapértelmezett
                    </Button>
                    <Button onClick={handleClose} variant="contained">
                        Bezárás
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ColorPicker;
