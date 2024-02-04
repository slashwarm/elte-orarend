import { Fragment, useState } from 'react';
import Button from '@mui/material/Button';
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
  teacherCode: 'Oktató Neptun kódja',
};

const labelIcons = {
  subjectName: <LibraryBooksIcon />,
  subjectCode: <LibraryBooksIcon />,
  teacherName: <SwitchAccountIcon />,
  teacherCode: <SwitchAccountIcon />,
};

const Search = ({ onLoadingStart, onDataFetch, isLoading }) => {
  const [year, setYear] = useState('2023-2024-2');
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
      .post("https://gernyimark.web.elte.hu/data.php", formData)
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
            <ToggleButton value="2023-2024-2" key="left">
              2023-2024-2
            </ToggleButton>
            <ToggleButton value="2023-2024-1" key="center">
              2023-2024-1
            </ToggleButton>
            <ToggleButton value="2022-2023-2" key="right">
              2022-2023-2
            </ToggleButton>
          </ToggleButtonGroup>

          {year !== '2023-2024-2' && (
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
              Keresés oktató Neptun kódjára
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