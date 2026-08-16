import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Grid } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';
import { useLessonColors, LessonTypeKey, LessonColors, LESSON_TYPES, LESSON_TYPE_MAP } from '../hooks/useLessonColors';
import { SPACING } from '../utils/spacing';

const ColorPicker: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { colors, setColors, lessonTypes, defaultColors } = useLessonColors();

    const [localColors, setLocalColors] = useState<LessonColors>(colors);

    const pendingUpdate = useRef<{ key: LessonTypeKey; value: string } | null>(null);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        if (open) {
            setLocalColors(colors);
            LESSON_TYPES.forEach(({ key, cssVar }) => {
                document.documentElement.style.setProperty(cssVar, colors[key]);
            });
        }
    }, [open, colors]);

    useEffect(() => {
        return () => {
            if (rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    const handleColorChange = (key: LessonTypeKey, value: string) => {
        pendingUpdate.current = { key, value };

        rafId.current ??= requestAnimationFrame(() => {
            if (pendingUpdate.current) {
                const { key: updateKey, value: updateValue } = pendingUpdate.current;

                setLocalColors((prev) => ({ ...prev, [updateKey]: updateValue }));

                const lessonType = LESSON_TYPE_MAP.get(updateKey);
                if (lessonType) {
                    document.documentElement.style.setProperty(lessonType.cssVar, updateValue);
                }

                pendingUpdate.current = null;
            }
            rafId.current = null;
        });
    };

    const handleSave = () => {
        setColors(localColors);
        setOpen(false);
    };

    const handleReset = () => {
        setLocalColors(defaultColors);

        LESSON_TYPES.forEach(({ key, cssVar }) => {
            document.documentElement.style.setProperty(cssVar, defaultColors[key]);
        });
    };

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        LESSON_TYPES.forEach(({ key, cssVar }) => {
            document.documentElement.style.setProperty(cssVar, colors[key]);
        });
        setOpen(false);
    };

    const hasChanges = lessonTypes.some(({ key }) => localColors[key] !== colors[key]);

    return (
        <>
            <Button variant="outlined" startIcon={<PaletteIcon />} onClick={handleOpen} color="secondary">
                Színek testreszabása
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Óratípusok színei</DialogTitle>
                <DialogContent>
                    <Grid container spacing={SPACING.base} sx={{ mt: SPACING.tight }}>
                        {lessonTypes.map(({ key, label }) => (
                            <Grid
                                key={key}
                                size={{
                                    xs: 12,
                                    sm: 6,
                                }}
                            >
                                <Typography variant="subtitle2" gutterBottom>
                                    {label}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.tight }}>
                                    <input
                                        type="color"
                                        value={localColors[key]}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
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
                                            backgroundColor: localColors[key],
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
                <DialogActions sx={{ justifyContent: 'space-between', px: SPACING.loose, pb: SPACING.base }}>
                    <Button
                        startIcon={<RestoreIcon />}
                        onClick={handleReset}
                        color="inherit"
                        disabled={lessonTypes.every(({ key }) => localColors[key] === defaultColors[key])}
                    >
                        Alapértelmezett
                    </Button>
                    <Box sx={{ display: 'flex', gap: SPACING.tight }}>
                        <Button onClick={handleClose} color="inherit">
                            Mégse
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={!hasChanges}
                        >
                            Mentés
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ColorPicker;
