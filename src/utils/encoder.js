import LZString from "lz-string";
import { generateUniqueId, getTeacherFromComment } from "./Data.jsx";

// URL-be lesson-ök encodolása

// Link megosztáskor az egész órarend tartalma belekerül az URL lessons paraméterébe valamennyire tömörítve
export function decodeLessonsFromSearchParam(param){
    function isInteger(str) {
      return /^(0|[1-9]\d*)$/.test(str);
    }
  
    const parts = LZString.decompressFromEncodedURIComponent(param).split("🔩");
  
    let returned = [];
  
    for (let i = 0; i < parts.length; i+= 8){
      let lesson = {};
  
      lesson.code = isInteger(parts[i]) ? returned[Number(parts[i])].code : parts[i];
      lesson.comment = isInteger(parts[i+1]) ? returned[Number(parts[i+1])].comment : parts[i+1];
      lesson.course = parts[i+2];
      switch (parts[i+3]){
        case "H":
          lesson.day = "Hétfő";
          break;
        case "K":
          lesson.day = "Kedd";
          break;
        case "S":
          lesson.day = "Szerda";
          break;
        case "C":
          lesson.day = "Csütörtök";
          break;
        case "P":
          lesson.day = "Péntek";
          break;
        case "": // Néha nincsen nap
          lesson.day = "";
          break;
        default:
          console.error(`Invalid nap ${parts[i+3]}`);
      }
  
      lesson.location = isInteger(parts[i+4]) ? returned[Number(parts[i+4])].location : parts[i+4];
      lesson.name = isInteger(parts[i+5]) ? returned[Number(parts[i+5])].name : parts[i+5];
      lesson.teacher = getTeacherFromComment(lesson.comment);
  
      // Néha nincs időpont
      const time = parts[i+6] === "" ? "" : `${parts[i+6].slice(0,2)}:${parts[i+6].slice(2,4)}-${parts[i+6].slice(4,6)}:${parts[i+6].slice(6)}`;
  
      lesson.time = time.startsWith("0") ? time.slice(1) : time;
  
      switch (parts[i+7]){
        case "e":
          lesson.type = "előadás";
          break;
        case "g":
          lesson.type = "gyakorlat";
          break;
        case "e":
          lesson.type = "elfoglaltság";
          break;
        case "k":
          lesson.type = "konzultáció";
          break;
        default:
          console.error("Lehetetlen típus");
      };
  
      const id = generateUniqueId(lesson);
      lesson.id = id;
  
      returned.push(lesson);
    }
    return returned;
  }
  
export function encodeLessonsToSearchParam(lessons){
    // A 🔩-t egy seperátorként használom, mert valószínűtlen, hogy bármilyen kurzusnak vagy tanárnak a nevében szerepelne
    let parts = [];

    let pastCodes = new Map();
    let pastNames = new Map();
    let pastComments = new Map();
    let pastLocations = new Map();

    for (let i = 0; i < lessons.length; i++){
        const lesson = lessons[i];

        if (pastCodes.has(lesson.code)){
        parts.push(pastCodes.get(lesson.code))
        } else {
        parts.push(lesson.code);
        pastCodes.set(lesson.code, i);
        }

        if (pastComments.has(lesson.comment)){
        parts.push(pastComments.get(lesson.comment))
        } else {
        parts.push(lesson.comment);
        pastComments.set(lesson.comment, i);
        }
        
        parts.push(lesson.course);
        parts.push(lesson.day[0]);

        if (pastLocations.has(lesson.location)){
        parts.push(pastLocations.get(lesson.location))
        } else {
        parts.push(lesson.location);
        pastLocations.set(lesson.location, i);
        }

        if (pastNames.has(lesson.name)){
        parts.push(pastNames.get(lesson.name))
        } else {
        parts.push(lesson.name);
        pastNames.set(lesson.name, i);
        }
        
        const time = lesson.time.padStart(11,"0");
        parts.push(`${time.slice(0,2)}${time.slice(3,5)}${time.slice(6,8)}${time.slice(9)}`);
        parts.push(lesson.type[0]);
    }

    return LZString.compressToEncodedURIComponent(parts.join("🔩"));
}
