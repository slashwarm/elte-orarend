import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import RefreshIcon from '@mui/icons-material/Refresh';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OwnCalendar from '../calendars/OwnCalendar';
import ResultsCalendar from '../calendars/ResultsCalendar';
import ViewOnlyCalendar from '../calendars/ViewOnlyCalendar';
import Results from '../Results';
import Search from '../Search';
import EditEvent from '../EditEvent';
import InfoBox from './InfoBox';
import useDownloadImage from '../utils/image';
import { useSearchResults, useLessonOperations, useLessonHistory, useKeyboardShortcuts } from '../hooks';
import { useTimetableContext } from '../contexts';
import { handleUrlExport } from '../utils/exportUtils';
import { SPACING } from '../utils/spacing';
import { Course, SearchData } from '../utils/data';

interface TimetableLayoutProps {
    viewOnly: boolean;
}

const TimetableLayout: React.FC<TimetableLayoutProps> = ({ viewOnly }) => {
    const { savedLessons, setSavedLessons, setSearchQuery, setSelectedCourses } = useTimetableContext();

    const { searchResults, isLoading, isError, error, refetch, dataUpdatedAt } = useSearchResults();
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
            <Box
                component="main"
                sx={{
                    p: SPACING.page,
                    flex: 1,
                }}
            >
                <Stack spacing={SPACING.loose}>
                    <InfoBox />
                    {!viewOnly && (
                        <Paper
                            sx={{
                                p: SPACING.base,
                                maxWidth: 700,
                                width: '100%',
                                alignSelf: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <Search onSubmit={handleSearch} isLoading={isLoading} />
                        </Paper>
                    )}
                    {!viewOnly && isError && (
                        <Alert
                            severity="error"
                            role="alert"
                            sx={{ maxWidth: 700, width: '100%', alignSelf: 'center' }}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={() => refetch()}
                                    disabled={isLoading}
                                    aria-label="Keresés újrapróbálása"
                                >
                                    Újra
                                </Button>
                            }
                        >
                            <AlertTitle>A keresés nem sikerült</AlertTitle>
                            {error?.message}
                        </Alert>
                    )}
                    {dataUpdatedAt !== 0 && !viewOnly && (
                        <Paper sx={{ p: SPACING.base }}>
                            <Results
                                tableData={searchResults}
                                onLessonSave={handleLessonSave}
                                savedLessons={savedLessons}
                                isLoading={isLoading}
                                own={false}
                            />
                        </Paper>
                    )}

                    {dataUpdatedAt !== 0 && !viewOnly && (
                        <Paper sx={{ p: SPACING.base }}>
                            <ResultsCalendar
                                lessonsResults={searchResults}
                                ownLessons={savedLessons}
                                onEventClick={handleCalendarClickWrapper}
                            />
                        </Paper>
                    )}

                    <Box>
                        <Typography variant="h5" component="h2">
                            {viewOnly ? 'A velem megosztott órarend' : 'Saját órarendem'}
                        </Typography>

                        <Divider />
                    </Box>
                    {!viewOnly && (
                        <Paper sx={{ p: SPACING.base }}>
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
                    )}

                    {savedLessons.length > 0 && (
                        <Paper sx={{ p: SPACING.base }}>
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
                    )}
                </Stack>
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
