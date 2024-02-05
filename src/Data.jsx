import CRC32 from 'crc-32';

const regex = /[\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/g;

const convertDataToTable = (data) => {
  const tableObject = data.map((subArray) => {
    let time = subArray[0].split(' ');
    let lessonIdentifier = subArray[1].split(' ');
    let courseCodeSplit = lessonIdentifier[0].split('-');
    let lessonCode = courseCodeSplit.slice(0, courseCodeSplit.length - 1).join('-');
    let courseCode = courseCodeSplit[courseCodeSplit.length - 1];
    let lessonType = lessonIdentifier[1].replace('(', '').replace(')', '');
    let lessonName = subArray[2];
    let location = subArray[3];
    let comment = subArray[5];
    let teacher = "";

    if (comment && comment.trim() !== '') { // van megjegyzés / oktató
      let teacherSplit = comment.replace("Dr. ", "").replace(" Dr.", "").replace(regex, "").split(' ');

      if (teacherSplit.length >= 2) { // emberi név, tehát legalább 2 tagú
        teacher = teacherSplit.slice(0, 2).join(' ');
      }
    }

    if (time.length >= 4) { // van helyes időnk
      if (time[0] === "Hétfo") {
        time[0] = "Hétfő";
      }

      time = time.slice(0, 2);
    } else { // helytelen adat van az időnél
      time = ["", ""];
    }

    if (location === "-") {
      location = "";
    }

    let newObject = {
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

    const valuesOnly = Object.values(newObject);
    const uniqueId = CRC32.str(JSON.stringify(valuesOnly));

    return { ...newObject, id: uniqueId };
  });

  return tableObject;
};

const convertDataToCalendar = (data) => {
  const daysOfWeek = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];

  const calendarObject = data
    .filter(subArray => subArray.time && subArray.time.trim() !== '') // Only process objects with a 'time' property
    .map((subArray) => {
      const time = subArray.time.split('-');
      const startTime = time[0].split(':');
      const endTime = time[1].split(':');

      const now = new Date();
      const dayIndex = daysOfWeek.indexOf(subArray.day.toLowerCase());
      const targetDate = new Date();
      const diff = dayIndex - now.getDay();
      targetDate.setDate(now.getDate() + diff);
      const location = subArray.location ? `\n${subArray.location}` : '';

      let newObject = {
        id: subArray.id,
        title: `(#${subArray.course}) ${subArray.name} (${subArray.type})${location}\n${subArray.comment}`,
        start: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), parseInt(startTime[0]), parseInt(startTime[1]), 0),
        end: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), parseInt(endTime[0]), parseInt(endTime[1]), 0),
      };

    return newObject;
  });

  return calendarObject;
};

export { convertDataToCalendar, convertDataToTable };