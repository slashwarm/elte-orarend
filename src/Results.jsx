import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataGrid, huHU } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import CustomNoRowsOverlay from './Overlay';
import { BookmarkAdded } from '@mui/icons-material';

const Results = ({ tableData, onLessonSave, savedLessons, isLoading }) => {
  useEffect(() => {
    console.log('myProp changed:', savedLessons);
    // Add other debugging information or checks here
  }, [savedLessons]);

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
            color="success"
            startIcon={!isSaved ? <BookmarkAddIcon /> : <BookmarkAddedIcon />}
            disabled={isSaved}
          >
            {!isSaved ? "Mentés" : "Mentve"}
          </Button>
        );
      }
    },
    {
      field: 'code',
      headerName: 'Tárgykód',
      width: 130
    },
    {
      field: 'name',
      headerName: 'Tárgynév',
      width: 220,
    },
    {
      field: 'type',
      headerName: 'Típus',
      width: 80,
    },
    {
      field: 'course',
      headerName: 'Kurzus',
      width: 70
    },
    {
      field: 'teacher',
      headerName: 'Oktató',
      width: 100
    },
    {
      field: 'comment',
      headerName: 'Megjegyzés',
      width: 110
    },
    {
      field: 'location',
      headerName: 'Helyszín',
      width: 220
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