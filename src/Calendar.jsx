import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import huLocale from "@fullcalendar/core/locales/hu";
import "./styles/Calendar.css";
import Popover from "@mui/material/Popover";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";

const Calendar = ({
  tableData,
  onCalendarClick,
  onEventEdit,
  onImageDownload,
  savedLessons,
  own,
}) => {
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

  // képként való mentés
  const [stickyHeader, setStickyHeader] = useState(true);
  const printRef = useRef();

  const handlePrintClick = () => {
    setStickyHeader(false);
  };

  useEffect(() => {
    if (!stickyHeader) {
      onImageDownload(printRef);
      setStickyHeader(true);
    }
  }, [stickyHeader, onImageDownload]);

  // egyéb
  const isPopoverOpen = Boolean(popoverInfo.anchorEl);

  const onEventClick = (eventInfo) => {
    handlePopoverClose();

    if (own) {
      return onEventEdit(parseInt(eventInfo.event.id));
    } else {
      return onCalendarClick(parseInt(eventInfo.event.id), own);
    }
  };

  const isEventInSaved = (eventId) => {
    return savedLessons.some((lesson) => lesson.id === parseInt(eventId));
  };

  return (
    <>
      {own && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          marginBottom={2}
        >
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handlePrintClick}
          >
            Mentés képként
          </Button>

          <Badge
            badgeContent="ÚJ"
            color="secondary"
            sx={{ visibility: { xs: "hidden", sm: "visible" } }}
          >
            <Button
              variant="outlined"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => onEventEdit(-1)}
              sx={{ visibility: "visible" }}
              fullWidth
            >
              Saját kurzus hozzáadása
            </Button>
          </Badge>
        </Stack>
      )}

      <div ref={printRef}>
        <FullCalendar
          plugins={[timeGridPlugin, momentTimezonePlugin]}
          initialView="timeGridWeek"
          weekends={false}
          stickyHeaderDates={stickyHeader}
          events={tableData}
          headerToolbar={false}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          locale={huLocale}
          timeZone="Europe/Budapest"
          dayHeaderFormat={{ weekday: "long" }}
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
          }}
          height="auto"
          slotDuration="00:20:00"
          eventClick={onEventClick}
          eventContent={(eventInfo) => {
            return (
              <div
                className={`fc-event-main-frame ${
                  eventInfo.event.extendedProps.type === "gyakorlat"
                    ? "practice"
                    : "lecture"
                }`}
                onMouseEnter={(e) => handlePopoverOpen(e, eventInfo)}
                onMouseLeave={handlePopoverClose}
              >
                <div className="fc-event-time">
                  <b>{eventInfo.timeText}</b>
                </div>
                <div className="fc-event-title-container">
                  <div className="fc-event-title fc-sticky">
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
          id="mouse-over-popover"
          sx={{ pointerEvents: "none" }}
          open={isPopoverOpen}
          anchorEl={popoverInfo.anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>
            <div>{popoverInfo.event.timeText}</div>
            {popoverInfo.event.event.title.split("\r").map((item, ind) => {
              return <div key={ind}>{item}</div>;
            })}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ fontSize: "small", color: "gray" }}
              marginTop={0.5}
            >
              <div>
                {own ? (
                  <EditCalendarIcon fontSize="small" />
                ) : isEventInSaved(popoverInfo.event.event.id) ? (
                  <EventBusyIcon fontSize="small" />
                ) : (
                  <EventAvailableIcon fontSize="small" />
                )}
              </div>
              <div>
                {own
                  ? "Kattints a szerkesztéshez"
                  : `Kattints az ${
                      isEventInSaved(popoverInfo.event.event.id)
                        ? "órarendből törléshez"
                        : "órarendbe adáshoz"
                    }`}
              </div>
            </Stack>
          </Typography>
        </Popover>
      )}
    </>
  );
};

Calendar.propTypes = {
  tableData: PropTypes.array.isRequired,
  onCalendarClick: PropTypes.func.isRequired,
  savedLessons: PropTypes.array,
  onEventEdit: PropTypes.func,
  onImageDownload: PropTypes.func,
  own: PropTypes.bool.isRequired,
};

export default Calendar;
