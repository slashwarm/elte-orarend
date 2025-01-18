import huLocale from '@fullcalendar/core/locales/hu';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DownloadIcon from '@mui/icons-material/Download';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import LinkIcon from '@mui/icons-material/Link';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import './styles/Calendar.css';
import { convertDataToCalendar } from './utils/Data';

import { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import type { CalendarEvent, Lesson } from './utils/Data';

type CalendarProps = {
    tableData: CalendarEvent[],
    onCalendarClick: (id:number, own:boolean) => void,
    onEventEdit?: (id:number) => void,
    onImageDownload?: (ref:React.MutableRefObject<HTMLElement>) => Promise<void>,
    onURLExport?: () => Promise<void>,
    savedLessons: Lesson[],
    own: boolean,
    viewOnly?: boolean,
}

const Calendar: React.FC<CalendarProps> = ({
    tableData,
    onCalendarClick,
    onEventEdit,
    onImageDownload,
    onURLExport,
    savedLessons,
    own,
    viewOnly,
}:CalendarProps) => {
    // popover
    const [popoverInfo, setPopoverInfo] = useState<{anchorEl:EventTarget | null, event:EventContentArg | null}>({
        anchorEl: null,
        event: null,
    });

    const [showOwnSubjects, setShowOwnSubjects] = useState<boolean>(false);
    const filteredTable = useMemo<CalendarEvent[]>(
        () => (showOwnSubjects ? [...tableData, ...convertDataToCalendar(savedLessons)] : tableData),
        [tableData, showOwnSubjects, savedLessons],
    );

    const handlePopoverOpen = (event:React.MouseEvent<HTMLElement, MouseEvent>, eventInfo:EventContentArg) => {
        // console.log({event, eventInfo});
        setPopoverInfo({ anchorEl: event.currentTarget, event: eventInfo });
    };

    const handlePopoverClose = () => {
        setPopoverInfo({ anchorEl: null, event: null });
    };

    // képként való mentés
    const [isCalendarSaving, setCalendarSaving] = useState<boolean>(false);
    const printRef = useRef<HTMLDivElement>(null!);

    const handlePrintClick = () => {
        setCalendarSaving(true);
    };

    useEffect(() => {
        const handleImageDownload = async () => {
            if (onImageDownload){
                await onImageDownload(printRef);
                setCalendarSaving(false);
            }
        };

        if (isCalendarSaving) {
            void handleImageDownload();
        }
    }, [isCalendarSaving, onImageDownload]);

    // URL export
    const handleURLCopy = async () => {
        if (onURLExport){
            await onURLExport();
        }
        
    };

    // Más órarendjének mentése sajátként
    const handleTimetableSave = () => {
        const url = new URL(window.location.toString());
        url.searchParams.delete('lessons');

        window.location.href = url.toString();
        window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(savedLessons));
    };
    // egyéb
    const isPopoverOpen = Boolean(popoverInfo.anchorEl);

    const onEventClick = (eventInfo:EventClickArg) => {
        if (viewOnly) {
            return;
        }

        handlePopoverClose();

        if (own) {
            if (onEventEdit){
                return onEventEdit(parseInt(eventInfo.event.id));
            }
        } else {
            return onCalendarClick(parseInt(eventInfo.event.id), own);
        }
    };

    const isEventInSaved = (eventId:string) => {
        return savedLessons.some((lesson) => lesson.id === parseInt(eventId));
    };

    return (
        <>
            {own && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} marginBottom={2}>
                    <Button variant="outlined" startIcon={<DownloadIcon/>} onClick={handlePrintClick}>
                        Mentés képként
                    </Button>

                    <Badge badgeContent="ÚJ" color="secondary">
                        <Button variant="outlined" startIcon={<LinkIcon />} onClick={handleURLCopy} fullWidth>
                            Mentés hivatkozásként
                        </Button>
                    </Badge>

                    {!viewOnly && (
                        <Button
                            variant="outlined"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={() => onEventEdit ? onEventEdit(-1) : undefined}
                            sx={{ visibility: 'visible' }}
                        >
                            Saját kurzus hozzáadása
                        </Button>
                    )}

                    {viewOnly && (
                        <Button
                            variant="outlined"
                            color="success"
                            startIcon={<BookmarkBorderIcon />}
                            onClick={handleTimetableSave}
                            sx={{ visibility: 'visible' }}
                        >
                            Beállítás saját órarendként
                        </Button>
                    )}
                </Stack>
            )}

            {!own && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} marginBottom={2}>
                    <Button
                        variant="outlined"
                        startIcon={showOwnSubjects ? <VisibilityOff /> : <Visibility />}
                        onClick={() => setShowOwnSubjects(!showOwnSubjects)}
                    >
                        {showOwnSubjects ? 'Saját tárgyak elrejtése' : 'Saját tárgyak mutatása'}
                    </Button>
                </Stack>
            )}

            <div ref={printRef} className={isCalendarSaving ? 'photo-calendar' : undefined}>
                <FullCalendar
                    plugins={[timeGridPlugin, momentTimezonePlugin]}
                    initialView="timeGridWeek"
                    weekends={false}
                    stickyHeaderDates={!isCalendarSaving}
                    events={filteredTable as EventInput[]}
                    headerToolbar={false}
                    allDaySlot={false}
                    slotMinTime="08:00:00"
                    slotMaxTime="22:00:00"
                    locale={huLocale}
                    timeZone="Europe/Budapest"
                    dayHeaderFormat={{ weekday: 'long' }}
                    slotLabelFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                    }}
                    height="auto"
                    slotDuration="00:20:00"
                    eventClick={onEventClick}
                    eventContent={(eventInfo) => {
                        return (
                            <div
                                className={`fc-event-main-frame ${
                                    eventInfo.event.extendedProps.type === 'gyakorlat' ? 'practice' : 'lecture'
                                } ${viewOnly ? 'view-only' : ''}`}
                                onMouseEnter={(e) => handlePopoverOpen(e, eventInfo)}
                                onMouseLeave={handlePopoverClose}
                                style={{
                                    opacity: isEventInSaved(eventInfo.event.id) && !own ? 0.6 : 1,
                                    backgroundColor: isEventInSaved(eventInfo.event.id) && !own ? 'gray' : '',
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
                />
            </div>

            {popoverInfo.event && (
                <Popover
                    id="mouse-over-popover"
                    sx={{ pointerEvents: 'none' }}
                    open={isPopoverOpen}
                    anchorEl={popoverInfo.anchorEl as Element}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    onClose={handlePopoverClose}
                    disableRestoreFocus
                >
                    <Typography sx={{ p: 1 }}>
                        <div>{popoverInfo.event.timeText}</div>
                        {popoverInfo.event.event.title.split('\r').map((item, ind) => {
                            return <div key={ind}>{item}</div>;
                        })}
                        {!viewOnly && (
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ fontSize: 'small', color: 'gray' }}
                                marginTop={0.5}
                            >
                                <div>
                                    {own ? (
                                        <EditCalendarIcon fontSize="small" />
                                    ) : isEventInSaved(popoverInfo.event.event.id) ? (
                                        <EventBusyIcon fontSize="small" />
                                    ) : (
                                        <EventAvailableIcon fontSize="small" />
                                    )}
                                </div>
                                <div>
                                    {own
                                        ? 'Kattints a szerkesztéshez'
                                        : `Kattints az ${
                                              isEventInSaved(popoverInfo.event.event.id)
                                                  ? 'órarendből törléshez'
                                                  : 'órarendbe adáshoz'
                                          }`}
                                </div>
                            </Stack>
                        )}
                    </Typography>
                </Popover>
            )}
        </>
    );
};

// Calendar.propTypes = {
//     tableData: PropTypes.array.isRequired,
//     onCalendarClick: PropTypes.func.isRequired,
//     savedLessons: PropTypes.array,
//     onEventEdit: PropTypes.func,
//     onImageDownload: PropTypes.func,
//     own: PropTypes.bool.isRequired,
// };

export default Calendar;
