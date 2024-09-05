import GitHubIcon from "@mui/icons-material/GitHub";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { huHU } from "@mui/material/locale";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import html2canvas from "html2canvas";
import LZString from "lz-string";
import { useState } from "react";
import Calendar from "./Calendar";
import EditEvent from "./EditEvent";
import Results from "./Results";
import Search from "./Search";
import Alert from "./utils/Alert.jsx";
import { convertDataToCalendar, convertDataToTable, generateUniqueId, getTeacherFromComment } from "./utils/Data.jsx";

function Copyright(props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap="8px">
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        {...props}
      >
        Készült ❤️-el és sok ☕-al az ELTE-n.
      </Typography>

      <IconButton
        aria-label="github"
        href="https://github.com/slashwarm/elte-orarend"
      >
        <GitHubIcon />
      </IconButton>
    </Box>
  );
}

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    button: {
      fontSize: 14,
      fontWeight: 600,
    },
  },
  components: {
    MuiGrid: {
      styleOverrides: {
        item: {
          width: "100%",
          maxWidth: "100vw !important",
        },
      },
    },
  },
  huHU,
});

// Link megosztáskor az egész órarend tartalma belekerül az URL lessons paraméterébe valamennyire tömörítve
function decodeLessonsFromSearchParam(param){
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

function encodeLessonsToSearchParam(lessons){
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

const App = () => {
  const url = new URL(window.location);
  const storageTimetable = window.localStorage.getItem("SAVE_TIMETABLE");
  const urlTimetable = url.searchParams.has("lessons") ? decodeLessonsFromSearchParam(url.searchParams.get("lessons")) : null;

  // Ha vannak a URL-ben órák, akkor azokat töltse be, különben ha van elmentve órarend azt, különben üres.
  const savedTimetable = urlTimetable ? urlTimetable 
                                      : storageTimetable ? JSON.parse(storageTimetable) 
                                                         : [];

  // view only, akkor ha az órarend tartalmát nem lehet megváltoztatni, mert megosztott órarendet nézünk
  let viewOnly = urlTimetable !== null;

  const [firstSearchDone, setFirstSearchDone] = useState(false); // első keresés
  const [loading, setLoading] = useState(false); // töltés
  const [searchResults, setSearchResults] = useState([]); // keresés találatok
  const [savedLessons, setSavedLessons] = useState(savedTimetable); // saját órarend
  const [alertText, setAlertText] = useState(""); // alert szöveg
  const [editEvent, setEditEvent] = useState(null); // szerkesztendő esemény

  // ha van courses akkor minden sor data-hoz csekkeli h az ahhoz tartozó code benne van-e
  const handleDataFetch = (data, courses) => {
    const convertedData = convertDataToTable(data, courses);

    setSearchResults(convertedData);
    setLoading(false);

    if (!firstSearchDone) {
      setFirstSearchDone(true);
    }
  };

  const handleLessonSave = (data) => {
    const existingLesson = savedLessons.find((lesson) => lesson.id === data.id);
    let newLessons;

    if (existingLesson) {
      newLessons = savedLessons.filter((lesson) => lesson.id !== data.id);
      setAlertText("Kurzus eltávolítva az órarendből");
    } else {
      newLessons = [...savedLessons, data];
      setAlertText("Kurzus hozzáadva a saját órarendhez");
    }

    window.localStorage.setItem("SAVE_TIMETABLE", JSON.stringify(newLessons));
    setSavedLessons(newLessons);
  };

  const handleCalendarClick = (id, own) => {
    const lesson = (own ? savedLessons : searchResults).find(
      (lesson) => lesson.id === id,
    );
    handleLessonSave(lesson);
  };

  const handleEventChange = (data, toDelete) => {
    if (toDelete) {
      handleLessonSave(data);
    } else {
      const existingLesson = savedLessons.find(
        (lesson) => lesson.id === data.id,
      );

      if (existingLesson) {
        const updatedLesson = {
          ...existingLesson,
          ...data,
        };

        const updatedLessons = savedLessons.map((lesson) => {
          if (lesson.id === data.id) {
            return updatedLesson;
          }
          return lesson;
        });

        window.localStorage.setItem(
          "SAVE_TIMETABLE",
          JSON.stringify(updatedLessons),
        );
        setSavedLessons(updatedLessons);
      } else {
        handleLessonSave(data);
      }
    }
  };

  const handleLoadingStart = () => {
    setLoading(true);
  };

  const handleDownloadImage = async (ref) => {
    const backgroundColor = defaultTheme.palette.background.default;
    const element = ref.current;
    const canvas = await html2canvas(element, {
      backgroundColor: backgroundColor,
    });

    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = "orarend.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  const handleUrlExport = async () => {
    const url = new URL(window.location);

    url.searchParams.delete("lessons");
    url.searchParams.append("lessons", encodeLessonsToSearchParam(savedLessons));

    await navigator.clipboard.writeText(url.toString());

    setAlertText("URL sikeresen kimásolva!")
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertText("");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box display="flex" minHeight="100vh">
        <CssBaseline />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box component="main" sx={{ flex: 1 }} p={{ xs: 1, sm: 2, md: 4 }}>
            <Grid
              container
              direction="column"
              spacing={2}
              justify="center"
              alignContent="center"
            >
              {!viewOnly && <Grid item xs={12} sm={6} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: 1000,
                    margin: "auto",
                    overflow: "hidden",
                  }}
                >
                  <Search
                    onDataFetch={handleDataFetch}
                    onLoadingStart={handleLoadingStart}
                    isLoading={loading}
                  />
                </Paper>
              </Grid>}
              {firstSearchDone && !viewOnly && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Results
                      tableData={searchResults}
                      onLessonSave={handleLessonSave}
                      savedLessons={savedLessons}
                      isLoading={loading}
                      own={false}
                    />
                  </Paper>
                </Grid>
              )}
              {firstSearchDone && !viewOnly && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Calendar
                      tableData={convertDataToCalendar(searchResults)}
                      onCalendarClick={handleCalendarClick}
                      savedLessons={savedLessons}
                      own={false}
                    />
                  </Paper>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="h5" component="h2">
                  {viewOnly ? "A velem megosztott órarend": "Saját órarendem" }
                </Typography>

                <Divider />
              </Grid>
              {!viewOnly && <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Results
                    tableData={savedLessons}
                    onLessonSave={handleLessonSave}
                    savedLessons={savedLessons}
                    isLoading={loading}
                    onEventEdit={setEditEvent}
                    onEventChange={handleEventChange}
                    own={true}
                  />
                </Paper>
              </Grid>}
              {savedLessons.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Calendar
                      tableData={convertDataToCalendar(savedLessons)}
                      onCalendarClick={handleCalendarClick}
                      onImageDownload={handleDownloadImage}
                      onURLExport={handleUrlExport}
                      savedLessons={savedLessons}
                      onEventEdit={setEditEvent}
                      own={true}
                      viewOnly={viewOnly}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>

          {!!editEvent && (
            <EditEvent
              eventId={editEvent}
              savedLessons={savedLessons}
              onEventChange={handleEventChange}
              onEventEdit={setEditEvent}
            />
          )}

          <Box component="footer" sx={{ p: 2 }}>
            <Copyright />
          </Box>
        </Box>
      </Box>

      {!!alertText && <Alert alertText={alertText} handleClose={handleClose} />}
    </ThemeProvider>
  );
};

export default App;
