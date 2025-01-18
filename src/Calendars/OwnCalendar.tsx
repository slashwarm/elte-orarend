import '../styles/Calendar.css';

import { EventClickArg } from '@fullcalendar/core';
import AddIcon from '@mui/icons-material/Add';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import LinkIcon from '@mui/icons-material/Link';
import { Badge, Button } from '@mui/material';
import type { Lesson } from '../utils/Data';
import LessonCalendar from './LessonCalendar';

type OwnCalendarProps = {
    lessons: Lesson[], // A megjelenítendő órák
    onUrlExport: () => void, // URL export kezelő
    onImageDownload: (ref:React.MutableRefObject<HTMLElement>) => Promise<void>, // Kép mentés kezelő
    onEventEdit: (id:number) => void // Óra szerkesztés kezelő
}

const OwnCalendar: React.FC<OwnCalendarProps> = ({
    lessons,
    onUrlExport,
    onImageDownload,
    onEventEdit
}:OwnCalendarProps) => {
    const onEventClick = (eventInfo:EventClickArg) => onEventEdit(parseInt(eventInfo.event.id));

    return (
        <LessonCalendar 
            lessons={lessons} 
            onImageDownload={onImageDownload}
            onEventClick={onEventClick}
            showPopover={true}
            eventContent={(eventInfo) => {
                return (<div
                    className={`${
                        eventInfo.event.extendedProps.type === 'gyakorlat' ? 'practice' : 'lecture'
                    }`}
                >
                    <div className="fc-event-time">
                        <b>{eventInfo.timeText}</b>
                    </div>
                    <div className="fc-event-title-container">
                        <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
                    </div>
                </div>)
            }}
            popoverActionIcon={(_) => <EditCalendarIcon fontSize="small" />}
            popoverActionText={(_) => 'Kattints a szerkesztéshez'}
            >

                <Badge badgeContent="ÚJ" color="secondary">
                    <Button variant="outlined" startIcon={<LinkIcon />} onClick={onUrlExport} fullWidth>
                        Mentés hivatkozásként
                    </Button>
                </Badge>

                <Button
                    variant="outlined"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => onEventEdit ? onEventEdit(-1) : undefined}
                    sx={{ visibility: 'visible' }}
                >
                    Saját kurzus hozzáadása
                </Button>

        </LessonCalendar>
    );
};

export default OwnCalendar;
