import React from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridFilterModel, GridRowParams } from '@mui/x-data-grid';

import UploadKeywordCsv from './UploadKeywordCsv';
import useKeywordListData from '../../hooks/useKeywordListData';

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
        <Button key={'view'} variant={'contained'}>
          {params.row.id}
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
        <DataGrid
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
        />
      </Grid>
    </Grid>
  );
};

export default KeywordScreen;
