import CRC32 from 'crc-32';
import axios from 'axios';

const regex = /[\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/g;

const daysOfWeek = [
  'hétfő',
  'kedd',
  'szerda',
  'csütörtök',
  'péntek',
  'szombat',
  'vasárnap',
];

const fetchTimetable = async (formData) => {
  try {
    const response = await axios.post('/orarend/server/data.php', formData);
    return response.data;
  } catch (error) {
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

const convertDataToTable = (data, courses) => {
  let tableObject = data.map((subArray) => {
    let time = subArray[0].split(' ');
    let lessonIdentifier = subArray[1].split(' ');
    let courseCodeSplit = lessonIdentifier[0].split('-');
    let lessonCode = courseCodeSplit
      .slice(0, courseCodeSplit.length - 1)
      .join('-');
    let courseCode = courseCodeSplit[courseCodeSplit.length - 1];
    let lessonType = lessonIdentifier[1].replace('(', '').replace(')', '');
    let lessonName = subArray[2];
    let location = subArray[3];
    let comment = subArray[5];
    let teacher = '';

    if (comment && comment.trim() !== '') {
      // van megjegyzés / oktató
      let teacherSplit = comment
        .replace('Dr. ', '')
        .replace(' Dr.', '')
        .replace(regex, '')
        .split(' ');

      if (teacherSplit.length >= 2) {
        // emberi név, tehát legalább 2 tagú
        teacher = teacherSplit.slice(0, 2).join(' ');
      }
    }

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
      day: time[0],
      time: time[1],
      location: location,
      type: lessonType,
      course: courseCode,
      teacher: teacher,
      comment: comment,
    };

    const uniqueId = generateUniqueId(newObject);

    return { ...newObject, id: uniqueId };
  });

  if (courses) {
    let uniqueIds = [];

    tableObject = tableObject.filter((subArray) => {
      // csak az az óra kell ami a kiválasztott kurzusokhoz tartozik
      const isInCourse = courses
        .filter((x) => x.courseCode === subArray.code)
        .some((x) => x.courseId === subArray.course);

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

const convertDataToCalendar = (data) => {
  const calendarObject = data
    .filter((subArray) => subArray.time && subArray.time.trim() !== '' && !subArray.hidden)
    .map((subArray) => {
      const time = subArray.time.split('-');
      const startTime = time[0].split(':');
      const endTime = time[1].split(':');

      const now = new Date();
      const dayIndex = daysOfWeek.indexOf(subArray.day.toLowerCase());
      const targetDate = new Date();
      const diff = dayIndex - ((now.getDay() + 6) % 7);
      targetDate.setDate(now.getDate() + diff);
      const location = subArray.location ? `\n${subArray.location}` : '';

      let newObject = {
        id: subArray.id,
        title: `[#${subArray.course}] ${subArray.name}\r (${subArray.type})\r${location}\r\n${subArray.comment}`,
        start: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          parseInt(startTime[0]),
          parseInt(startTime[1]),
          0
        ),
        end: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          parseInt(endTime[0]),
          parseInt(endTime[1]),
          0
        ),
        type: subArray.type,
      };

      return newObject;
    });

  return calendarObject;
};

const getSemesters = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const semesters = [];
  let prevSemester = 0;

  if (currentMonth < 6) {
    // tavaszi félév
    semesters.push(`${currentYear - 1}-${currentYear}-2`);
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

const generateUniqueId = (data) => {
  const valuesOnly = Object.values(data);
  return CRC32.str(JSON.stringify(valuesOnly));
};

export {
  fetchTimetable,
  convertDataToCalendar,
  convertDataToTable,
  getSemesters,
  generateUniqueId,
};
