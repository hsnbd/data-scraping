import React from 'react';
import { NavLink } from 'react-router-dom';

import SummarizeIcon from '@mui/icons-material/Summarize';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { alpha, darken, lighten, styled } from '@mui/material/styles';
import { DataGrid, GridColDef, GridFilterModel, GridRowParams } from '@mui/x-data-grid';

import UploadKeywordCsv from './UploadKeywordCsv';
import useKeywordListData from '../../hooks/useKeywordListData';

const getBackgroundColor = (color: string, mode: string) => (mode === 'dark' ? darken(color, 0.7) : lighten(color, 0.7));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .unread-keyword-report': {
    backgroundColor: getBackgroundColor(theme.palette.warning.main, theme.palette.mode),
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.warning.main, 0.2),
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
      flex: 1,
    },
    {
      field: 'total_links',
      headerName: 'Total Links',
      type: 'number',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      flex: 1,
      getActions: (params: GridRowParams) => [
        <Button
          key={'view'}
          variant={'contained'}
          color={'error'}
          startIcon={<SummarizeIcon />}
          component={NavLink}
          to={`/keywords/${params.row.id}`}
        >
          Reports
        </Button>,
      ],
    },
  ];

  const { isLoading, data, applyFilter } = useKeywordListData();

  const onFilterChange = React.useCallback((filterModel: GridFilterModel) => {
    applyFilter(filterModel);
  }, []);

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const [rowCountState] = React.useState(10);

  return (
    <Grid container>
      <Grid item md={12} mb={3}>
        <UploadKeywordCsv />
      </Grid>
      <Grid item md={12}>
        <StyledDataGrid
          rowCount={rowCountState}
          pageSizeOptions={[10, 20]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          onFilterModelChange={onFilterChange}
          loading={isLoading}
          columns={columns}
          rows={(data as unknown as Array<never>) || []}
          filterMode="server"
          getRowClassName={(params: GridRowParams) => {
            return !params.row?.read_at ? 'unread-keyword-report' : '';
          }}
        />
      </Grid>
    </Grid>
  );
};

export default KeywordScreen;
