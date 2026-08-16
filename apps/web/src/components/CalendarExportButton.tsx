import React, { useState } from 'react';
import EventIcon from '@mui/icons-material/Event';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import type { Lesson } from '../utils/data';
import { handleGoogleCalendarExport, handleIcsExport } from '../utils/calendarExport';

type CalendarExportButtonProps = {
    lessons: Lesson[]; // Az exportálandó órák
};

/**
 * Gomb az órarend naptárba exportálásához (.ics fájl vagy Google Naptár)
 *
 * @param {CalendarExportButtonProps} props
 */
const CalendarExportButton: React.FC<CalendarExportButtonProps> = ({ lessons }: CalendarExportButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isOpen = Boolean(anchorEl);

    const handleClose = () => setAnchorEl(null);

    const handleIcsClick = () => {
        handleClose();
        handleIcsExport(lessons);
    };

    const handleGoogleClick = () => {
        handleClose();
        handleGoogleCalendarExport(lessons);
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<EventIcon />}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                aria-label="Órarend exportálása naptárba"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? 'calendar-export-menu' : undefined}
            >
                Naptárba exportálás
            </Button>

            <Menu id="calendar-export-menu" anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
                <MenuItem onClick={handleGoogleClick}>
                    <ListItemIcon>
                        <GoogleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Google Naptár"
                        secondary="Letölti a fájlt és megnyitja az importálást"
                    />
                </MenuItem>
                <MenuItem onClick={handleIcsClick}>
                    <ListItemIcon>
                        <FileDownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="iCalendar fájl (.ics)"
                        secondary="Apple Naptár, Outlook, Thunderbird"
                    />
                </MenuItem>
            </Menu>
        </>
    );
};

export default CalendarExportButton;
