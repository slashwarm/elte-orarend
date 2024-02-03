import * as React from 'react';
import { useTheme, styled } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('8:00', 159, 6.0, 24, 4.0),
  createData('9:00', 237, 9.0, 37, 4.3),
  createData('10:00', 262, 16.0, 24, 6.0),
  createData('11:00', 305, 3.7, 67, 4.3),
  createData('12:00', 356, 16.0, 49, 3.9),
  createData('13:00', 356, 16.0, 49, 3.9),
  createData('14:00', 356, 16.0, 49, 3.9),
  createData('15:00', 356, 16.0, 49, 3.9),
  createData('16:00', 356, 16.0, 49, 3.9),
  createData('17:00', 356, 16.0, 49, 3.9),
  createData('18:00', 356, 16.0, 49, 3.9),
  createData('19:00', 356, 16.0, 49, 3.9),
  createData('20:00', 356, 16.0, 49, 3.9),
  createData('21:00', 356, 16.0, 49, 3.9),
  createData('22:00', 356, 16.0, 49, 3.9),
];

const StyledTableCell = styled(TableCell)({
  padding: 0,
  minHeight: "50px !important",
  lineHeight: "50px !important",
  maxWidth: "135px",
  overflow: 'visible',
  textOverflow: 'ellipsis',
});

const Event = () => {
  const theme = useTheme();

  return (
    <Card variant="outlined" style={{ overflow: "visible" }}>
      <CardActionArea>
        <CardHeader
          title={<Typography variant="subtitle1">Scratch programozás</Typography>}
          subheader={<Typography variant="subtitle2">10:00 - 11:00</Typography>}
          sx={{ backgroundColor: theme.palette.primary.dark, color: theme.palette.common.white, padding: "2px" }}
        />
        <CardContent sx={{ padding: "10px", height: "80px", display: 'flex', alignItems: 'center' }}>
          <Grid container spacing={0}>
            <Grid item xs={1}>
              <SquareFootIcon fontSize="small" />
            </Grid>
            <Grid item xs={11}>
              <Typography variant="body2">
                gyakorlat<br />
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <SchoolIcon fontSize="small" />
            </Grid>
            <Grid item xs={11}>
              <Typography variant="body2">
                Lorem Ipsum Dolor Sit<br />
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <LocationOnIcon fontSize="small" />
            </Grid>
            <Grid item xs={11}>
              <Typography variant="body2">
                Józsefváros
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Calendar = () => {
  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="center">Hétfő</TableCell>
            <TableCell align="center">Kedd</TableCell>
            <TableCell align="center">Szerda</TableCell>
            <TableCell align="center">Csütörtök</TableCell>
            <TableCell align="center">Péntek</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <StyledTableCell align="center">
                <Event />
              </StyledTableCell>
              <StyledTableCell align="center">
                <Event />
              </StyledTableCell>
              <StyledTableCell align="center">

              </StyledTableCell>
              <StyledTableCell align="center">
                <Event />
              </StyledTableCell>
              <StyledTableCell align="center">
                <Event />
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Calendar;