import '../styles/Calendar.css';

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LinkIcon from '@mui/icons-material/Link';
import { Badge, Button } from '@mui/material';
import type { Lesson } from '../utils/Data';
import LessonCalendar from './LessonCalendar';

type ViewOnlyCalendarProps = {
    lessons: Lesson[]; // A megjelenítendő órák
    onUrlExport: () => void; // URL export kezelő
    onImageDownload: (ref: React.MutableRefObject<HTMLElement>) => Promise<void>; // Kép mentés kezelő
};

const ViewOnlyCalendar: React.FC<ViewOnlyCalendarProps> = ({
    lessons,
    onUrlExport,
    onImageDownload,
}: ViewOnlyCalendarProps) => {
    // Más órarendjének mentése sajátként
    const handleTimetableSave = () => {
        const url = new URL(window.location.toString());
        url.searchParams.delete('lessons');

        window.location.href = url.toString();
        window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(lessons));
    };

    return (
        <LessonCalendar
            lessons={lessons}
            onImageDownload={onImageDownload}
            eventContent={(eventInfo) => {
                return (
                    <div
                        className={`view-only ${
                            eventInfo.event.extendedProps.type === 'gyakorlat' ? 'practice' : 'lecture'
                        }`}
                    >
                        <div className="fc-event-time">
                            <b>{eventInfo.timeText}</b>
                        </div>
                        <div className="fc-event-title-container">
                            <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
                        </div>
                    </div>
                );
            }}
        >
            <Badge badgeContent="ÚJ" color="secondary">
                <Button variant="outlined" startIcon={<LinkIcon />} onClick={onUrlExport} fullWidth>
                    Mentés hivatkozásként
                </Button>
            </Badge>

            <Button
                variant="outlined"
                color="success"
                startIcon={<BookmarkBorderIcon />}
                onClick={handleTimetableSave}
                sx={{ visibility: 'visible' }}
            >
                Beállítás saját órarendként
            </Button>
        </LessonCalendar>
    );
};

export default ViewOnlyCalendar;
