import '../styles/Calendar.css';

import { EventClickArg } from '@fullcalendar/core';
import AddIcon from '@mui/icons-material/Add';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import LinkIcon from '@mui/icons-material/Link';
import { Badge, Box, Button, IconButton, Stack } from '@mui/material';
import type { Lesson } from '../utils/data';
import LessonCalendar from './LessonCalendar';
import { Redo, Undo } from '@mui/icons-material';

type OwnCalendarProps = {
    lessons: Lesson[]; // A megjelenítendő órák
    onUrlExport: () => void; // URL export kezelő
    onImageDownload: (ref: React.MutableRefObject<HTMLElement>) => Promise<void>; // Kép mentés kezelő
    onEventEdit: (id: number) => void; // Óra szerkesztés kezelő
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
};

const OwnCalendar: React.FC<OwnCalendarProps> = ({
    lessons,
    onUrlExport,
    onImageDownload,
    onEventEdit,
    canUndo,
    canRedo,
    undo,
    redo
}: OwnCalendarProps) => {
    const onEventClick = (eventInfo: EventClickArg) => onEventEdit(parseInt(eventInfo.event.id));

    return (
        <LessonCalendar
            lessons={lessons}
            onImageDownload={onImageDownload}
            onEventClick={onEventClick}
            showPopover={true}
            eventContent={(eventInfo) => {
                return (
                    <div className={`${eventInfo.event.extendedProps.type === 'gyakorlat' ? 'practice' : 'lecture'}`}>
                        <div className="fc-event-time">
                            <b>{eventInfo.timeText}</b>
                        </div>
                        <div className="fc-event-title-container">
                            <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
                        </div>
                    </div>
                );
            }}
            popoverActionIcon={() => <EditCalendarIcon fontSize="small" />}
            popoverActionText={() => 'Kattints a szerkesztéshez'}
        >
            
            <Button variant="outlined" startIcon={<LinkIcon />} onClick={onUrlExport} >
                Mentés hivatkozásként
            </Button>
            <Button
                variant="outlined"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => (onEventEdit ? onEventEdit(-1) : undefined)}
                sx={{ visibility: 'visible' }}
            >
                Saját kurzus hozzáadása
            </Button>
            <Stack
                direction="row"
                marginLeft="auto"
            >
                <IconButton
                    aria-label='Visszavonás'
                    color="success"
                    onClick={undo}
                    disabled={!canUndo}
                    sx={{marginRight: "auto"}}
                >
                    <Undo/>
                </IconButton>
                <IconButton
                    aria-label="Újra csinálás"
                    color="success"
                    onClick={redo}
                    disabled={!canRedo}
                >
                    <Redo/>
                </IconButton>
            </Stack>
        </LessonCalendar>
    );
};

export default OwnCalendar;
