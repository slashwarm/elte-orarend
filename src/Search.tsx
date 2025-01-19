import { DarkMode, LightMode, ManageSearch } from '@mui/icons-material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SearchIcon from '@mui/icons-material/Search';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
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
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Fragment, useState } from 'react';
import { read, utils } from 'xlsx';
import { Course, getSemesters, SearchData, Semester } from './utils/data';
import { toast } from 'react-toastify';

const labelOptions = {
    subject: 'Tárgy neve / kódja',
    teacher: 'Oktató neve / Neptun-kódja',
};

const labelIcons = {
    subject: <LibraryBooksIcon />,
    teacher: <SwitchAccountIcon />,
};

type SearchProps = {
    onSubmit: (data: SearchData, course?: Course[]) => void;
    onThemeChange: () => void;
    isLoading: boolean;
};

type SearchMode = 'subject' | 'teacher';

const Search: React.FC<SearchProps> = ({ onSubmit, onThemeChange, isLoading }: SearchProps) => {
    const theme = useTheme();
    const semesters = getSemesters();

    const [year, setYear] = useState(semesters[0]);
    const [mode, setMode] = useState<SearchMode>('subject');
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<Blob | null>(null);

    const changeYear = (event: React.MouseEvent, newAlignment: Semester) => {
        if (newAlignment !== null) {
            setYear(newAlignment);
        }
    };

    const changeMode = (event: React.MouseEvent, newAlignment: SearchMode) => {
        if (newAlignment !== null) {
            setMode(newAlignment);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);

        const name = (data.get('name') as string).trim();

        const formData = {
            name: name,
            year: year,
            mode: mode,
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
                year: year,
                mode: 'course' as const,
            };

            onSubmit(formData, courses);
            toast.success('A fájlban található kurzusok betöltve! 🎉 Az órarendi adatokat a lenti táblázatban találod.');
            handleClose();
        }
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
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <ManageSearch />

                            <Typography variant="h6" component="h2">
                                Keresés
                            </Typography>
                        </Stack>

                        <Fab onClick={onThemeChange} aria-label="change-theme" title="Change theme" size="small">
                            {theme.palette.mode === 'light' ? <DarkMode /> : <LightMode />}
                        </Fab>
                    </Stack>

                    <TextField
                        margin="normal"
                        fullWidth
                        id="name"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">{labelIcons[mode]}</InputAdornment>,
                        }}
                        label={labelOptions[mode]}
                        name="name"
                        error={error}
                        helperText={error ? 'Hibás bemenet.' : ''}
                    />
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            '& .MuiDivider-root': {
                                display: { xs: 'none', sm: 'block' },
                            },
                        }}
                        divider={<Divider orientation="vertical" flexItem />}
                    >
                        <ToggleButtonGroup fullWidth size="small" value={mode} onChange={changeMode} exclusive={true}>
                            <ToggleButton value="subject" key="subject">
                                Keresés tárgyra
                            </ToggleButton>
                            <ToggleButton value="teacher" key="teacher">
                                Keresés oktatóra
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <ToggleButtonGroup fullWidth size="small" value={year} onChange={changeYear} exclusive={true}>
                            {semesters.map((semester) => (
                                <ToggleButton value={semester} key={semester}>
                                    {semester}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Stack>

                    {year !== semesters[0] && (
                        <Alert severity="warning">Figyelem! Nem az éppen aktuális félév van kiválasztva!</Alert>
                    )}

                    <Stack spacing={1}>
                        <LoadingButton
                            loading={isLoading}
                            loadingPosition="start"
                            type="submit"
                            variant="contained"
                            startIcon={<SearchIcon />}
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
                        >
                            Kurzusok importálása Neptunból
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Felvett kurzuslista táblázat importálása</DialogTitle>
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
                                    inputProps={{ accept: '.xlsx' }}
                                    onChange={(e) => setFile(((e.target as HTMLInputElement).files as FileList)[0])}
                                    disabled={isLoading}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<EventRepeatIcon />}
                                    onClick={handleUpload}
                                    disabled={isLoading || !file}
                                >
                                    Betöltés
                                </Button>
                            </Stack>
                        </form>

                        <Alert variant="outlined" severity="info">
                            Kiválasztott félév: <b>{year}</b>
                        </Alert>

                        <Alert variant="outlined" severity="warning">
                            Neptunban a <b>Felvett kurzusok</b> menüpontban található táblázatot töltsd le, <b>ne</b> a
                            Felvett tárgyakban lévőt!
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Bezárás</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
};

export default Search;
