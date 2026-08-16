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
import { DataGrid, GridAutosizeOptions, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { huHU } from '@mui/x-data-grid/locales';
import { useEffect, useMemo } from 'react';
import { Lesson } from './utils/data';
import CustomNoRowsOverlay from './components/EmptyListOverlay';

const ACTIONS_WIDTH = 172;
const REVIEWS_WIDTH = 116;
const AUTOSIZED_FIELDS = ['code', 'name', 'type', 'course', 'teacher', 'comment', 'location', 'day', 'time'];

const AUTOSIZE_OPTIONS: GridAutosizeOptions = {
    columns: AUTOSIZED_FIELDS,
    includeHeaders: true,
    includeOutliers: false,
    outliersFactor: 1.5,
    expand: true,
};

const LoadingOverlay = () => <LinearProgress />;

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
    const apiRef = useGridApiRef();

    const columns: GridColDef<Lesson>[] = useMemo(
        () => [
            {
                field: 'actions',
                type: 'actions',
                headerName: 'Műveletek',
                width: ACTIONS_WIDTH,
                resizable: false,
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
                            return onEventChange
                                ? onEventChange({ ...(lesson as Lesson), hidden: !isHidden })
                                : undefined;
                        };

                        return (
                            <>
                                <Tooltip title="Eltávolítás" placement="top" disableInteractive>
                                    <IconButton
                                        color="error"
                                        onClick={onDeleteClick}
                                        aria-label={`Eltávolítás: ${params.row.name}`}
                                        tabIndex={params.tabIndex}
                                    >
                                        <BookmarkRemoveIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Szerkesztés" placement="top" disableInteractive>
                                    <IconButton
                                        onClick={() => (onEventEdit ? onEventEdit(Number(params.id)) : undefined)}
                                        aria-label={`Szerkesztés: ${params.row.name}`}
                                        tabIndex={params.tabIndex}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip
                                    title={isHidden ? 'Megjelenítés a naptárban' : 'Elrejtés a naptárból'}
                                    placement="top"
                                    disableInteractive
                                >
                                    <IconButton
                                        color={isHidden ? 'secondary' : 'primary'}
                                        onClick={onHideClick}
                                        aria-label={`${isHidden ? 'Megjelenítés' : 'Elrejtés'} a naptárból: ${params.row.name}`}
                                        tabIndex={params.tabIndex}
                                    >
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
                                aria-label={`${!isSaved ? 'Mentés' : 'Eltávolítás'}: ${params.row.name}`}
                                tabIndex={params.tabIndex}
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
                minWidth: 110,
            },
            {
                field: 'name',
                headerName: 'Tárgynév',
                minWidth: 160,
            },
            {
                field: 'type',
                headerName: 'Típus',
                minWidth: 90,
            },
            {
                field: 'course',
                headerName: 'Kurzus',
                minWidth: 70,
            },
            {
                field: 'teacher',
                headerName: 'Oktató neve',
                minWidth: 120,
            },
            {
                field: 'reviews',
                type: 'actions',
                headerName: 'Vélemények',
                width: REVIEWS_WIDTH,
                resizable: false,
                cellClassName: 'actions',
                sortable: false,
                renderCell: (params) => {
                    if (params.row.teacher === '') return '';

                    const teacherName = params.row.teacher;
                    const url = 'https://www.markmyprofessor.com/kereses?q=' + encodeURI(teacherName);

                    return (
                        <Chip
                            label="MMP"
                            component={Link}
                            variant="outlined"
                            href={url}
                            target="_blank"
                            clickable
                            aria-label={`Vélemények megtekintése: ${teacherName}`}
                            tabIndex={params.tabIndex}
                        />
                    );
                },
            },
            {
                field: 'comment',
                headerName: 'Oktató / Megjegyzés',
                minWidth: 150,
            },
            {
                field: 'location',
                headerName: 'Helyszín',
                minWidth: 150,
            },
            {
                field: 'day',
                headerName: 'Nap',
                minWidth: 85,
            },
            {
                field: 'time',
                headerName: 'Időpont',
                minWidth: 100,
            },
        ],
        [own, savedLessons, onLessonSave, onEventChange, onEventEdit],
    );

    useEffect(() => {
        if (isLoading || !tableData.length) {
            return;
        }

        apiRef.current?.autosizeColumns(AUTOSIZE_OPTIONS);
    }, [apiRef, tableData, columns, isLoading]);

    return (
        <DataGrid
            autoHeight
            apiRef={apiRef}
            autosizeOnMount
            autosizeOptions={AUTOSIZE_OPTIONS}
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
                loadingOverlay: LoadingOverlay,
            }}
            sx={(theme) => ({
                '--DataGrid-overlayHeight': '300px',
                '& .MuiDataGrid-virtualScroller': {
                    '&:focus': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: '2px',
                    },
                },
            })}
            loading={isLoading}
            aria-label={own ? 'Saját órarend táblázat' : 'Keresési eredmények táblázat'}
        />
    );
};

export default Results;
