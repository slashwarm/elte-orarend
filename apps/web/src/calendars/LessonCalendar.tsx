import huLocale from '@fullcalendar/core/locales/hu';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/Calendar.css';

import { EventClickArg, EventContentArg, EventHoveringArg, EventInput } from '@fullcalendar/core';
import { Box, Divider, Fade, Popper } from '@mui/material';
import { convertDataToCalendar, type Lesson } from '../utils/data';
import ExportMenu from '../components/ExportMenu';
import { SPACING } from '../utils/spacing';
import Paper from '@mui/material/Paper';
import { EventImpl } from '@fullcalendar/core/internal';
import dayjs from 'dayjs';

type ActivePopper = {
    anchorEl: EventTarget | null;
    event: EventImpl | null;
};

type LessonCalendarProps = {
    lessons: Lesson[]; // A megjelenítendő órák
    eventContent: React.FC<EventContentArg>; // Egy addott naptári elemhez tartozó componenst add meg
    onEventClick?: (arg: EventClickArg) => void; // Megmondja, hogy egy naptári eseményre kattintáskor mi történik
    calendarClassNames?: string; // Extra CSS osztályok a naptárnak
    showPopover?: boolean; // Megadja, hogyha az órák felett van a kurzor, akkor megjelenik-e a popover. Ha nincs megadva, nincs popover
    popoverActionIcon?: (id: number) => React.ReactNode; // A popover alján megjelenő icon. Pl a naptárszerkesztés ikon
    popoverActionText?: (id: number) => string; // A popover alján megjelenő akcióra figyelmet felhívó szöveg. Pl "Kattints a szerkesztéshez"
    onImageDownload?: (ref: React.MutableRefObject<HTMLElement>) => Promise<void>; // A kép letöltés kezelése, ha nincs megadva akkor nem lesz kép mentés opció
    onUrlExport?: () => void; // Hivatkozás másolása, ha nincs megadva akkor nem lesz hivatkozás opció
    toolbarPosition?: 'top' | 'bottom'; // Az eszköztár helye a naptárhoz képest. Alapból alul
    toolbarEnd?: React.ReactNode; // Az eszköztár jobb szélére kerülő elemek. Pl visszavonás gombok
    children?: React.ReactNode; // Az eszköztárba kerülő elemek
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
    onUrlExport,
    toolbarPosition = 'bottom',
    toolbarEnd,
    children,
}: LessonCalendarProps) => {
    const events = useMemo(() => convertDataToCalendar(lessons), [lessons]);

    // popover
    const [activePopper, setActivePopper] = useState<ActivePopper>({
        anchorEl: null,
        event: null,
    });

    const handlePopoverOpen = ({ event, el }: EventHoveringArg) => {
        setActivePopper({ anchorEl: el, event: event });
    };

    const handlePopoverClose = () => {
        setActivePopper({ anchorEl: null, event: null });
    };

    const isPopperOpen = Boolean(activePopper.anchorEl);
    const { id, start, end } = activePopper?.event ?? {};
    const eventId = typeof id === 'string' ? parseInt(id) : null;

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

    const hasExportMenu = Boolean(onImageDownload || onUrlExport);
    const isBottom = toolbarPosition === 'bottom';

    // A naptár alatti eszköztár, ami a képmentésbe már nem kerül bele
    const toolbar = (children || toolbarEnd || hasExportMenu) && !isCalendarSaving && (
        <Box sx={isBottom ? { mt: SPACING.base } : { mb: SPACING.base }}>
            {isBottom && <Divider sx={{ mb: SPACING.base }} />}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={SPACING.tight}
                useFlexGap
                component="nav"
                aria-label="Órarend műveletek"
                sx={{
                    flexWrap: 'wrap',
                    alignItems: { xs: 'stretch', sm: 'center' },
                }}
            >
                {children}
                {hasExportMenu && (
                    <ExportMenu
                        lessons={lessons}
                        onImageDownload={onImageDownload ? handlePrintClick : undefined}
                        onUrlExport={onUrlExport}
                    />
                )}
                {toolbarEnd && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: { sm: 'auto' } }}>{toolbarEnd}</Box>
                )}
            </Stack>
        </Box>
    );

    return (
        <>
            {!isBottom && toolbar}

            <div
                ref={printRef}
                className={`${calendarClassNames} ${isCalendarSaving ? 'photo-calendar' : ''}`}
                role="application"
                aria-label="Órarend naptár"
                aria-describedby="calendar-description"
            >
                <div id="calendar-description" style={{ display: 'none' }}>
                    Heti órarend naptár, amely az órákat időrendi sorrendben jeleníti meg. Az órákra kattintva
                    részleteket lehet megtekinteni.
                </div>
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
                    eventMouseEnter={handlePopoverOpen}
                    eventMouseLeave={handlePopoverClose}
                    eventContent={(eventInfo) => {
                        return (
                            <div className="fc-event-main-frame" role="button">
                                {eventContent(eventInfo)}
                            </div>
                        );
                    }}
                />
            </div>

            {isBottom && toolbar}

            {showPopover && !isCalendarSaving && activePopper.event && (
                <Popper
                    id={'mouse-over-popover'}
                    sx={{ zIndex: 1200, pointerEvents: 'none' }}
                    open={isPopperOpen}
                    anchorEl={activePopper.anchorEl as Element}
                    placement={'top'}
                    transition
                    role="tooltip"
                    aria-hidden="true"
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper sx={{ p: SPACING.tight }}>
                                <div>
                                    {dayjs(start).format('HH:mm')} - {dayjs(end).format('HH:mm')}
                                </div>
                                {activePopper?.event?.title.split('\r').map((item, ind) => {
                                    return <div key={ind}>{item}</div>;
                                })}
                                {(popoverActionIcon || popoverActionText) && (
                                    <Stack
                                        direction="row"
                                        spacing={SPACING.tight}
                                        sx={{
                                            marginTop: SPACING.tight,
                                            fontSize: 'small',
                                            color: 'gray',
                                        }}
                                    >
                                        <div>{eventId && popoverActionIcon && popoverActionIcon(eventId)}</div>
                                        <div>{eventId && popoverActionText && popoverActionText(eventId)}</div>
                                    </Stack>
                                )}
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            )}
        </>
    );
};

export default LessonCalendar;
