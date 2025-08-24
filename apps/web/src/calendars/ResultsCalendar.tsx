import { useMemo, useState } from 'react';
import '../styles/Calendar.css';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { Button } from '@mui/material';
import { type Lesson } from '../utils/data';
import LessonCalendar from './LessonCalendar';

type ResultsCalendarProps = {
    lessonsResults: Lesson[]; // A keresési eredmények órái
    ownLessons: Lesson[]; // A saját órák
    onEventClick: (id: number, own: boolean) => void; // Az órák kattintását lekezelő függvény
};

const ResultsCalendar: React.FC<ResultsCalendarProps> = ({
    lessonsResults,
    ownLessons,
    onEventClick,
}: ResultsCalendarProps) => {
    const isEventInSaved = (id: number) => ownLessons.some((lesson) => lesson.id === id);

    const [showOwnSubjects, setShowOwnSubjects] = useState<boolean>(false);
    const filteredTable = useMemo<Lesson[]>(
        () =>
            showOwnSubjects
                ? [
                      ...lessonsResults,
                      ...ownLessons.filter((lesson) => !lessonsResults.some((lessonRes) => lessonRes.id === lesson.id)),
                  ]
                : lessonsResults,
        [lessonsResults, showOwnSubjects, ownLessons],
    );

    return (
        <LessonCalendar
            lessons={filteredTable}
            showPopover={true}
            onEventClick={(eventInfo) => onEventClick(parseInt(eventInfo.event.id), false)}
            eventContent={(eventInfo) => {
                return (
                    <div
                        className={`${eventInfo.event.extendedProps.type === 'gyakorlat' ? 'practice' : 'lecture'}`}
                        style={{
                            opacity: isEventInSaved(parseInt(eventInfo.event.id)) ? 0.6 : 1,
                            backgroundColor: isEventInSaved(parseInt(eventInfo.event.id)) ? 'gray' : '',
                        }}
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
            popoverActionIcon={(id: number) =>
                isEventInSaved(id) ? <EventBusyIcon fontSize="small" /> : <EventAvailableIcon fontSize="small" />
            }
            popoverActionText={(id: number) =>
                isEventInSaved(id) ? 'Kattints az órarendből törléshez' : 'Kattints az órarendbe adáshoz'
            }
        >
            <Button
                variant="outlined"
                startIcon={showOwnSubjects ? <VisibilityOff /> : <Visibility />}
                onClick={() => setShowOwnSubjects(!showOwnSubjects)}
            >
                {showOwnSubjects ? 'Saját tárgyak elrejtése' : 'Saját tárgyak mutatása'}
            </Button>
        </LessonCalendar>
    );
};

export default ResultsCalendar;
