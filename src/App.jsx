// App.jsx
import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { huHU } from '@mui/material/locale';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import GitHubIcon from '@mui/icons-material/GitHub';
import html2canvas from 'html2canvas';
import Search from './Search';
import Results from './Results';
import Calendar from './Calendar';
import EditEvent from './EditEvent';
import Divider from '@mui/material/Divider';
import { convertDataToTable, convertDataToCalendar } from './Data';

function Copyright(props) {
  return (
    <Box display='flex' flexDirection='column' alignItems='center' gap='8px'>
      <Typography
        variant='body2'
        color='text.secondary'
        align='center'
        {...props}
      >
        Készült ❤️-el és sok ☕-al az ELTE-n.
      </Typography>

      <IconButton
        aria-label='github'
        href='https://github.com/slashwarm/elte-orarend'
      >
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
  huHU,
});

const App = () => {
  const storageTimetable = window.localStorage.getItem('SAVE_TIMETABLE');
  const savedTimetable = storageTimetable ? JSON.parse(storageTimetable) : [];

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
    let newLessons = savedLessons;

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

  const handleCalendarClick = (id, own) => {
    const lesson = (own ? savedLessons : searchResults).find(
      (lesson) => lesson.id === id
    );
    handleLessonSave(lesson);
  };

  const handleEventChange = (data, toDelete) => {
    if (toDelete) {
      handleLessonSave(data);
    } else {
      const existingLesson = savedLessons.find(
        (lesson) => lesson.id === data.id
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
          'SAVE_TIMETABLE',
          JSON.stringify(updatedLessons)
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

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlertText('');
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box display='flex' minHeight='100vh'>
        <CssBaseline />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box component='main' sx={{ flex: 1, py: 4, px: 4 }}>
            <Grid
              container
              direction='column' // Set direction to "column"
              spacing={2}
              justify='center'
              alignContent='center'
            >
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
              {firstSearchDone && (
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
              {firstSearchDone && (
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
                <Typography variant='h5' component='h2'>
                  Saját órarendem
                </Typography>

                <Divider />
              </Grid>
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
              {savedLessons.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Calendar
                      tableData={convertDataToCalendar(savedLessons)}
                      onCalendarClick={handleCalendarClick}
                      onImageDownload={handleDownloadImage}
                      savedLessons={savedLessons}
                      onEventEdit={setEditEvent}
                      own={true}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>

          {editEvent && (
            <EditEvent
              eventId={editEvent}
              savedLessons={savedLessons}
              onEventChange={handleEventChange}
              onEventEdit={setEditEvent}
            />
          )}

          <Box component='footer' sx={{ p: 2 }}>
            <Copyright />
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={alertText !== ''}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert
          severity='success'
          variant='filled'
          onClose={handleClose}
          sx={{ width: '100%' }}
        >
          {alertText}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
