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

export default convertDataToTable;