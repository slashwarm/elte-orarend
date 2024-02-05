import { Fragment } from 'react'
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import huLocale from '@fullcalendar/core/locales/hu';
import './styles/Calendar.css';

const Calendar = ({ tableData, onCalendarClick, own }) => {
  const onEventClick = (info) => {
    return onCalendarClick(parseInt(info.event.id), own); // own = saját órarend vagy keresési találatok
  };

  return (
    <Fragment>
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView='timeGridWeek'
        weekends={false}
        events={tableData}
        headerToolbar={false}
        allDaySlot={false}
        slotMinTime='08:00:00'
        slotMaxTime='22:00:00'
        //valamiért nem jó
        //timeZone='Europe/Budapest'
        locale={huLocale}
        dayHeaderFormat={{ weekday: 'long' }}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
        }}
        height='auto'
        slotDuration='00:20:00'
        eventClick={onEventClick}
      />
    </Fragment>
  );
};

export default Calendar;