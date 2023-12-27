import React, { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Card, CardActions, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import apiEndpoints from '../../constants/api-endpoints';
import useKeywordSingleData from '../../hooks/useKeywordSingleData';
import requestManager from '../../lib/requestManager';

const KeywordDetailsReportScreen = (): React.JSX.Element => {
  const { id } = useParams();

  const { data, isLoading, error } = useKeywordSingleData({ id });
  console.log('data', data);

  useEffect(() => {
    if (id) {
      const token = sessionStorage.getItem('access_token');
      requestManager<void>('patch', apiEndpoints.KeywordReportMarkAsRead(id), {
        headers: { authorization: `Bearer ${token}` },
      });
    }
  }, [id]);

  const downloadPageHtml = (htmlCode: string, keyword: string) => {
    const element = document.createElement('a');
    const file = new Blob([htmlCode], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${keyword}.html`;
    element.click();
  };

  return (
    <Grid container>
      {isLoading && (
        <Grid item md={12} mb={3}>
          <h1>Fetching report</h1>
        </Grid>
      )}
      {!isLoading && error && (
        <Grid item md={12} mb={3}>
          <h1>Unable to fetch</h1>
          <Button variant={'outlined'} color={'secondary'} startIcon={<ArrowBackIcon />} component={NavLink} to={`/keywords`}>
            Back
          </Button>
        </Grid>
      )}
      {data && (
        <Grid item md={12} mb={3}>
          <Card>
            <CardContent>
              <Button variant={'outlined'} color={'secondary'} startIcon={<ArrowBackIcon />} component={NavLink} to={`/keywords`}>
                Back
              </Button>
            </CardContent>
            <CardContent>
              <Typography variant={'h4'}>Report of &quot;{data.keyword}&quot;</Typography>
            </CardContent>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6}>
                  <TextField disabled value={data.keyword} label={'Keyword'} fullWidth />
                </Grid>
                <Grid item md={6}>
                  <TextField disabled value={data.total_search_results} label={'Search Results Stats'} fullWidth />
                </Grid>
                <Grid item md={6}>
                  <TextField disabled value={data.total_advertisers} label={'Total Advertisers'} fullWidth />
                </Grid>
                <Grid item md={6}>
                  <TextField disabled value={data.total_links} label={'Total Links'} fullWidth />
                </Grid>
                <Grid item md={6}>
                  <Button
                    variant={'contained'}
                    onClick={() => downloadPageHtml(data.html_code, data.keyword)}
                    startIcon={<CloudDownloadIcon />}
                  >
                    Download Page Html
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions></CardActions>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default KeywordDetailsReportScreen;
