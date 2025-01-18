import huLocale from '@fullcalendar/core/locales/hu';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import DownloadIcon from '@mui/icons-material/Download';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/Calendar.css';

import { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import { Button } from '@mui/material';
import { convertDataToCalendar, type Lesson } from '../utils/Data';

type PopoverInfo = {
    anchorEl: EventTarget | null;
    event: EventContentArg | null;
};

type LessonCalendarProps = {
    lessons: Lesson[]; // A megjelenítendő órák
    eventContent: React.FC<EventContentArg>; // Egy addott naptári elemhez tartozó componenst add meg
    onEventClick?: (arg: EventClickArg) => void; // Megmondja, hogy egy naptári eseményre kattintáskor mi történik
    calendarClassNames?: string; // Extra CSS osztályok a naptárnak
    showPopover?: boolean; // Megadja, hogyha az órák felett van a kurzor, akkor megjelenik-e a popover. Ha nincs megadva, nincs popover
    popoverActionIcon?: (id: number) => React.ReactNode; // A popover alján megjelenő icon. Pl a naptárszerkesztés ikon
    popoverActionText?: (id: number) => string; // A popover alján megjelenő akcióra figyelmet felhívó szöveg. Pl "Kattints a szerkesztéshez"
    onImageDownload?: (ref: React.MutableRefObject<HTMLElement>) => Promise<void>; // A kép letöltés kezelése, ha nincs megadva akkor nem lesz kép letöltő gomb
    children?: React.ReactNode; // A naptár felé kerülő elemek
};

/**
 * Egy órákat megjelenítő naptár, ami fölé tetszőleges gombok és elemek lehelyezhetők
 *
 * @param {LessonCalendarProps} props
 */
const LessonCalendar: React.FC<LessonCalendarProps> = ({
    lessons,
    onEventClick,
    eventContent,
    calendarClassNames,
    showPopover,
    popoverActionIcon,
    popoverActionText,
    onImageDownload,
    children,
}: LessonCalendarProps) => {
    const events = useMemo(() => convertDataToCalendar(lessons), [lessons]);

    // popover
    const [popoverInfo, setPopoverInfo] = useState<PopoverInfo>({
        anchorEl: null,
        event: null,
    });

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>, eventInfo: EventContentArg) => {
        // console.log({event, eventInfo});
        setPopoverInfo({ anchorEl: event.currentTarget, event: eventInfo });
    };

    const handlePopoverClose = () => {
        setPopoverInfo({ anchorEl: null, event: null });
    };

    const isPopoverOpen = Boolean(popoverInfo.anchorEl);

    // képként való mentés
    const [isCalendarSaving, setCalendarSaving] = useState<boolean>(false);
    const printRef = useRef<HTMLDivElement>(null!);

    const handlePrintClick = () => {
        setCalendarSaving(true);
    };

    useEffect(() => {
        const handleImageDownload = async () => {
            if (onImageDownload) {
                await onImageDownload(printRef);
                setCalendarSaving(false);
            }
        };

        if (isCalendarSaving) {
            void handleImageDownload();
        }
    }, [isCalendarSaving, onImageDownload]);

    return (
        <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} marginBottom={2}>
                {onImageDownload && (
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handlePrintClick}>
                        Mentés képként
                    </Button>
                )}
                {children}
            </Stack>

            <div ref={printRef} className={`${calendarClassNames} ${isCalendarSaving ? 'photo-calendar' : ''}`}>
                <FullCalendar
                    plugins={[timeGridPlugin, momentTimezonePlugin]}
                    initialView="timeGridWeek"
                    weekends={false}
                    stickyHeaderDates={isCalendarSaving === undefined ? true : !isCalendarSaving}
                    events={events as EventInput[]}
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
                                className="fc-event-main-frame"
                                onMouseEnter={(e) => handlePopoverOpen(e, eventInfo)}
                                onMouseLeave={handlePopoverClose}
                            >
                                {eventContent(eventInfo)}
                            </div>
                        );
                    }}
                />
            </div>

            {showPopover && !isCalendarSaving && popoverInfo.event && (
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
                        {(popoverActionIcon || popoverActionText) && (
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ fontSize: 'small', color: 'gray' }}
                                marginTop={0.5}
                            >
                                <div>
                                    {popoverActionIcon && popoverActionIcon(parseInt(popoverInfo.event.event.id))}
                                </div>
                                <div>
                                    {popoverActionText && popoverActionText(parseInt(popoverInfo.event.event.id))}
                                </div>
                            </Stack>
                        )}
                    </Typography>
                </Popover>
            )}
        </>
    );
};

export default LessonCalendar;
