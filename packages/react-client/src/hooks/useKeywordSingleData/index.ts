import { GridFilterModel } from '@mui/x-data-grid';
import useSWR from 'swr';

import apiEndpoints from '../../constants/api-endpoints';
import requestManager from '../../lib/requestManager';

interface UseKeywordSingleDataProps {
  id: string | undefined;
}

interface KeywordSingleResponseData {
  [x: string]: string;
}

const useKeywordSingleData = ({ id }: UseKeywordSingleDataProps) => {
  const response = useSWR(id ? [`${apiEndpoints.KeywordList}/${id}`] : null, (args) => {
    if (!args) {
      return null as unknown as KeywordSingleResponseData;
    }

    const token = sessionStorage.getItem('access_token');
    return requestManager<KeywordSingleResponseData>('get', args[0], {
      headers: { authorization: `Bearer ${token}` },
    });
  });

  const applyFilter = (filters: GridFilterModel) => {
    console.log('filters', filters);
  };

  return { ...response, applyFilter };
};

export default useKeywordSingleData;
