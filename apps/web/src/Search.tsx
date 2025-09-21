import { DarkMode, LightMode } from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import SearchIcon from '@mui/icons-material/Search';
import LoadingButton from '@mui/lab/LoadingButton';
import { Fab, useTheme } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import { Fragment, useState } from 'react';
import { read, utils } from 'xlsx';
import { Course, getSemesters, SearchData } from './utils/data';
import { toast } from 'react-toastify';
import { useThemeContext } from './utils/providers';

type SearchProps = {
    onSubmit: (data: SearchData, course?: Course[]) => void;
    isLoading: boolean;
};

const Search: React.FC<SearchProps> = ({ onSubmit, isLoading }: SearchProps) => {
    const { colorScheme, setColorScheme } = useThemeContext();
    const theme = useTheme();
    const semesters = getSemesters();

    const [year, setYear] = useState(semesters[0]);
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<Blob | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const changeYear = (event: any) => {
        setYear(semesters.find((semester) => semester.value === event.target.value)!);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);

        const name = (data.get('name') as string).trim();

        const formData = {
            name: name,
            year: year.value,
        };

        if (!formData.name) {
            setError(true);
            return;
        }

        if (error) {
            // régi errort nullázzuk
            setError(false);
        }

        onSubmit(formData);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setFile(null); // reset file
        setOpen(false);
    };

    const handleUpload = async () => {
        if (file) {
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const importedData: string[][] = utils.sheet_to_json(sheet, {
                header: 1,
                blankrows: false,
                skipHidden: true,
                range: 'A2:H100',
            });
            if (!importedData.length) {
                toast.error('Nem található adat az importált fájlban 😞');
                handleClose();
                return;
            }

            const courses: Course[] = importedData.map((subArray) => {
                return { courseCode: subArray[0], courseId: subArray[2] };
            });

            const formData = {
                name: courses.map((x) => x.courseCode),
                year: year.value,
                mode: 'course' as const,
            };

            onSubmit(formData, courses);
            toast.success(
                'A fájlban található kurzusok betöltve! 🎉 Az órarendi adatokat a lenti táblázatban találod.',
            );
            handleClose();
        }
    };

    const toggleTheme = () => {
        const newTheme = colorScheme === 'light' ? 'dark' : 'light';
        setColorScheme(newTheme);
    };

    const toggleDropdown = () => {
        setShowDropdown((oldShowDropdown) => !oldShowDropdown);
    };

    return (
        <Fragment>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6" component="h2">
                            Tárgykereső
                        </Typography>

                        <Fab
                            onClick={toggleTheme}
                            aria-label={`Téma váltása ${colorScheme === 'light' ? 'sötét' : 'világos'} módra`}
                            title={`Téma váltása ${colorScheme === 'light' ? 'sötét' : 'világos'} módra`}
                            size="small"
                        >
                            {colorScheme === 'light' ? <DarkMode /> : <LightMode />}
                        </Fab>
                    </Stack>

                    <TextField
                        margin="normal"
                        fullWidth
                        id="name"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon
                                        sx={{
                                            color: 'text.secondary',
                                            opacity: 0.7,
                                        }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={toggleDropdown}
                                        edge="end"
                                        aria-label="Félév kiválasztó megjelenítése/elrejtése"
                                        title="Félév kiválasztó megjelenítése/elrejtése"
                                    >
                                        <CalendarMonthIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        placeholder="Írd be a tárgy nevét / kódját, vagy az oktató nevét / Neptun-kódját"
                        name="name"
                        error={error}
                        helperText={error ? 'Hibás bemenet.' : ''}
                        aria-describedby={error ? 'name-error' : undefined}
                        aria-required="true"
                    />
                    {showDropdown && (
                        <FormControl size="small">
                            <InputLabel id="semester-select-label">Félév</InputLabel>
                            <Select
                                labelId="semester-select-label"
                                value={year.value}
                                label="Félév"
                                onChange={changeYear}
                                aria-label="Félév kiválasztása"
                            >
                                {semesters.map((semester) => (
                                    <MenuItem value={semester.value} key={semester.value}>
                                        {semester.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {year.value !== semesters[0].value && (
                        <Alert severity="warning" role="alert">
                            Figyelem! Nem az éppen aktuális félév van kiválasztva!
                        </Alert>
                    )}

                    <Stack spacing={1}>
                        <LoadingButton
                            loading={isLoading}
                            loadingPosition="start"
                            type="submit"
                            variant="contained"
                            aria-label="Keresés indítása"
                        >
                            Keresés
                        </LoadingButton>

                        <Divider
                            sx={{
                                color: theme.palette.text.secondary,
                            }}
                        >
                            vagy
                        </Divider>

                        <Button
                            color="secondary"
                            variant="outlined"
                            startIcon={<CloudDownloadIcon />}
                            onClick={handleClickOpen}
                            aria-label="Kurzusok importálása Neptunból"
                        >
                            Kurzusok importálása Neptunból
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Dialog open={open} onClose={handleClose} aria-labelledby="import-dialog-title">
                <DialogTitle id="import-dialog-title">Felvett kurzuslista táblázat importálása</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" component="div">
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

                    <Stack direction="column" spacing={2} alignItems="center">
                        <form>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    type={'file'}
                                    inputProps={{
                                        accept: '.xlsx',
                                        'aria-label': 'Excel fájl kiválasztása',
                                    }}
                                    onChange={(e) => setFile(((e.target as HTMLInputElement).files as FileList)[0])}
                                    disabled={isLoading}
                                    label="Fájl kiválasztása"
                                    variant="outlined"
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<EventRepeatIcon />}
                                    onClick={handleUpload}
                                    disabled={isLoading || !file}
                                    aria-label="Fájl betöltése"
                                >
                                    Betöltés
                                </Button>
                            </Stack>
                        </form>

                        <Alert variant="outlined" severity="info" role="status">
                            Kiválasztott félév: <b>{year.label}</b>
                        </Alert>

                        <Alert variant="outlined" severity="warning" role="alert">
                            Neptunban a <b>Felvett kurzusok</b> menüpontban található táblázatot töltsd le, <b>ne</b> a
                            Felvett tárgyakban lévőt!
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} aria-label="Párbeszédablak bezárása">
                        Bezárás
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
};

export default Search;
