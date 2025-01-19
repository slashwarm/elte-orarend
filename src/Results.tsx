import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridColDef, huHU } from '@mui/x-data-grid';
import { Lesson } from './utils/data';
import CustomNoRowsOverlay from './components/EmptyListOverlay';

type ResultsProps = {
    tableData: Lesson[];
    onLessonSave: (data: Lesson) => void;
    savedLessons: Lesson[];
    onEventEdit?: (value: number) => void;
    onEventChange?: (data: Lesson, toDelete?: boolean) => void;
    isLoading: boolean;
    own: boolean;
};

const Results: React.FC<ResultsProps> = ({
    tableData,
    onLessonSave,
    savedLessons,
    onEventEdit,
    onEventChange,
    isLoading,
    own,
}: ResultsProps) => {
    const columns: GridColDef<Lesson>[] = [
        {
            field: 'actions',
            type: 'actions',
            headerName: '',
            width: 160,
            cellClassName: 'actions',
            sortable: false,
            renderCell: (params) => {
                const onDeleteClick = (e: React.MouseEvent): void => {
                    e.stopPropagation();
                    return onLessonSave(params.row);
                };

                if (own) {
                    const lesson = savedLessons.find((lesson) => lesson.id === params.id);
                    const isHidden = savedLessons && lesson && lesson.hidden;

                    const onHideClick = (e: React.MouseEvent): void => {
                        e.stopPropagation();
                        return onEventChange ? onEventChange({ ...(lesson as Lesson), hidden: !isHidden }) : undefined;
                    };

                    return (
                        <>
                            <Tooltip title="Eltávolítás" placement="top" disableInteractive>
                                <IconButton color="error" onClick={onDeleteClick}>
                                    <BookmarkRemoveIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Szerkesztés" placement="top" disableInteractive>
                                <IconButton onClick={() => (onEventEdit ? onEventEdit(Number(params.id)) : undefined)}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title={isHidden ? 'Megjelenítés a naptárban' : 'Elrejtés a naptárból'}
                                placement="top"
                                disableInteractive
                            >
                                <IconButton color={isHidden ? 'secondary' : 'primary'} onClick={onHideClick}>
                                    {isHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </IconButton>
                            </Tooltip>
                        </>
                    );
                } else {
                    const isSaved = savedLessons && savedLessons.some((obj) => obj.id === params.id);

                    return (
                        <Button
                            variant="outlined"
                            onClick={onDeleteClick}
                            color={!isSaved ? 'success' : 'error'}
                            startIcon={!isSaved ? <BookmarkAddIcon /> : <BookmarkRemoveIcon />}
                        >
                            {!isSaved ? 'Mentés' : 'Eltávolítás'}
                        </Button>
                    );
                }
            },
        },
        {
            field: 'code',
            headerName: 'Tárgykód',
            width: 140,
        },
        {
            field: 'name',
            headerName: 'Tárgynév',
            width: 280,
        },
        {
            field: 'type',
            headerName: 'Típus',
            width: 100,
        },
        {
            field: 'course',
            headerName: 'Kurzus',
            width: 70,
        },
        {
            field: 'teacher',
            headerName: 'Oktató neve',
            width: 140,
        },
        {
            field: 'reviews',
            type: 'actions',
            headerName: 'Vélemények',
            width: 100,
            cellClassName: 'actions',
            sortable: false,
            renderCell: (params) => {
                if (params.row.teacher === '') return '';

                const teacherName = params.row.teacher;
                const url = 'https://www.markmyprofessor.com/kereses?q=' + encodeURI(teacherName);

                return <Chip label="MMP" component={Link} variant="outlined" href={url} target="_blank" clickable />;
            },
        },
        {
            field: 'comment',
            headerName: 'Oktató / Megjegyzés',
            width: 250,
        },
        {
            field: 'location',
            headerName: 'Helyszín',
            width: 230,
        },
        {
            field: 'day',
            headerName: 'Nap',
            width: 85,
        },
        {
            field: 'time',
            headerName: 'Időpont',
            width: 100,
        },
    ];

    return (
        <DataGrid
            autoHeight
            rows={tableData}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 10,
                    },
                },
            }}
            pageSizeOptions={[10, 50, 100]}
            disableRowSelectionOnClick
            localeText={huHU.components.MuiDataGrid.defaultProps.localeText}
            slots={{
                noRowsOverlay: CustomNoRowsOverlay,
                loadingOverlay: LinearProgress,
            }}
            sx={{
                '--DataGrid-overlayHeight': '300px',
                '& .MuiDataGrid-cellContent': {
                    whiteSpace: 'normal',
                    lineHeight: 'normal',
                },
            }}
            loading={isLoading}
        />
    );
};

export default Results;
