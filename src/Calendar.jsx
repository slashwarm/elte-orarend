import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import huLocale from '@fullcalendar/core/locales/hu';
import './styles/Calendar.css';
import { Popover } from '@mui/material';
import Grid from '@mui/material/Grid';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/hu';
import { generateUniqueId } from './Data';

const Calendar = ({ tableData, onCalendarClick, onCalendarChange, onImageDownload, savedLessons, own }) => {
  // popover
  const [popoverInfo, setPopoverInfo] = useState({
    anchorEl: null,
    event: null,
  });

  const handlePopoverOpen = (event, eventInfo) => {
    setPopoverInfo({ anchorEl: event.currentTarget, event: eventInfo });
  };

  const handlePopoverClose = () => {
    setPopoverInfo({ anchorEl: null, event: null });
  };

  // kurzus szerkesztése
  const [editEvent, setEditEvent] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const handleChange = (event) => {
    setEditEvent({
      ...editEvent,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditOpen = (eventId) => {
    if (eventId) {
      const lesson = savedLessons.find((lesson) => lesson.id === eventId);
      const [start, end] = lesson.time.split('-');
      const [startHour, startMinute] = start.split(':');
      const [endHour, endMinute] = end.split(':');

      setStartTime(dayjs().hour(startHour).minute(startMinute).second(0));
      setEndTime(dayjs().hour(endHour).minute(endMinute).second(0));

      setEditEvent(lesson);
    } else {
      setStartTime(dayjs('2024-01-01T08:00'));
      setEndTime(dayjs('2024-01-01T10:00'));

      setEditEvent({
        code: '',
        name: '',
        course: '',
        comment: '',
        day: 'Hétfő',
        location: '',
        teacher: '',
        type: 'gyakorlat',
      });
    }
  };

  const handleEditClose = () => {
    setEditEvent(null);
  };

  const handleDeleteClick = (event) => {
    event.preventDefault();
    onCalendarChange({ id: editEvent.id }, true);
    handleEditClose();
  };

  const handleSaveClick = (event) => {
    event.preventDefault();

    const newStart = dayjs(startTime).format('HH:mm');
    const newEnd = dayjs(endTime).format('HH:mm');
    const newTime = `${newStart}-${newEnd}`;

    const newData = {
      name: editEvent.name,
      code: editEvent.code,
      day: editEvent.day,
      time: newTime,
      location: editEvent.location,
      type: editEvent.type,
      course: editEvent.course,
      teacher: editEvent.teacher,
      comment: editEvent.comment,
    };

    const uniqueId = editEvent.id || generateUniqueId(newData);

    onCalendarChange({ ...newData, id: uniqueId });
    handleEditClose();
  };

  // képként való mentés
  const [stickyHeader, setStickyHeader] = useState(true);
  const printRef = useRef();

  const handlePrintClick = () => {
    setStickyHeader(false);
  }

  useEffect(() => {
    if (!stickyHeader) {
      onImageDownload(printRef);
      setStickyHeader(true);
    }
  }, [stickyHeader, onImageDownload]);

  // egyéb
  const isPopoverOpen = Boolean(popoverInfo.anchorEl);
  const isEventEdit = Boolean(editEvent);

  const onEventClick = (eventInfo) => {
    handlePopoverClose();

    if (own) {
      return handleEditOpen(parseInt(eventInfo.event.id));
    } else {
      return onCalendarClick(parseInt(eventInfo.event.id), own);
    }
  };

  const isEventInSaved = (eventId) => {
    return savedLessons.some((lesson) => lesson.id === parseInt(eventId));
  }

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} marginBottom={2}>
        <Button
          variant='outlined'
          startIcon={<DownloadIcon />}
          onClick={handlePrintClick}
        >
          Mentés képként
        </Button>

        <Badge badgeContent='ÚJ' color='secondary' sx={{ visibility: { xs: 'hidden', sm: 'visible' } }}>
          <Button
            variant='outlined'
            color='success'
            startIcon={<AddIcon />}
            onClick={() => handleEditOpen(null)}
            sx={{ visibility: 'visible' }}
            fullWidth
          >
            Saját kurzus hozzáadása
          </Button>
        </Badge>
      </Stack>

      <div ref={printRef}>
        <FullCalendar
          plugins={[timeGridPlugin, momentTimezonePlugin]}
          initialView='timeGridWeek'
          weekends={false}
          stickyHeaderDates={stickyHeader}
          events={tableData}
          headerToolbar={false}
          allDaySlot={false}
          slotMinTime='08:00:00'
          slotMaxTime='22:00:00'
          locale={huLocale}
          timeZone='Europe/Budapest'
          dayHeaderFormat={{ weekday: 'long' }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
          }}
          height='auto'
          slotDuration='00:20:00'
          eventClick={onEventClick}
          eventContent={(eventInfo) => {
            return (
              <div
                className={`fc-event-main-frame ${
                  eventInfo.event.extendedProps.type === 'gyakorlat'
                    ? 'practice'
                    : 'lecture'
                }`}
                onMouseEnter={(e) => handlePopoverOpen(e, eventInfo)}
                onMouseLeave={handlePopoverClose}
              >
                <div className='fc-event-time'><b>{eventInfo.timeText}</b></div>
                <div className='fc-event-title-container'>
                  <div className='fc-event-title fc-sticky'>
                    {eventInfo.event.title}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>

      {popoverInfo.event && (
        <Popover
          id='mouse-over-popover'
          sx={{ pointerEvents: 'none' }}
          open={isPopoverOpen}
          anchorEl={popoverInfo.anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>
            <div>{popoverInfo.event.timeText}</div>
            {popoverInfo.event.event.title.split('\r').map((item, ind) => {
              return <div key={ind}>{item}</div>;
            })}
            <Stack
              direction='row'
              spacing={0.5}
              sx={{ fontSize: 'small', color: 'gray' }}
              marginTop={0.5}
            >
              <div>
                {
                own ? (
                  <EditCalendarIcon fontSize='small' />
                ) : isEventInSaved(popoverInfo.event.event.id) ? (
                  <EventBusyIcon fontSize='small' />
                ) : (
                  <EventAvailableIcon fontSize='small' />
                )}
              </div>
              <div>
                {own
                  ? 'Kattints a szerkesztéshez'
                  : `Kattints az ${isEventInSaved(popoverInfo.event.event.id) ? 'órarendből törléshez' : 'órarendbe adáshoz'}`}
              </div>
            </Stack>
          </Typography>
        </Popover>
      )}

      {isEventEdit && (
        <Dialog open={isEventEdit} onClose={handleEditClose}>
          <DialogTitle>Kurzus módosítása</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='hu'>
              <Grid container spacing={2} marginTop={1}>
                <Grid item xs={9} md={10}>
                  <TextField
                    name='name'
                    label='Tárgy neve'
                    variant='outlined'
                    value={editEvent.name}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3} md={2}>
                  <TextField
                    name='course'
                    label='Kurzus'
                    variant='outlined'
                    value={editEvent.course}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={7} md={8}>
                  <TextField
                    name='code'
                    label='Tárgy kódja'
                    variant='outlined'
                    value={editEvent.code}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={5} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="type-select-label">Típus</InputLabel>
                    <Select
                      labelId="type-select-label"
                      name="type"
                      value={editEvent.type}
                      label="Típus"
                      onChange={handleChange}
                    >
                      <MenuItem value={"gyakorlat"}>gyakorlat</MenuItem>
                      <MenuItem value={"előadás"}>előadás</MenuItem>
                      <MenuItem value={"konzultáció"}>konzultáció</MenuItem>
                      <MenuItem value={"elfoglaltság"}>elfoglaltság</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name='location'
                    label='Helyszín'
                    variant='outlined'
                    value={editEvent.location}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name='comment'
                    label='Oktató / Megjegyzés'
                    multiline
                    maxRows={2}
                    value={editEvent.comment}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TimePicker
                    name='start'
                    skipDisabled
                    label="Kezdés"
                    minTime={dayjs('2024-01-01T08:00')}
                    maxTime={dayjs('2024-01-01T22:00')}
                    value={startTime}
                    onChange={(newValue) => {
                      setStartTime(newValue);
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TimePicker
                    name='end'
                    skipDisabled
                    label="Vége"
                    minTime={startTime}
                    maxTime={dayjs('2024-01-01T22:00')}
                    value={endTime}
                    onChange={(newValue) => {
                      setEndTime(newValue);
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="day-select-label">Nap</InputLabel>
                    <Select
                      labelId="day-select-label"
                      name="day"
                      value={editEvent.day}
                      label="Nap"
                      onChange={handleChange}
                    >
                      <MenuItem value={"Hétfő"}>Hétfő</MenuItem>
                      <MenuItem value={"Kedd"}>Kedd</MenuItem>
                      <MenuItem value={"Szerda"}>Szerda</MenuItem>
                      <MenuItem value={"Csütörtök"}>Csütörtök</MenuItem>
                      <MenuItem value={"Péntek"}>Péntek</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            {editEvent.id && (
              <Button
                startIcon={<DeleteIcon />}
                variant='contained'
                color='error'
                onClick={handleDeleteClick}
              >
                Törlés
              </Button>
            )}
            <Button
              id='save-button'
              startIcon={<SaveIcon />}
              variant='contained'
              color='success'
              style={{ color: 'white' }}
              type='submit'
              onClick={handleSaveClick}
            >
              Mentés
            </Button>
            <Button onClick={handleEditClose}>Bezárás</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

Calendar.propTypes = {
  tableData: PropTypes.array.isRequired,
  onCalendarClick: PropTypes.func.isRequired,
  savedLessons: PropTypes.array,
  onCalendarChange: PropTypes.func,
  onImageDownload: PropTypes.func,
  own: PropTypes.bool.isRequired,
};

export default Calendar;
