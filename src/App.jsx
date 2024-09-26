import GitHubIcon from '@mui/icons-material/GitHub';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { huHU } from '@mui/material/locale';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import Calendar from './Calendar';
import EditEvent from './EditEvent';
import Results from './Results';
import Search from './Search';
import Alert from './utils/Alert.jsx';
import { convertDataToCalendar, convertDataToTable } from './utils/Data.jsx';
import { decodeLessonsFromSearchParam, encodeLessonsToSearchParam } from './utils/encoder.js';

function Copyright(props) {
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

const defaultTheme = createTheme({
    palette: {
        mode: 'dark',
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
                    width: '100%',
                    maxWidth: '100vw !important',
                },
            },
        },
    },
    huHU,
});

const App = () => {
    const url = new URL(window.location);
    const storageTimetable = window.localStorage.getItem('SAVE_TIMETABLE');
    const urlTimetable = url.searchParams.has('lessons')
        ? decodeLessonsFromSearchParam(url.searchParams.get('lessons'))
        : null;

    // Ha vannak a URL-ben órák, akkor azokat töltse be, különben ha van elmentve órarend azt, különben üres.
    const savedTimetable = urlTimetable ? urlTimetable : storageTimetable ? JSON.parse(storageTimetable) : [];

    // view only, akkor ha az órarend tartalmát nem lehet megváltoztatni, mert megosztott órarendet nézünk
    let viewOnly = urlTimetable !== null;

    const [firstSearchDone, setFirstSearchDone] = useState(false); // első keresés
    const [loading, setLoading] = useState(false); // töltés
    const [searchResults, setSearchResults] = useState([]); // keresés találatok
    const [savedLessons, setSavedLessons] = useState(savedTimetable); // saját órarend
    const [alertText, setAlertText] = useState(''); // alert szöveg
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
            setAlertText('Kurzus eltávolítva az órarendből');
        } else {
            newLessons = [...savedLessons, data];
            setAlertText('Kurzus hozzáadva a saját órarendhez');
        }

        window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(newLessons));
        setSavedLessons(newLessons);
    };

    const handleCalendarClick = (id) => {
        const lesson = savedLessons.concat(searchResults).find((lesson) => lesson.id === id);
        handleLessonSave(lesson);
    };

    const handleEventChange = (data, toDelete) => {
        if (toDelete) {
            handleLessonSave(data);
        } else {
            const existingLesson = savedLessons.find((lesson) => lesson.id === data.id);

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

    const handleDownloadImage = async (ref) => {
        const backgroundColor = defaultTheme.palette.background.default;
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
        const url = new URL(window.location);

        url.searchParams.delete('lessons');
        url.searchParams.append('lessons', encodeLessonsToSearchParam(savedLessons));

        await navigator.clipboard.writeText(url.toString());

        setAlertText('URL sikeresen kimásolva!');
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setAlertText('');
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box display="flex" minHeight="100vh">
                <CssBaseline />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                    <Box component="main" sx={{ flex: 1 }} p={{ xs: 1, sm: 2, md: 4 }}>
                        <Grid container direction="column" spacing={2} justify="center" alignContent="center">
                            {!viewOnly && (
                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            maxWidth: 1000,
                                            margin: 'auto',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Search
                                            onDataFetch={handleDataFetch}
                                            onLoadingStart={handleLoadingStart}
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
