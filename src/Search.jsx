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
import LoadingButton from '@mui/lab/LoadingButton';
import axios from "axios";

const labelOptions = {
  subjectName: 'Tárgy neve',
  subjectCode: 'Tárgy kódja',
  teacherName: 'Oktató neve',
  teacherCode: 'Oktató Neptun-kódja',
};

const labelIcons = {
  subjectName: <LibraryBooksIcon />,
  subjectCode: <LibraryBooksIcon />,
  teacherName: <SwitchAccountIcon />,
  teacherCode: <SwitchAccountIcon />,
};

const getSemesters = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const semesters = [];
  let prevSemester = 0;

  if (currentMonth < 6) { // tavaszi félév
    semesters.push(`${currentYear - 1}-${currentYear}-2`);
    prevSemester = 1;
  } else { // őszi félév
    semesters.push(`${currentYear}-${currentYear + 1}-1`);
    prevSemester = 2;
  }

  const len = semesters.length;
  let year = currentYear;

  // TODO: kispaghettizés
  for (let i = 0; i < 3 - len; i++) { // kiegészítjük régebbi félévekkel
    year--;

    if (prevSemester === 1) {
      semesters.push(`${year}-${year + 1}-1`);
      prevSemester = 2;
    } else {
      semesters.push(`${year}-${year + 1}-2`);
      prevSemester = 1;
    }
  }

  return semesters;
}

const Search = ({ onLoadingStart, onDataFetch, isLoading }) => {
  const semesters = getSemesters();
  const [year, setYear] = useState(semesters[0]);
  const [mode, setMode] = useState('subjectName');
  const [error, setError] = useState(false);

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

  const handleSubmit = (event) => {
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

    if (error) { // régi errort nullázzuk
      setError(false);
    }

    onLoadingStart();

    axios
      .post("/server/data.php", formData)
      .then((response) => {
        onDataFetch(response.data);
      })
      .catch((error) => {
        if (error.response) {
          console.error(error.response);
          console.error("Server response error");
        } else if (error.request) {
          console.error("Network error");
        } else {
          console.error(error);
        }
    });
  };

  return (
    <Fragment>
      <Box component="form" onSubmit={handleSubmit} noValidate spacing={2}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" component="h2">Keresés</Typography>
          <TextField
            margin="normal"
            fullWidth
            id="name"
            InputProps={{
              startAdornment:
              <InputAdornment position="start">
                {labelIcons[mode]}
              </InputAdornment>,
            }}
            label={labelOptions[mode]}
            name="name"
            error={error}
            helperText={error ? 'Hibás bemenet.' : ''}
          />

          <ToggleButtonGroup
            size="small"
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
            <Alert severity="warning">Figyelem! Nem az éppen aktuális félév van kiválasztva!</Alert>
          )}

          <ToggleButtonGroup
            size="small"
            value={mode}
            onChange={changeMode}
            exclusive={true}
          >
            <ToggleButton value="subjectName" key="subjectName">
              Keresés tárgynévre
            </ToggleButton>
            <ToggleButton value="subjectCode" key="subjectCode">
              Keresés tárgykódra
            </ToggleButton>
            <ToggleButton value="teacherName" key="teacherName">
              Keresés oktató nevére
            </ToggleButton>
            <ToggleButton value="teacherCode" key="teacherCode">
              Keresés oktató Neptun-kódjára
            </ToggleButton>
          </ToggleButtonGroup>

          <LoadingButton
            loading={isLoading}
            loadingPosition="start"
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
          >
            Keresés
          </LoadingButton>
        </Stack>
      </Box>
    </Fragment>
  );
};

export default Search;