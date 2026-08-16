import '../styles/Calendar.css';

import { EventClickArg } from '@fullcalendar/core';
import AddIcon from '@mui/icons-material/Add';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { Button, IconButton, Stack } from '@mui/material';
import type { Lesson } from '../utils/data';
import LessonCalendar from './LessonCalendar';
import { Redo, Undo } from '@mui/icons-material';
import ColorPicker from '../components/ColorPicker';
import { getLessonTypeClass, LessonTypeKey } from '../hooks/useLessonColors';

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
            onUrlExport={onUrlExport}
            onEventClick={onEventClick}
            showPopover={true}
            toolbarEnd={
                <Stack direction="row">
                    <IconButton aria-label="Visszavonás" color="success" onClick={undo} disabled={!canUndo}>
                        <Undo />
                    </IconButton>
                    <IconButton aria-label="Újra csinálás" color="success" onClick={redo} disabled={!canRedo}>
                        <Redo />
                    </IconButton>
                </Stack>
            }
            eventContent={(eventInfo) => {
                return (
                    <div className={getLessonTypeClass(eventInfo.event.extendedProps.type as LessonTypeKey)}>
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
            <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => (onEventEdit ? onEventEdit(-1) : undefined)}
            >
                Saját kurzus hozzáadása
            </Button>
            <ColorPicker />
        </LessonCalendar>
    );
};

export default OwnCalendar;
