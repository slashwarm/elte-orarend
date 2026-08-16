import axios, { isAxiosError } from 'axios';
import CRC32 from 'crc-32';

export type DayOfWeek = 'hétfő' | 'kedd' | 'szerda' | 'csütörtök' | 'péntek' | 'szombat' | 'vasárnap';

export type DayOfWeekCapital = 'Hétfő' | 'Kedd' | 'Szerda' | 'Csütörtök' | 'Péntek' | 'Szombat' | 'Vasárnap' | '';

export type TimeRange = `${number}:${number}${number}-${number}:${number}${number}` | ''; // Pl "16:20-18:30"

export type Semester = `${number}-${number}-${1 | 2}`; // Pl "2024-2025-1", "2013-2014-2"

type SemesterItem = {
    value: Semester;
    label: string;
};

export type Lesson = {
    name: string;
    code: string;
    day: DayOfWeekCapital;
    time: TimeRange;
    location: string;
    type: string;
    course: string;
    teacher: string;
    comment: string;
    id: number; // Amit a `generateUniqueId` add neki a fenti adattagok alapján. SZERKESZTÉSKOR NEM VÁLTOZIK
    newId?: boolean; // Backwards compatibility miatt. Mostmár elvben új Lesson-nél true az értéke
    edited?: boolean; // Ha nincs vagy hamis akkor nem lett szerkesztve, ha igaz akkor lett
    hidden?: boolean;
};

export type SearchData = {
    name: string | string[];
    year: Semester;
};

// Az excel-ből betöltött adatokhoz
export type Course = {
    courseCode: string;
    courseId: string;
};

export type Data = [
    `${DayOfWeekCapital} ${TimeRange} ${string}`,
    `${string} (${string})`,
    `${string} (${string})`,
    string,
    string,
    string,
    string,
][];

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
};

const regex = /[\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/g;

const daysOfWeek: DayOfWeek[] = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'];

const MAX_QUERY_LENGTH = 3500;

// A szerver 10 másodperc után adja fel az upstream lekérdezést. Enélkül egy beragadt kérés örökre pörögne.
const REQUEST_TIMEOUT = 20000;

const getSearchErrorMessage = (error: unknown): string => {
    if (!isAxiosError(error)) {
        return 'Ismeretlen hiba történt a keresés közben. Részletek a konzolban.';
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return 'A keresés túl sokáig tartott. A tanrend.elte.hu most lassan válaszol, próbáld újra.';
    }

    if (!error.response) {
        return navigator.onLine
            ? 'Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot, majd próbáld újra.'
            : 'Nincs internetkapcsolat. Csatlakozz újra, majd próbáld meg ismét.';
    }

    if (error.response.status >= 500) {
        return 'A szerver hibát jelzett. Lehet, hogy a tanrend.elte.hu nem elérhető. Próbáld újra pár perc múlva.';
    }

    if (error.response.status === 400) {
        return 'Érvénytelen keresés. Ellenőrizd a beírt nevet vagy kódot.';
    }

    return `A keresés nem sikerült (${error.response.status}). Próbáld újra.`;
};

// A kurzuskódok rendezve és duplikáció nélkül mennek ki, hogy ugyanaz a keresés ugyanazt a cache kulcsot kapja
const buildSearchParams = (formData?: SearchData): URLSearchParams | undefined => {
    if (!formData) {
        return undefined;
    }

    const params = new URLSearchParams({ year: formData.year });

    if (Array.isArray(formData.name)) {
        [...new Set(formData.name)].sort().forEach((code) => params.append('code', code));
    } else {
        params.append('name', formData.name);
    }

    return params;
};

/**
 * Lekérdezi a szerverről a kért adatokat
 *
 * @async
 * @param {SearchData} formData
 * year: A lekérdezett szemeszter;
 * mode: 'subject' ha tárgy, 'teacher' ha tanár és 'course ha kurzus';
 * name: A keresendő kulcszó
 * @returns {Promise<Data>}
 */
const fetchTimetable = async (formData?: SearchData): Promise<Data> => {
    try {
        const params = buildSearchParams(formData);

        // GET-et a CDN tudja cache-elni, tehát kevesebb kérés megy ki. Túl hosszú kurzuslistánál marad a POST.
        const response =
            params && params.toString().length <= MAX_QUERY_LENGTH
                ? await axios.get(`/api?${params.toString()}`, { timeout: REQUEST_TIMEOUT })
                : await axios.post('/api', formData, { timeout: REQUEST_TIMEOUT });

        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching timetable', error);

        // A hibát a hívó react-query kapja meg, hogy a felület hibaüzenetet és újrapróbálást tudjon mutatni
        throw new Error(getSearchErrorMessage(error));
    }
};

/**
 * A Data-ból jövő commentből kiszedi a tanár nevét
 *
 * @param {string} comment
 * @returns {string}
 */
export const getTeacherFromComment = (comment: string): string => {
    let teacher = '';

    if (comment && comment.trim() !== '') {
        // van megjegyzés / oktató
        const teacherSplit = comment.replace('Dr. ', '').replace(' Dr.', '').replace(regex, '').split(' ');

        if (teacherSplit.length >= 2) {
            // emberi név, tehát legalább 2 tagú
            teacher = teacherSplit.slice(0, 2).join(' ');
        }
    }
    return teacher;
};

/**
 * Data-ból vagy Course array-ből előállítja a Lesson-öket
 *
 * @param {Data} data A szerverről az adatok, vagy üres array
 * @param {Course[] | undefined} courses Az excelből beolvasott kurzus adatok
 * @returns {Lesson[]}
 */
const convertDataToTable = (data: Data, courses?: Course[]): Lesson[] => {
    let tableObject = data.map((subArray) => {
        let time = subArray[0].split(' ');
        const lessonIdentifier = subArray[1].split(' ');
        const courseCodeSplit = lessonIdentifier[0].split('-');
        const lessonCode = courseCodeSplit.slice(0, courseCodeSplit.length - 1).join('-');
        const courseCode = courseCodeSplit[courseCodeSplit.length - 1];
        const lessonType = lessonIdentifier[1].replace('(', '').replace(')', '');
        const lessonName = subArray[2];
        let location = subArray[3];
        const comment = subArray[5];
        const teacher = getTeacherFromComment(comment);

        if (time.length >= 4) {
            // van helyes időnk
            if (time[0] === 'Hétfo') {
                time[0] = 'Hétfő';
            }

            time = time.slice(0, 2);
        } else {
            // helytelen adat van az időnél
            time = ['', ''];
        }

        if (location === '-') {
            location = '';
        }

        const newObject = {
            name: lessonName,
            code: lessonCode,
            day: time[0] as DayOfWeekCapital,
            time: time[1] as TimeRange,
            location: location,
            type: lessonType,
            course: courseCode,
            teacher: teacher,
            comment: comment,
        };

        const uniqueId = generateUniqueId(newObject);

        return { ...newObject, id: uniqueId, newId: true };
    });

    if (courses) {
        const uniqueIds: number[] = [];

        tableObject = tableObject.filter((subArray) => {
            // csak az az óra kell ami a kiválasztott kurzusokhoz tartozik
            const isInCourse = courses
                .filter((x: Course) => x.courseCode === subArray.code)
                .some((x: Course) => x.courseId === subArray.course);

            if (isInCourse && !uniqueIds.includes(subArray.id)) {
                // duplikáció ellen
                uniqueIds.push(subArray.id);
                return true;
            }

            return false;
        });
    }

    return tableObject;
};

/**
 * Naptáreseményeket állít elő Lesson-ökből
 *
 * @param {Lesson[]} data
 * @returns {CalendarEvent[]}
 */
const convertDataToCalendar = (data: Lesson[]): CalendarEvent[] => {
    return data
        .filter((subArray) => subArray.time && subArray.time.trim() !== '' && !subArray.hidden)
        .map((subArray) => {
            const time = subArray.time.split('-');
            const startTime = time[0].split(':');
            const endTime = time[1].split(':');

            const now = new Date();
            const dayIndex = daysOfWeek.indexOf(subArray.day.toLowerCase() as DayOfWeek);
            const targetDate = new Date();
            const diff = dayIndex - ((now.getDay() + 6) % 7);
            targetDate.setDate(now.getDate() + diff);
            const location = subArray.location ? `\n${subArray.location}` : '';

            return {
                id: subArray.id.toString(),
                title: `[#${subArray.course}] ${subArray.name}\r (${subArray.type})\r${location}\r\n${subArray.comment}`,
                start: new Date(
                    targetDate.getFullYear(),
                    targetDate.getMonth(),
                    targetDate.getDate(),
                    parseInt(startTime[0]),
                    parseInt(startTime[1]),
                    0,
                ),
                end: new Date(
                    targetDate.getFullYear(),
                    targetDate.getMonth(),
                    targetDate.getDate(),
                    parseInt(endTime[0]),
                    parseInt(endTime[1]),
                    0,
                ),
                type: subArray.type,
            };
        });
};

/**
 * Visszaadja a 6db legkésőbbi Semester-t
 *
 * @returns {Semester[]}
 */
const getSemesters = (): SemesterItem[] => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const semesters: SemesterItem[] = [];
    let prevSemester;

    if (currentMonth < 6) {
        // tavaszi félév
        semesters.push({
            value: `${currentYear - 1}-${currentYear}-2`,
            label: `${currentYear - 1}-${currentYear}-2 (tavaszi félév)`,
        });
        prevSemester = 1;
    } else {
        // őszi félév
        semesters.push({
            value: `${currentYear}-${currentYear + 1}-1`,
            label: `${currentYear}-${currentYear + 1}-1 (őszi félév)`,
        });
        prevSemester = 2;
    }

    const len = semesters.length;
    let year = currentYear;

    // TODO: kispaghettizés
    for (let i = 0; i < 3 - len; i++) {
        // kiegészítjük régebbi félévekkel
        year--;

        if (prevSemester === 1) {
            semesters.push({ value: `${year}-${year + 1}-1`, label: `${year}-${year + 1}-1 (előző őszi félév)` });
            prevSemester = 2;
        } else {
            semesters.push({ value: `${year}-${year + 1}-2`, label: `${year}-${year + 1}-2 (előző tavaszi félév)` });
            prevSemester = 1;
        }
    }

    return semesters;
};

/**
 * Bármilyen objektumhoz azonosítót generál
 *
 * @param {*} data
 * @returns {number}
 */
const generateUniqueId = (data: object): number => {
    const valuesOnly = Object.values(data).sort(); // Így generateUniqueId({ a: 'a', b: 'b' }) === generateUniqueId({ b: 'b', a: 'a' })
    return CRC32.str(JSON.stringify(valuesOnly));
};

export { convertDataToCalendar, convertDataToTable, fetchTimetable, generateUniqueId, getSemesters };
