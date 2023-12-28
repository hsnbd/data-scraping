import React from 'react';
import { NavLink } from 'react-router-dom';

import SummarizeIcon from '@mui/icons-material/Summarize';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { alpha, darken, lighten, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridFilterModel, GridPaginationModel, GridRowParams } from '@mui/x-data-grid';

import UploadKeywordCsv from './UploadKeywordCsv';
import CustomNoRowsOverlay from '../../components/CustomNoRowsOverlay';
import QuickSearchToolbar from '../../components/QuickSearchToolbar';
import useKeywordListData from '../../hooks/useKeywordListData';

const getBackgroundColor = (color: string, mode: string) => (mode === 'dark' ? darken(color, 0.7) : lighten(color, 0.7));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .unread-keyword-report': {
    backgroundColor: getBackgroundColor(theme.palette.success.main, theme.palette.mode),
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.success.main, 0.2),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  },
}));

const KeywordScreen = (): React.JSX.Element => {
  const columns: GridColDef[] = [
    {
      field: 'keyword',
      headerName: 'Keyword',
      sortable: false,
      flex: 1,
    },
    {
      field: 'total_search_results',
      headerName: 'Search Results Stats',
      sortable: false,
      flex: 1,
    },
    {
      field: 'total_advertisers',
      headerName: 'Total Advertisers',
      sortable: false,
      flex: 1,
    },
    {
      field: 'total_links',
      headerName: 'Total Links',
      sortable: false,
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      sortable: false,
      flex: 1,
      getActions: (params: GridRowParams) => [
        <>
          {params.row.scraped_at ? (
            <Button
              key={'view'}
              variant={'outlined'}
              color={'error'}
              startIcon={<SummarizeIcon />}
              component={NavLink}
              to={`/keywords/${params.row.id}`}
            >
              Report
            </Button>
          ) : (
            <Typography>Scraping...</Typography>
          )}
        </>,
      ],
    },
  ];

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const { isLoading, rows, rowCount, mutate, applyFilter, paginate } = useKeywordListData();

  const onFilterChange = React.useCallback(
    (filterModel: GridFilterModel) => {
      if (filterModel.quickFilterValues && filterModel.quickFilterValues.length) {
        applyFilter(filterModel.quickFilterValues.join(' '));
      } else {
        applyFilter('');
      }
    },
    [applyFilter]
  );

  const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel);
    paginate(newPaginationModel);
  };

  return (
    <Grid container>
      <Grid item md={12} mb={3}>
        <UploadKeywordCsv mutateList={mutate} />
      </Grid>
      <Grid item md={12}>
        <StyledDataGrid
          rowCount={rowCount}
          pageSizeOptions={[10, 20]}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          paginationMode="server"
          onFilterModelChange={onFilterChange}
          loading={isLoading}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          autoHeight
          sx={{ '--DataGrid-overlayHeight': '300px' }}
          slots={{
            toolbar: QuickSearchToolbar,
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              mutate: mutate,
            },
          }}
          columns={columns}
          rows={rows || []}
          filterMode="server"
          getRowClassName={(params: GridRowParams) => {
            if (params.row?.scraped_at && !params.row?.read_at) {
              return 'unread-keyword-report';
            }

            return '';
          }}
        />
      </Grid>
    </Grid>
  );
};

export default KeywordScreen;
