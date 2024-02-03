import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinkIcon from '@mui/icons-material/Link';
import Button from '@mui/material/Button';

const Login = () => {
  return (
    <React.Fragment>
      <Box component="form" noValidate spacing={2}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" component="h2">Neptun csatlakozás</Typography>
          <Typography variant="body1" align="justify">
            Lehetőséged van Neptun fiók csatlakoztatására az oldalhoz.
            Ez automatikusan betölti a felvett kurzusaidhoz tartozó adatokat a TO adatbázisból. Az adatokat nem tároljuk.
          </Typography>
          <Button variant="contained" startIcon={<LinkIcon />}>
            Neptun párosítása
          </Button>
        </Stack>
      </Box>
    </React.Fragment>
  );
};

export default Login;