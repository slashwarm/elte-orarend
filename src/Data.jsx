import CRC32 from 'crc-32';

const convertDataToTable = (data) => {
  const tableObject = data.map((subArray) => {
    let time = subArray[2].split(' ');

    if (time[0] === "Hétfo") {
      time[0] = "Hétfő";
    }

    let newObject = {
      name: subArray[0],
      code: subArray[1],
      day: time[0],
      time: time[1],
      location: subArray[3],
      comment: subArray[5],
      type: subArray[6],
      course: subArray[7],
      teacher: subArray[11],
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
      targetDate.setDate(now.getDate() + (diff < 0 ? diff + 7 : diff) - 7);
      const location = subArray.location ? `\n${subArray.location}` : '';

      let newObject = {
        id: subArray.id,
        title: `(#${subArray.course}) ${subArray.name} (${subArray.type})${location}\n${subArray.teacher}`,
        start: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), parseInt(startTime[0]), parseInt(startTime[1]), 0),
        end: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), parseInt(endTime[0]), parseInt(endTime[1]), 0),
      };

    return newObject;
  });

  return calendarObject;
};

export { convertDataToCalendar, convertDataToTable };