import PropTypes from 'prop-types';
import { DataGrid, huHU } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CustomNoRowsOverlay from './Overlay';

const Results = ({
  tableData,
  onLessonSave,
  savedLessons,
  onEventEdit,
  onEventChange,
  isLoading,
  own,
}) => {
  const columns = [
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 160,
      cellClassName: 'actions',
      sortable: false,
      renderCell: (params) => {
        const onDeleteClick = (e) => {
          e.stopPropagation();
          return onLessonSave(params.row);
        };

        if (own) {
          const isHidden =
            savedLessons &&
            savedLessons.some((obj) => obj.id === params.id && obj.hidden);

          const onHideClick = (e) => {
            e.stopPropagation();
            return onEventChange({ id: params.id, hidden: !isHidden });
          };

          return (
            <>
              <Tooltip title='Eltávolítás' placement='top' disableInteractive>
                <IconButton color='error' onClick={onDeleteClick}>
                  <BookmarkRemoveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Szerkesztés' placement='top' disableInteractive>
                <IconButton onClick={() => onEventEdit(params.id)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  isHidden ? 'Megjelenítés a naptárban' : 'Elrejtés a naptárból'
                }
                placement='top'
                disableInteractive
              >
                <IconButton
                  color={isHidden ? 'secondary' : 'primary'}
                  onClick={onHideClick}
                >
                  {isHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>
            </>
          );
        } else {
          const isSaved =
            savedLessons && savedLessons.some((obj) => obj.id === params.id);

          return (
            <Button
              variant='outlined'
              onClick={onDeleteClick}
              color={!isSaved ? 'success' : 'error'}
              startIcon={
                !isSaved ? <BookmarkAddIcon /> : <BookmarkRemoveIcon />
              }
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
        const url =
          'https://www.markmyprofessor.com/kereses?q=' + encodeURI(teacherName);

        return (
          <Chip
            label='MMP'
            component={Link}
            variant='outlined'
            href={url}
            target='_blank'
            clickable
          />
        );
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
    <Box sx={{ width: '100%', maxWidth: 'calc(100vw - 113px)' }}>
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
        disableSelectionOnClick
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
    </Box>
  );
};

Results.propTypes = {
  savedLessons: PropTypes.array.isRequired,
};

export default Results;
