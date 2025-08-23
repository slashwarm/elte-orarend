import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/hu';
import { useEffect, useState } from 'react';
import './styles/Calendar.css';
import { generateUniqueId, Lesson, TimeRange } from './utils/data';

type EditEventProps = {
    savedLessons: Lesson[];
    onEventChange: (data: Lesson, toDelete?: boolean) => void;
    onEventEdit: (value: number | null) => void;
    eventId: number;
};

const EditEvent: React.FC<EditEventProps> = ({ savedLessons, onEventChange, onEventEdit, eventId }: EditEventProps) => {
    useEffect(() => {
        if (eventId !== -1) {
            const lesson = savedLessons.find((lesson) => lesson.id === eventId) as Lesson;
            const [start, end] = lesson.time !== '' ? lesson.time.split('-') : ["08:00", "09:00"];
            const [startHour, startMinute] = start.split(':');
            const [endHour, endMinute] = end.split(':');

            setStartTime(dayjs().hour(Number.parseInt(startHour)).minute(Number.parseInt(startMinute)).second(0));
            setEndTime(dayjs().hour(Number.parseInt(endHour)).minute(Number.parseInt(endMinute)).second(0));

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
                time: '08:00-09:00',
                type: 'gyakorlat',
                id: null!,
            });
        }
    }, [eventId, savedLessons]);

    // kurzus szerkesztése
    const [editEvent, setEditEvent] = useState<Lesson>(null!);
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        setEditEvent({
            ...editEvent,
            [event.target.name]: event.target.value,
        });
    };

    const handleEditClose = () => {
        onEventEdit(null);
    };

    const handleDeleteClick = (event: React.MouseEvent) => {
        event.preventDefault();
        onEventChange(savedLessons.find((lesson) => lesson.id === editEvent.id) as Lesson, true);
        handleEditClose();
    };

    const handleSaveClick = (event: React.MouseEvent) => {
        event.preventDefault();

        const newStart = dayjs(startTime).format('HH:mm');
        const newEnd = dayjs(endTime).format('HH:mm');
        const newTime = `${newStart}-${newEnd}` as TimeRange;

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

        onEventChange({ ...newData, id: uniqueId });
        handleEditClose();
    };

    if (!editEvent) {
        return null;
    }

    return (
        <Dialog open={true} onClose={handleEditClose}>
            <DialogTitle>Kurzus módosítása</DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="hu">
                    <Grid container spacing={2} marginTop={1}>
                        <Grid item xs={9} md={10}>
                            <TextField
                                name="name"
                                label="Tárgy neve"
                                variant="outlined"
                                value={editEvent.name}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={3} md={2}>
                            <TextField
                                name="course"
                                label="Kurzus"
                                variant="outlined"
                                value={editEvent.course}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={7} md={8}>
                            <TextField
                                name="code"
                                label="Tárgy kódja"
                                variant="outlined"
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
                                    <MenuItem value={'gyakorlat'}>gyakorlat</MenuItem>
                                    <MenuItem value={'előadás'}>előadás</MenuItem>
                                    <MenuItem value={'konzultáció'}>konzultáció</MenuItem>
                                    <MenuItem value={'elfoglaltság'}>elfoglaltság</MenuItem>
                                    <MenuItem value={'szeminárium'}>szeminárium</MenuItem>
                                    <MenuItem value={'labor'}>labor</MenuItem>
                                    <MenuItem value={'vizsgakurzus'}>vizsgakurzus</MenuItem>
                                    <MenuItem value={'házidolgozat'}>házidolgozat</MenuItem>
                                    <MenuItem value={'szakmai gyakorlat'}>szakmai gyakorlat</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="location"
                                label="Helyszín"
                                variant="outlined"
                                value={editEvent.location}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="comment"
                                label="Oktató / Megjegyzés"
                                multiline
                                maxRows={2}
                                value={editEvent.comment}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TimePicker
                                name="start"
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
                                name="end"
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
                                    <MenuItem value={'Hétfő'}>Hétfő</MenuItem>
                                    <MenuItem value={'Kedd'}>Kedd</MenuItem>
                                    <MenuItem value={'Szerda'}>Szerda</MenuItem>
                                    <MenuItem value={'Csütörtök'}>Csütörtök</MenuItem>
                                    <MenuItem value={'Péntek'}>Péntek</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                {editEvent.id && (
                    <Button startIcon={<DeleteIcon />} variant="contained" color="error" onClick={handleDeleteClick}>
                        Törlés
                    </Button>
                )}
                <Button
                    id="save-button"
                    startIcon={<SaveIcon />}
                    variant="contained"
                    color="success"
                    style={{ color: 'white' }}
                    type="submit"
                    onClick={handleSaveClick}
                >
                    Mentés
                </Button>
                <Button onClick={handleEditClose}>Bezárás</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditEvent;
