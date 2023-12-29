import React, { useEffect, useState } from 'react';

import { GridPaginationModel } from '@mui/x-data-grid';
import useSWR from 'swr';

import apiEndpoints from '../../constants/api-endpoints';
import requestManager from '../../lib/requestManager';

interface KeywordRecord {
  id: number;
  keyword: string;
  total_advertisers: number;
  total_links: number;
  total_search_results: string;
  read_at: string;
}

interface KeywordRecordWithPaginate {
  data: Array<KeywordRecord>;
  paginate: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

interface KeywordRecordSearchQueryParams {
  page: number;
  limit: number;
  search?: string;
}

const useKeywordListData = () => {
  const [rows, setRows] = useState<Array<KeywordRecord>>([]);
  const [rowCount, setRowCount] = React.useState(10);
  const [params, setParams] = React.useState<KeywordRecordSearchQueryParams>({ page: 0, limit: 10 });

  const { data, isLoading, error, mutate, isValidating } = useSWR<KeywordRecordWithPaginate>(
    [apiEndpoints.KeywordList, params],
    (args) => {
      const token = sessionStorage.getItem('access_token');
      return requestManager('get', args[0], { params: args[1], headers: { authorization: `Bearer ${token}` } });
    }
  );

  useEffect(() => {
    if (!isLoading && data) {
      setRows(data.data);
      setRowCount(data.paginate.total);
    }
  }, [data, isLoading]);

  const applyFilter = (search: string) => {
    setParams((prevState) => {
      return {
        ...prevState,
        search,
      };
    });
  };

  const paginate = (paginateState: GridPaginationModel) => {
    setParams((prevState) => {
      return {
        ...prevState,
        limit: paginateState.pageSize,
        page: paginateState.page,
      };
    });
  };

  return { rows, isLoading, error, mutate, isValidating, rowCount, applyFilter, paginate };
};

export default useKeywordListData;
