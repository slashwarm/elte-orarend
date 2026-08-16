import { toast } from 'react-toastify';
import { DayOfWeek, Lesson } from './data';

const daysOfWeek: DayOfWeek[] = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'];

const TIMEZONE = 'Europe/Budapest';

// Egy félév tanítási hetei. Ennyiszer ismétlődik minden óra az exportált naptárban
const SEMESTER_WEEKS = 15;

// A Google Naptár importáló felülete, ahova a letöltött .ics fájlt be lehet tölteni
const GOOGLE_CALENDAR_IMPORT_URL = 'https://calendar.google.com/calendar/r/settings/export';

/**
 * Kiszámolja az aktuális hét adott napjára eső óra kezdetét és végét
 *
 * @param {Lesson} lesson
 * @returns {{ start: Date; end: Date } | null} null, ha az óra ideje értelmezhetetlen
 */
const getLessonOccurrence = (lesson: Lesson): { start: Date; end: Date } | null => {
    const [startPart, endPart] = lesson.time.split('-');

    if (!startPart || !endPart) {
        return null;
    }

    const [startHour, startMinute] = startPart.split(':').map(Number);
    const [endHour, endMinute] = endPart.split(':').map(Number);
    const dayIndex = daysOfWeek.indexOf(lesson.day.toLowerCase() as DayOfWeek);

    if (dayIndex === -1 || [startHour, startMinute, endHour, endMinute].some(isNaN)) {
        return null;
    }

    // Ugyanaz a horgonyzás, mint a naptár nézetben: az aktuális hét megfelelő napja
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + (dayIndex - ((now.getDay() + 6) % 7)));

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const date = targetDate.getDate();

    return {
        start: new Date(year, month, date, startHour, startMinute, 0),
        end: new Date(year, month, date, endHour, endMinute, 0),
    };
};

const pad = (value: number): string => value.toString().padStart(2, '0');

/**
 * Helyi idő iCalendar formátumban, pl "20250908T162000"
 */
const formatLocalDateTime = (date: Date): string =>
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

/**
 * UTC idő iCalendar formátumban, pl "20250908T142000Z"
 */
const formatUtcDateTime = (date: Date): string =>
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;

/**
 * Az iCalendar TEXT mezőkben tiltott karakterek escape-elése
 */
const escapeText = (value: string): string =>
    value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r\n|\r|\n/g, '\\n');

/**
 * Az RFC 5545 szerinti sortörés: legfeljebb 75 oktett soronként
 */
const foldLine = (line: string): string => {
    const encoder = new TextEncoder();

    if (encoder.encode(line).length <= 75) {
        return line;
    }

    const chunks: string[] = [];
    let current = '';
    let currentBytes = 0;
    // Az első sor 75, a folytatósorok 74 oktettet vihetnek (a vezető szóköz miatt)
    let limit = 75;

    for (const char of line) {
        const charBytes = encoder.encode(char).length;

        if (currentBytes + charBytes > limit) {
            chunks.push(current);
            current = '';
            currentBytes = 0;
            limit = 74;
        }

        current += char;
        currentBytes += charBytes;
    }

    chunks.push(current);

    return chunks.join('\r\n ');
};

/**
 * Egy órából összeállítja az esemény leírását
 */
const buildDescription = (lesson: Lesson): string => {
    const lines = [
        lesson.code && `Tárgykód: ${lesson.code}`,
        lesson.course && `Kurzuskód: ${lesson.course}`,
        lesson.type && `Típus: ${lesson.type}`,
        lesson.teacher && `Oktató: ${lesson.teacher}`,
        lesson.comment && `Megjegyzés: ${lesson.comment}`,
    ].filter(Boolean);

    return lines.join('\n');
};

/**
 * iCalendar (.ics) tartalmat állít elő az órákból, heti ismétlődő eseményekként
 *
 * @param {Lesson[]} lessons
 * @returns {string}
 */
export const generateIcs = (lessons: Lesson[]): string => {
    const stamp = formatUtcDateTime(new Date());

    const events = lessons
        .filter((lesson) => lesson.time && lesson.time.trim() !== '' && !lesson.hidden)
        .flatMap((lesson) => {
            const occurrence = getLessonOccurrence(lesson);

            if (!occurrence) {
                return [];
            }

            const summary = `[#${lesson.course}] ${lesson.name}${lesson.type ? ` (${lesson.type})` : ''}`;

            return [
                'BEGIN:VEVENT',
                `UID:elte-orarend-${lesson.id}@elte-orarend.vercel.app`,
                `DTSTAMP:${stamp}`,
                `DTSTART;TZID=${TIMEZONE}:${formatLocalDateTime(occurrence.start)}`,
                `DTEND;TZID=${TIMEZONE}:${formatLocalDateTime(occurrence.end)}`,
                `RRULE:FREQ=WEEKLY;COUNT=${SEMESTER_WEEKS}`,
                `SUMMARY:${escapeText(summary)}`,
                lesson.location ? `LOCATION:${escapeText(lesson.location)}` : '',
                `DESCRIPTION:${escapeText(buildDescription(lesson))}`,
                'END:VEVENT',
            ].filter(Boolean);
        });

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ELTE Orarendtervezo//HU',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:ELTE órarend',
        `X-WR-TIMEZONE:${TIMEZONE}`,
        'BEGIN:VTIMEZONE',
        `TZID:${TIMEZONE}`,
        'BEGIN:DAYLIGHT',
        'TZOFFSETFROM:+0100',
        'TZOFFSETTO:+0200',
        'TZNAME:CEST',
        'DTSTART:19700329T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
        'END:DAYLIGHT',
        'BEGIN:STANDARD',
        'TZOFFSETFROM:+0200',
        'TZOFFSETTO:+0100',
        'TZNAME:CET',
        'DTSTART:19701025T030000',
        'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
        'END:STANDARD',
        'END:VTIMEZONE',
        ...events,
        'END:VCALENDAR',
    ];

    return lines.map(foldLine).join('\r\n');
};

/**
 * Letölti az órarendet .ics fájlként
 *
 * @param {Lesson[]} lessons
 * @returns {boolean} hamis, ha nem volt exportálható óra
 */
export const handleIcsExport = (lessons: Lesson[]): boolean => {
    const ics = generateIcs(lessons);

    if (!ics.includes('BEGIN:VEVENT')) {
        toast.error('Nincs exportálható óra az órarendben');
        return false;
    }

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'orarend.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
};

/**
 * Letölti az .ics fájlt, és megnyitja a Google Naptár importáló felületét
 *
 * @param {Lesson[]} lessons
 */
export const handleGoogleCalendarExport = (lessons: Lesson[]): void => {
    // A Google Naptár nem tud egyszerre több eseményt átvenni hivatkozásból,
    // ezért a letöltött fájlt kell importálni
    if (!handleIcsExport(lessons)) {
        return;
    }

    window.open(GOOGLE_CALENDAR_IMPORT_URL, '_blank', 'noopener,noreferrer');

    toast.info('Töltsd fel a letöltött orarend.ics fájlt a megnyitott Google Naptár oldalon 📅');
};
