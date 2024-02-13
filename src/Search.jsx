import { Fragment, useState } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import { fetchTimetable, getSemesters } from './Data';
import { read, utils } from 'xlsx';

const labelOptions = {
  subject: 'Tárgy neve / kódja',
  teacher: 'Oktató neve / Neptun-kódja',
};

const labelIcons = {
  subject: <LibraryBooksIcon />,
  teacher: <SwitchAccountIcon />,
};

const Search = ({ onLoadingStart, onDataFetch, isLoading }) => {
  const semesters = getSemesters();

  const [year, setYear] = useState(semesters[0]);
  const [mode, setMode] = useState('subject');
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);

  const changeYear = (event, newAlignment) => {
    if (newAlignment !== null) {
      setYear(newAlignment);
    }
  };

  const changeMode = (event, newAlignment) => {
    if (newAlignment !== null) {
      setMode(newAlignment);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const formData = {
      name: data.get('name'),
      year: year,
      mode: mode,
    };

    if (!formData.name) {
      setError(true);
      return;
    }

    if (error) {
      // régi errort nullázzuk
      setError(false);
    }

    onLoadingStart();

    const timetable = await fetchTimetable(formData);
    onDataFetch(timetable);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpload = () => {
    onLoadingStart();
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedData = utils.sheet_to_json(sheet, { header: 1 });

      if (!importedData) {
        onDataFetch([]);
        handleClose();
        return;
      }

      searchImportedData(importedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const searchImportedData = async (data) => {
    if (data.length < 3) {
      onDataFetch([]);
      handleClose();
      return;
    }

    let courses = data.map((subArray) => {
      return { courseCode: subArray[0], courseId: subArray[2] };
    });

    courses.shift(); // fejléc off

    const formData = {
      name: courses.map((x) => x.courseCode),
      year: year,
      mode: 'course',
    };

    const timetable = await fetchTimetable(formData);
    onDataFetch(timetable, courses);
    handleClose();
  };

  return (
    <Fragment>
      <Box component='form' onSubmit={handleSubmit} noValidate spacing={2}>
        <Stack spacing={2} alignItems='center'>
          <Typography variant='h6' component='h2'>
            Keresés
          </Typography>
          <TextField
            margin='normal'
            fullWidth
            id='name'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  {labelIcons[mode]}
                </InputAdornment>
              ),
            }}
            label={labelOptions[mode]}
            name='name'
            error={error}
            helperText={error ? 'Hibás bemenet.' : ''}
          />

          <ToggleButtonGroup
            size='small'
            value={year}
            onChange={changeYear}
            exclusive={true}
          >
            {semesters.map((semester) => (
              <ToggleButton value={semester} key={semester}>
                {semester}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {year !== semesters[0] && (
            <Alert severity='warning'>
              Figyelem! Nem az éppen aktuális félév van kiválasztva!
            </Alert>
          )}

          <ToggleButtonGroup
            size='small'
            value={mode}
            onChange={changeMode}
            exclusive={true}
          >
            <ToggleButton value='subject' key='subject'>
              Keresés tárgyra
            </ToggleButton>
            <ToggleButton value='teacher' key='teacher'>
              Keresés oktatóra
            </ToggleButton>
          </ToggleButtonGroup>

          <LoadingButton
            loading={isLoading}
            loadingPosition='start'
            type='submit'
            variant='contained'
            startIcon={<SearchIcon />}
          >
            Keresés
          </LoadingButton>

          <Button
            variant='outlined'
            startIcon={<CloudDownloadIcon />}
            onClick={handleClickOpen}
          >
            Kurzusok importálása Neptunból
          </Button>
        </Stack>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Felvett kurzuslista táblázat importálása</DialogTitle>
        <DialogContent>
          <Typography variant='body1'>
            <ol>
              <li>Lépj be a Neptun fiókodba</li>
              <li>
                Navigálj a <b>{'Tárgyak → Felvett kurzusok'}</b> menübe
              </li>
              <li>Válassz ki egy félévet</li>
              <li>A táblázat ikonra kattintva töltsd le a kurzuslistát</li>
              <li>Tallózd be a fájlt, majd nyomd meg a Betöltés gombot:</li>
            </ol>
          </Typography>

          <Stack direction='column' spacing={2} alignItems='center'>
            <form>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  type={'file'}
                  inputProps={{ accept: '.xlsx' }}
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={isLoading}
                />
                <Button
                  variant='contained'
                  startIcon={<EventRepeatIcon />}
                  onClick={handleUpload}
                  disabled={isLoading || !file}
                >
                  Betöltés
                </Button>
              </Stack>
            </form>

            <Alert variant='outlined' severity='warning'>
              Neptunban a <b>Felvett kurzusok</b> menüpontban található
              táblázatot töltsd le, ne a Felvett tárgyakban lévőt!
            </Alert>

            <Alert variant='outlined' severity='warning'>
              A kurzusokat a fentebb kiválasztott félévben keresi, kérlek
              ellenőrizd, hogy a félév megfelelően van-e kiválasztva!
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Bezárás</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default Search;
