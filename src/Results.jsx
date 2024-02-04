import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataGrid, huHU } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import CustomNoRowsOverlay from './Overlay';

const Results = ({ tableData, onLessonSave, savedLessons, isLoading }) => {
  const columns = [
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 150,
      cellClassName: 'actions',
      sortable: false,
      renderCell: (params) => {
        const onClick = (e) => {
          e.stopPropagation();
          return onLessonSave(params.row);
        };

        const isSaved = savedLessons && savedLessons.some(obj => obj.id === params.id);

        return (
          <Button
            variant="outlined"
            onClick={onClick}
            color={!isSaved ? "success" : "error"}
            startIcon={!isSaved ? <BookmarkAddIcon /> : <BookmarkRemoveIcon />}
          >
            {!isSaved ? "Mentés" : "Eltávolítás"}
          </Button>
        );
      }
    },
    {
      field: 'code',
      headerName: 'Tárgykód',
      width: 180
    },
    {
      field: 'name',
      headerName: 'Tárgynév',
      width: 300,
    },
    {
      field: 'type',
      headerName: 'Típus',
      width: 120,
    },
    {
      field: 'course',
      headerName: 'Kurzus',
      width: 70
    },
    {
      field: 'teacher',
      headerName: 'Oktató',
      width: 250
    },
    {
      field: 'reviews',
      type: 'actions',
      headerName: 'Oktató vélemények',
      width: 150,
      cellClassName: 'actions',
      sortable: false,
      renderCell: (params) => {
        const teacherName = params.row.teacher.replace("Dr. ", "").replace(" Dr.", "");
        const url = "https://www.markmyprofessor.com/kereses?q=" + encodeURI(teacherName);

        return (
          <Chip label="MMP" component={Link} variant="outlined" href={url} target="_blank" clickable />
        );
      }
    },
    {
      field: 'comment',
      headerName: 'Megjegyzés',
      width: 110
    },
    {
      field: 'location',
      headerName: 'Helyszín',
      width: 270
    },
    {
      field: 'day',
      headerName: 'Nap',
      width: 85
    },
    {
      field: 'time',
      headerName: 'Időpont',
      width: 100
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
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
          loadingOverlay: LinearProgress
        }}
        sx={{
          '--DataGrid-overlayHeight': '300px',
          "& .MuiDataGrid-cellContent": {
            whiteSpace: "normal",
            lineHeight: "normal"
          },
        }}
        loading={isLoading}
      />
    </Box>
  );
}

Results.propTypes = {
  savedLessons: PropTypes.array.isRequired,
};

export default Results;