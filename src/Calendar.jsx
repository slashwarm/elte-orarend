import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import huLocale from '@fullcalendar/core/locales/hu';
import './styles/Calendar.css';
import { Popover } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import EventIcon from '@mui/icons-material/Event';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/hu';

const Calendar = ({ tableData, onCalendarClick, onCalendarChange, savedLessons, own }) => {
  const [popoverInfo, setPopoverInfo] = useState({
    anchorEl: null,
    event: null,
  });
  const [editEvent, setEditEvent] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const handlePopoverOpen = (event, eventInfo) => {
    setPopoverInfo({ anchorEl: event.currentTarget, event: eventInfo });
  };

  const handlePopoverClose = () => {
    setPopoverInfo({ anchorEl: null, event: null });
  };

  const handleEditOpen = (eventId) => {
    const lesson = savedLessons.find((lesson) => lesson.id === eventId);
    const [start, end] = lesson.time.split('-');
    const [startHour, startMinute] = start.split(':');
    const [endHour, endMinute] = end.split(':');

    setStartTime(dayjs().hour(startHour).minute(startMinute).second(0));
    setEndTime(dayjs().hour(endHour).minute(endMinute).second(0));

    setEditEvent(lesson);
  };

  const handleEditClose = () => {
    setEditEvent(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const newStart = dayjs(startTime).format('HH:mm');
    const newEnd = dayjs(endTime).format('HH:mm');
    const newTime = `${newStart}-${newEnd}`;

    const newData = {
      id: editEvent.id,
      name: data.get('name'),
      comment: data.get('comment'),
      time: newTime,
    };

    onCalendarChange(newData);
    handleEditClose();
  };

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

  return (
    <>
      <FullCalendar
        plugins={[timeGridPlugin, momentTimezonePlugin]}
        initialView='timeGridWeek'
        weekends={false}
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
              <div className='fc-event-time'>{eventInfo.timeText}</div>
              <div className='fc-event-title-container'>
                <div className='fc-event-title fc-sticky'>
                  {eventInfo.event.title}
                </div>
              </div>
            </div>
          );
        }}
      />
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
                {own ? (
                  <EditCalendarIcon fontSize='small' />
                ) : (
                  <EventIcon fontSize='small' />
                )}
              </div>
              <div>
                {own
                  ? 'Kattints a szerkesztéshez'
                  : 'Kattints az órarendbe adáshoz / eltávolításhoz'}
              </div>
            </Stack>
          </Typography>
        </Popover>
      )}

      {isEventEdit && (
        <Dialog open={isEventEdit} onClose={handleEditClose}>
          <DialogTitle>Óra módosítása</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit} noValidate>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='hu'>
                <Stack spacing={2} marginTop={1} direction='column'>
                  <TextField
                    id='name'
                    label='Tárgy neve'
                    variant='outlined'
                    defaultValue={editEvent.name}
                  />
                  <TextField
                    id='comment'
                    label='Oktató / Megjegyzés'
                    multiline
                    maxRows={2}
                    defaultValue={editEvent.comment}
                  />
                  <TimePicker
                    id='start'
                    skipDisabled
                    label="Kezdés"
                    minTime={dayjs('2024-01-01T08:00')}
                    maxTime={dayjs('2024-01-01T22:00')}
                    value={startTime}
                    onChange={(newValue) => {
                      setStartTime(newValue);
                    }}
                  />
                  <TimePicker
                    id='end'
                    skipDisabled
                    label="Vége"
                    minTime={startTime}
                    maxTime={dayjs('2024-01-01T22:00')}
                    value={endTime}
                    onChange={(newValue) => {
                      setEndTime(newValue);
                    }}
                  />
                </Stack>
              </LocalizationProvider>
            </form>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleEditClose}
              startIcon={<SaveIcon />}
              variant='contained'
              color='success'
              style={{ color: 'white' }}
            >
              Mentés
            </Button>
            <Button
              onClick={handleEditClose}
              startIcon={<DeleteIcon />}
              variant='contained'
              color='error'
            >
              Törlés
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
  own: PropTypes.bool.isRequired,
};

export default Calendar;
