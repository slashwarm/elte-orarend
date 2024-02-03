// App.jsx
import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { huHU } from '@mui/material/locale';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Search from './Search';
import Results from './Results';
import Calendar from './Calendar';
import Login from './Login';
import convertDataToTable from './Data';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      Készült ❤️-el és sok ☕-al az ELTE-n.
    </Typography>
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
  const [loading, setLoading] = useState(false); // töltés
  const [searchResults, setSearchResults] = useState([]); // keresés találatok
  const [savedLessons, setSavedLessons] = useState([]); // saját órarend

  const handleDataFetch = (data) => {
    setSearchResults(convertDataToTable(data));
    setLoading(false);
  };

  const handleLessonSave = (data) => {
    setSavedLessons((savedLessons) => [...savedLessons, data]);
  };

  const handleLoadingStart = () => {
    setLoading(true);
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        display="flex"
        minHeight="100vh"
      >
        <CssBaseline />
        <Box
          component="main"
          justifyContent="center"
          alignItems="center"
          sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Container sx={{ mt: 4, mb: 4 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Search
                    onDataFetch={handleDataFetch}
                    onLoadingStart={handleLoadingStart}
                    isLoading={loading}
                  />
                </Paper>
              </Grid>
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
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Calendar />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Login />
                </Paper>
              </Grid>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;