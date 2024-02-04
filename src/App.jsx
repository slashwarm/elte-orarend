// App.jsx
import { useState, useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { huHU } from '@mui/material/locale';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import html2canvas from 'html2canvas';
import Search from './Search';
import Results from './Results';
import Calendar from './Calendar';
import { convertDataToTable, convertDataToCalendar } from './Data';

function Copyright(props) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="8px"
    >
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
  huHU,
});

const App = () => {
  const storageTimetable = window.localStorage.getItem('SAVE_TIMETABLE');
  const savedTimetable = storageTimetable ? JSON.parse(storageTimetable) : [];

  const [firstSearchDone, setFirstSearchDone] = useState(false); // első keresés
  const [loading, setLoading] = useState(false); // töltés
  const [searchResults, setSearchResults] = useState([]); // keresés találatok
  const [savedLessons, setSavedLessons] = useState(savedTimetable); // saját órarend
  const printRef = useRef();

  const handleDataFetch = (data) => {
    const convertedData = convertDataToTable(data);

    setSearchResults(convertedData);
    setLoading(false);

    if (!firstSearchDone) {
      setFirstSearchDone(true);
    }
  };

  const handleLessonSave = (data) => {
    const existingLesson = savedLessons.find(lesson => lesson.id === data.id);
    let newLessons = savedLessons;

    if (existingLesson) {
      newLessons = savedLessons.filter(lesson => lesson.id !== data.id);
    } else {
      newLessons = [...savedLessons, data];
    }

    window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(newLessons));
    setSavedLessons(newLessons);
  };

  const handleLoadingStart = () => {
    setLoading(true);
  }

  const handleDownloadImage = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      ignoreElements: (element) => {
        if (element.tagName === 'BUTTON') {
          return true;
        }
      },
      backgroundColor: null,
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

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box display="flex" minHeight="100vh">
        <CssBaseline />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box component="main" sx={{ flex: 1, py: 4, px: 4 }}>
            <Grid
              container
              direction="column" // Set direction to "column"
              spacing={2}
              justify="center"
              alignContent="center"
            >
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Paper sx={{ p: 2, maxWidth: 800, margin: 'auto', overflow: 'hidden' }}>
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
                  />
                </Paper>
              </Grid>
              )}
              {firstSearchDone && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Calendar
                      tableData={convertDataToCalendar(searchResults)}
                      onLessonSave={handleLessonSave}
                    />
                  </Paper>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="h5" component="h2">
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
                  />
                </Paper>
              </Grid>
              {savedLessons.length > 0 && (
                <Grid item xs={12}>
                  <div ref={printRef}>
                    <Paper sx={{ p: 2 }}>
                      <div>
                        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ mb: 2 }} onClick={handleDownloadImage}>
                          Mentés képként
                        </Button>
                      </div>

                      <Calendar
                        tableData={convertDataToCalendar(savedLessons)}
                        onLessonSave={handleLessonSave}
                      />
                    </Paper>
                  </div>
                </Grid>
              )}
            </Grid>
          </Box>

          <Box component="footer" sx={{ p: 2 }}>
            <Copyright />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;