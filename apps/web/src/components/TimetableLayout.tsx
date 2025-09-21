import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import OwnCalendar from '../calendars/OwnCalendar';
import ResultsCalendar from '../calendars/ResultsCalendar';
import ViewOnlyCalendar from '../calendars/ViewOnlyCalendar';
import Results from '../Results';
import Search from '../Search';
import EditEvent from '../EditEvent';
import useDownloadImage from '../utils/image';
import { useSearchResults, useLessonOperations, useLessonHistory, useKeyboardShortcuts } from '../hooks';
import { useTimetableContext } from '../contexts';
import { handleUrlExport } from '../utils/exportUtils';
import { Course, SearchData } from '../utils/data';

interface TimetableLayoutProps {
    viewOnly: boolean;
}

const TimetableLayout: React.FC<TimetableLayoutProps> = ({ viewOnly }) => {
    const { savedLessons, setSavedLessons, setSearchQuery, setSelectedCourses } = useTimetableContext();

    const { searchResults, isLoading, dataUpdatedAt } = useSearchResults();
    const { editEvent, setEditEvent, handleLessonSave, handleCalendarClick, handleEventChange } = useLessonOperations();
    const { canUndo, canRedo, undo, redo } = useLessonHistory();
    const handleDownloadImage = useDownloadImage();

    const handleSearch = (data: SearchData, courses?: Course[]) => {
        setSearchQuery(data);
        setSelectedCourses(courses);
    };

    const handleCalendarClickWrapper = (id: number) => {
        handleCalendarClick(id, searchResults);
    };

    const handleUrlExportWrapper = async () => {
        await handleUrlExport(savedLessons);
    };

    const handleUndo = () => {
        const newLessons = undo();
        if (newLessons) {
            window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(newLessons));
            setSavedLessons(newLessons);
        }
    };

    const handleRedo = () => {
        const newLessons = redo();
        if (newLessons) {
            window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(newLessons));
            setSavedLessons(newLessons);
        }
    };

    useKeyboardShortcuts({
        onUndo: handleUndo,
        onRedo: handleRedo,
        enabled: !viewOnly,
    });

    return (
        <>
            <Box component="main" sx={{ flex: 1, mt: 0 }} p={{ xs: 1, sm: 2, md: 4 }}>
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
                                    onEventClick={handleCalendarClickWrapper}
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
                                        onUrlExport={handleUrlExportWrapper}
                                        onImageDownload={handleDownloadImage}
                                        onEventEdit={setEditEvent}
                                        canUndo={canUndo}
                                        canRedo={canRedo}
                                        undo={handleUndo}
                                        redo={handleRedo}
                                    />
                                ) : (
                                    <ViewOnlyCalendar
                                        lessons={savedLessons}
                                        onUrlExport={handleUrlExportWrapper}
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
        </>
    );
};

export default TimetableLayout;
