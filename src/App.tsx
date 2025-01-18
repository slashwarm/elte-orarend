import GitHubIcon from '@mui/icons-material/GitHub';
import { PaletteMode, SnackbarCloseReason } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import html2canvas from 'html2canvas';
import { useMemo, useState } from 'react';
import OwnCalendar from './Calendars/OwnCalendar';
import ResultsCalendar from './Calendars/ResultsCalendar';
import ViewOnlyCalendar from './Calendars/ViewOnlyCalendar';
import EditEvent from './EditEvent';
import Results from './Results';
import Search from './Search';
import Alert from './utils/Alert';
import { convertDataToTable, Course, Data, generateUniqueId, Lesson } from './utils/Data';
import { decodeLessonsFromSearchParam, encodeLessonsToSearchParam } from './utils/encoder';
import useDynamicTheme from './utils/theme';

function Copyright(props:{}) {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap="8px">
            <Typography variant="body2" color="text.secondary" align="center" {...props}>
                Készült ❤️-el és sok ☕-al az ELTE-n.
            </Typography>

            <IconButton aria-label="github" href="https://github.com/slashwarm/elte-orarend">
                <GitHubIcon />
            </IconButton>
        </Box>
    );
}

const readStoredTimetable = (storageTimetable: string) => {
    let save = false;
    const timetable: Lesson[] = JSON.parse(storageTimetable);
    const updatedTimetable = timetable.map((lesson) => {
        if (!lesson.newId) {
            save = true;
            return {
                ...lesson,
                newId: true,
                id: generateUniqueId({
                    name: lesson.name,
                    code: lesson.code,
                    day: lesson.day,
                    time: lesson.time,
                    location: lesson.location,
                    type: lesson.type,
                    course: lesson.course,
                    teacher: lesson.teacher,
                    comment: lesson.comment,
                }),
            };
        }
        return lesson;
    });

    if (save) {
        window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(updatedTimetable));
    }

    return updatedTimetable;
};

const App: React.FC = () => {
    const url = new URL(window.location.toString());
    const lessonsUrlParam = url.searchParams.get('lessons');
    const savedTimetable = window.localStorage.getItem('SAVE_TIMETABLE');
    const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme: PaletteMode = localStorage.getItem('theme') as PaletteMode;

    // Ha vannak a URL-ben órák, akkor azokat töltse be, különben ha van elmentve órarend azt, különben üres.
    const storageTimetable = useMemo(
        () => (savedTimetable ? readStoredTimetable(savedTimetable) : null),
        [savedTimetable],
    );
    const urlTimetable = useMemo(
        () => (lessonsUrlParam ? decodeLessonsFromSearchParam(lessonsUrlParam) : null),
        [lessonsUrlParam],
    );
    const timetable = urlTimetable ?? storageTimetable ?? [];

    // view only, akkor ha az órarend tartalmát nem lehet megváltoztatni, mert megosztott órarendet nézünk
    const viewOnly = urlTimetable !== null;

    const [firstSearchDone, setFirstSearchDone] = useState(false); // első keresés
    const [loading, setLoading] = useState(false); // töltés
    const [searchResults, setSearchResults] = useState<Lesson[]>([]); // keresés találatok
    const [savedLessons, setSavedLessons] = useState(timetable); // saját órarend
    const [alertText, setAlertText] = useState(''); // alert szöveg
    const [editEvent, setEditEvent] = useState<number | null>(null!); // szerkesztendő esemény
    const [colorScheme, setColorScheme] = useState<PaletteMode>(savedTheme ?? (themePreference.matches ? 'dark' : 'light'));
    themePreference.addEventListener('change', (event) => setColorScheme(event.matches ? 'dark' : 'light'));
    const theme = useDynamicTheme(colorScheme);

    console.log(savedLessons);
    // ha van courses akkor minden sor data-hoz csekkeli h az ahhoz tartozó code benne van-e
    const handleDataFetch = (data: Data, courses?: Course[]) => {
        const convertedData = convertDataToTable(data, courses);

        setSearchResults(convertedData);
        setLoading(false);

        if (!firstSearchDone) {
            setFirstSearchDone(true);
        }
    };

    const handleLessonSave = (data: Lesson) => {
        const existingLesson = savedLessons.find((lesson) => lesson.id === data.id);
        let newLessons;

        if (existingLesson) {
            newLessons = savedLessons.filter((lesson) => lesson.id !== data.id);
            setAlertText('Kurzus eltávolítva az órarendből');
        } else {
            newLessons = [...savedLessons, data];
            setAlertText('Kurzus hozzáadva a saját órarendhez');
        }

        window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(newLessons));
        setSavedLessons(newLessons);
    };

    const handleCalendarClick = (id: number) => {
        const lesson = savedLessons.concat(searchResults).find((lesson) => lesson.id === id) as Lesson;
        handleLessonSave(lesson);
    };

    const handleEventChange = (data: Lesson, toDelete?: boolean): void => {
        if (toDelete) {
            handleLessonSave(data);
        } else {
            const existingLesson = savedLessons.find((lesson) => lesson.id === data.id);

            if (existingLesson) {
                const updatedLesson = {
                    ...existingLesson,
                    ...data,
                    edited: true,
                };

                const updatedLessons = savedLessons.map((lesson) => {
                    if (lesson.id === data.id) {
                        return updatedLesson;
                    }
                    return lesson;
                });

                window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(updatedLessons));
                setSavedLessons(updatedLessons);
            } else {
                handleLessonSave(data);
            }
        }
    };

    const handleLoadingStart = () => {
        setLoading(true);
    };

    const handleDownloadImage = async (ref: React.MutableRefObject<HTMLElement>) => {
        const backgroundColor = theme.palette.background.default;
        const element = ref.current;
        const canvas = await html2canvas(element, {
            backgroundColor: backgroundColor,
        });

        const data = canvas.toDataURL('image/png');
        const link = document.createElement('a');

        if (typeof link.download === 'string') {
            link.href = data;
            link.download = 'orarend.png';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            window.open(data);
        }
    };

    const handleUrlExport = async () => {
        const url = new URL(window.location.toString());

        url.searchParams.delete('lessons');
        url.searchParams.append('lessons', encodeLessonsToSearchParam(savedLessons));

        await navigator.clipboard.writeText(url.toString());

        setAlertText('URL sikeresen kimásolva!');
    };

    const handleClose = (event: React.SyntheticEvent<any> | Event, reason: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }

        setAlertText('');
    };

    const handleThemeChange = () => {
        const nextTheme = colorScheme === 'light' ? 'dark' : 'light';
        window.localStorage.setItem('theme', nextTheme);
        setColorScheme(nextTheme);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box display="flex" minHeight="100vh">
                <CssBaseline />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                    <Box component="main" sx={{ flex: 1 }} p={{ xs: 1, sm: 2, md: 4 }}>
                        <Grid container direction="column" spacing={2} alignContent="center">
                            {!viewOnly && (
                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            maxWidth: 700,
                                            margin: 'auto',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Search
                                            onDataFetch={handleDataFetch}
                                            onLoadingStart={handleLoadingStart}
                                            onThemeChange={handleThemeChange}
                                            isLoading={loading}
                                        />
                                    </Paper>
                                </Grid>
                            )}
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
                                        <ResultsCalendar
                                            lessonsResults={searchResults}
                                            ownLessons={savedLessons}
                                            onEventClick={handleCalendarClick}
                                        />
                                    </Paper>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="h5" component="h2">
                                    {viewOnly ? 'A velem megosztott órarend' : 'Saját órarendem'}
                                </Typography>

                                <Divider />
                            </Grid>
                            {!viewOnly && (
                                <Grid item xs={12}>
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
                                </Grid>
                            )}
                            {savedLessons.length > 0 && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2 }}>
                                        {!viewOnly ? (
                                            <OwnCalendar
                                                lessons={savedLessons}
                                                onUrlExport={handleUrlExport}
                                                onImageDownload={handleDownloadImage}
                                                onEventEdit={setEditEvent}
                                            />
                                        ) :
                                        (
                                            <ViewOnlyCalendar
                                                lessons={savedLessons}
                                                onUrlExport={handleUrlExport}
                                                onImageDownload={handleDownloadImage}
                                            />
                                        )}
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
