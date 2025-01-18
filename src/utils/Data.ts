import axios from 'axios';
import CRC32 from 'crc-32';

export type DayOfWeek = 'hétfő' | 'kedd' | 'szerda' | 'csütörtök' | 'péntek' | 'szombat' | 'vasárnap';

export type DayOfWeekCapital = 'Hétfő' | 'Kedd' | 'Szerda' | 'Csütörtök' | 'Péntek' | 'Szombat' | 'Vasárnap';

export type TimeRange = `${number}:${number}${number}-${number}:${number}${number}`; // Pl "16:20-18:30"

export type Semester = `${number}-${number}-${1 | 2}`; // Pl "2024-2025-1", "2013-2014-2"

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

export type FormData = {
    name: string | string[];
    year: Semester;
    mode: 'subject' | 'teacher' | 'course';
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

/**
 * Lekérdezi a szerverről a kért adatokat
 *
 * @async
 * @param {FormData} formData
 * year: A lekérdezett szemeszter;
 * mode: 'subject' ha tárgy, 'teacher' ha tanár és 'course ha kurzus';
 * name: A keresendő kulcszó
 * @returns {Promise<Data>}
 */
const fetchTimetable = async (formData: FormData): Promise<Data> => {
    try {
        const response = await axios.post('/orarend/server/data.php', formData);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error(error.response);
            console.error('Server response error');
        } else if (error.request) {
            console.error('Network error');
        } else {
            console.error(error);
        }

        return [];
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
        let teacherSplit = comment.replace('Dr. ', '').replace(' Dr.', '').replace(regex, '').split(' ');

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
    // console.log({ data, courses });
    let tableObject = data.map((subArray) => {
        let time = subArray[0].split(' ');
        let lessonIdentifier = subArray[1].split(' ');
        let courseCodeSplit = lessonIdentifier[0].split('-');
        let lessonCode = courseCodeSplit.slice(0, courseCodeSplit.length - 1).join('-');
        let courseCode = courseCodeSplit[courseCodeSplit.length - 1];
        let lessonType = lessonIdentifier[1].replace('(', '').replace(')', '');
        let lessonName = subArray[2];
        let location = subArray[3];
        let comment = subArray[5];
        let teacher = getTeacherFromComment(comment);

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
        let uniqueIds: any = [];

        tableObject = tableObject.filter((subArray: any) => {
            // csak az az óra kell ami a kiválasztott kurzusokhoz tartozik
            const isInCourse = courses
                .filter((x: any) => x.courseCode === subArray.code)
                .some((x: any) => x.courseId === subArray.course);

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
const getSemesters = (): Semester[] => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const semesters: Semester[] = [];
    let prevSemester;

    if (currentMonth < 6) {
        // tavaszi félév
        semesters.push(`${currentYear - 1}-${currentYear}-2` as Semester);
        prevSemester = 1;
    } else {
        // őszi félév
        semesters.push(`${currentYear}-${currentYear + 1}-1`);
        prevSemester = 2;
    }

    const len = semesters.length;
    let year = currentYear;

    // TODO: kispaghettizés
    for (let i = 0; i < 3 - len; i++) {
        // kiegészítjük régebbi félévekkel
        year--;

        if (prevSemester === 1) {
            semesters.push(`${year}-${year + 1}-1`);
            prevSemester = 2;
        } else {
            semesters.push(`${year}-${year + 1}-2`);
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
const generateUniqueId = (data: any): number => {
    const valuesOnly = Object.values(data).sort(); // Így generateUniqueId({ a: 'a', b: 'b' }) === generateUniqueId({ b: 'b', a: 'a' })
    return CRC32.str(JSON.stringify(valuesOnly));
};

export { convertDataToCalendar, convertDataToTable, fetchTimetable, generateUniqueId, getSemesters };
