import { GridFilterModel } from '@mui/x-data-grid';
import useSWR from 'swr';

import apiEndpoints from '../../constants/api-endpoints';
import requestManager from '../../lib/requestManager';

const useKeywordListData = () => {
  const response = useSWR([apiEndpoints.KeywordList, { hello: 'hello' }], (args) => {
    const token = sessionStorage.getItem('access_token');
    return requestManager('get', args[0], { params: args[1], headers: { authorization: `Bearer ${token}` } });
  });

  const applyFilter = (filters: GridFilterModel) => {
    console.log('filters', filters);
  };

  return { ...response, applyFilter };
};

export default useKeywordListData;
