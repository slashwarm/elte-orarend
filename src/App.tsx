import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { useMemo, useState } from 'react';
import OwnCalendar from './calendars/OwnCalendar';
import ResultsCalendar from './calendars/ResultsCalendar';
import ViewOnlyCalendar from './calendars/ViewOnlyCalendar';
import EditEvent from './EditEvent';
import Results from './Results';
import Search from './Search';
import { convertDataToTable, Course, Data, fetchTimetable, SearchData, generateUniqueId, Lesson } from './utils/data';
import { decodeLessonsFromSearchParam, encodeLessonsToSearchParam } from './utils/encoder';
import Footer from './components/Footer';
import useDownloadImage from './utils/image';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

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

    // Ha vannak a URL-ben órák, akkor azokat töltse be, különben ha van elmentve órarend azt, különben üres.
    const storageTimetable = useMemo(
        () => (savedTimetable ? readStoredTimetable(savedTimetable) : null),
        [savedTimetable],
    );
    const urlTimetable = useMemo(
        () => (lessonsUrlParam ? decodeLessonsFromSearchParam(lessonsUrlParam) : null),
        [lessonsUrlParam],
    );
    const handleDownloadImage = useDownloadImage();
    const timetable = urlTimetable ?? storageTimetable ?? [];

    // view only, akkor ha az órarend tartalmát nem lehet megváltoztatni, mert megosztott órarendet nézünk
    const viewOnly = urlTimetable !== null;

    const [searchQuery, setSearchQuery] = useState<SearchData>(); // keresési paraméterek
    const [selectedCourses, setSelectedCourses] = useState<Course[]>(); // kiválasztott kurzusok
    const [savedLessons, setSavedLessons] = useState(timetable); // saját órarend
    const [editEvent, setEditEvent] = useState<number | null>(null); // szerkesztendő esemény

    const { isLoading, dataUpdatedAt, data } = useQuery<Data>({
        queryKey: ['results', searchQuery],
        staleTime: 1000 * 60 * 45, // 45 perc
        gcTime: 1000 * 60 * 10, // 10 perc
        queryFn: () => fetchTimetable(searchQuery),
        enabled: Boolean(searchQuery),
    });

    const searchResults = useMemo<Lesson[]>(() => {
        if (!data) {
            return [];
        }
        return convertDataToTable(data, selectedCourses) ?? [];
    }, [data, selectedCourses]);

    const handleSearch = (data: SearchData, courses?: Course[]) => {
        setSearchQuery(data);
        setSelectedCourses(courses);
    };

    const handleLessonSave = (data: Lesson) => {
        const existingLesson = savedLessons.find((lesson) => lesson.id === data.id);
        let newLessons;

        if (existingLesson) {
            newLessons = savedLessons.filter((lesson) => lesson.id !== data.id);
            toast.success('Kurzus eltávolítva az órarendből ✨');
        } else {
            newLessons = [...savedLessons, data];
            toast.success('Kurzus hozzáadva a saját órarendhez ✨');
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
                toast.success('Kurzus módosítva ✨');
            } else {
                handleLessonSave(data);
            }
        }
    };

    const handleUrlExport = async () => {
        const url = new URL(window.location.toString());

        url.searchParams.delete('lessons');
        url.searchParams.append('lessons', encodeLessonsToSearchParam(savedLessons));

        await navigator.clipboard.writeText(url.toString());

        toast.success('URL kimásolva a vágólapra ✨');
    };

    return (
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
                                    <Search onSubmit={handleSearch} isLoading={isLoading} />
                                </Paper>
                            </Grid>
                        )}
                        {dataUpdatedAt !== 0 && !viewOnly && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2 }}>
                                    <Results
                                        tableData={searchResults}
                                        onLessonSave={handleLessonSave}
                                        savedLessons={savedLessons}
                                        isLoading={isLoading}
                                        own={false}
                                    />
                                </Paper>
                            </Grid>
                        )}

                        {dataUpdatedAt !== 0 && !viewOnly && (
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
                                        isLoading={isLoading}
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
                                    ) : (
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
                    <Footer />
                </Box>
            </Box>
        </Box>
    );
};

export default App;
