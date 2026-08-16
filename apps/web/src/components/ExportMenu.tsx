import React, { useState } from 'react';
import EventIcon from '@mui/icons-material/Event';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GoogleIcon from '@mui/icons-material/Google';
import ImageIcon from '@mui/icons-material/Image';
import IosShareIcon from '@mui/icons-material/IosShare';
import LinkIcon from '@mui/icons-material/Link';
import { Divider, ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import type { Lesson } from '../utils/data';
import { handleGoogleCalendarExport, handleIcsExport } from '../utils/calendarExport';

type ExportMenuProps = {
    lessons: Lesson[]; // A naptárba exportálandó órák
    onImageDownload?: () => void; // Kép mentés indítása, ha nincs megadva nincs kép opció
    onUrlExport?: () => void; // Hivatkozás másolása, ha nincs megadva nincs hivatkozás opció
};

/**
 * Egyetlen menübe fogja az órarend mentési és megosztási lehetőségeit,
 * hogy ne külön gombként sorakozzanak a naptár mellett
 *
 * @param {ExportMenuProps} props
 */
const ExportMenu: React.FC<ExportMenuProps> = ({ lessons, onImageDownload, onUrlExport }: ExportMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isOpen = Boolean(anchorEl);

    const handleClose = () => setAnchorEl(null);

    // Minden menüpont bezárja a menüt, mielőtt elindítja a saját műveletét
    const runAndClose = (action: () => void) => () => {
        handleClose();
        action();
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<IosShareIcon />}
                endIcon={<ExpandMoreIcon />}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                aria-label="Órarend mentése és megosztása"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? 'export-menu' : undefined}
            >
                Mentés és megosztás
            </Button>

            <Menu
                id="export-menu"
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                slotProps={{ paper: { sx: { minWidth: 290 } } }}
            >
                <ListSubheader sx={{ lineHeight: '2.5rem' }}>Naptárba</ListSubheader>

                <MenuItem onClick={runAndClose(() => handleGoogleCalendarExport(lessons))}>
                    <ListItemIcon>
                        <GoogleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Google Naptár" secondary="Letöltés után importálás" />
                </MenuItem>

                <MenuItem onClick={runAndClose(() => handleIcsExport(lessons))}>
                    <ListItemIcon>
                        <EventIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="iCalendar fájl (.ics)" secondary="Apple Naptár, Outlook, Thunderbird" />
                </MenuItem>

                {(onImageDownload || onUrlExport) && <Divider />}
                {(onImageDownload || onUrlExport) && (
                    <ListSubheader sx={{ lineHeight: '2.5rem' }}>Egyéb</ListSubheader>
                )}

                {onUrlExport && (
                    <MenuItem onClick={runAndClose(onUrlExport)}>
                        <ListItemIcon>
                            <LinkIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Hivatkozás másolása" secondary="Megosztható link a vágólapra" />
                    </MenuItem>
                )}

                {onImageDownload && (
                    <MenuItem onClick={runAndClose(onImageDownload)}>
                        <ListItemIcon>
                            <ImageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Mentés képként" secondary="PNG kép az órarendről" />
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

export default ExportMenu;
