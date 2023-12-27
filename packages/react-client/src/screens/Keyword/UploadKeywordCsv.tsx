import React, { ChangeEvent, useCallback, useState } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import apiEndpoints from '../../constants/api-endpoints';
import requestManager from '../../lib/requestManager';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadKeywordCsv = (): React.JSX.Element => {
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [fileUploadStatus, setFileUploadStatus] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files == null || !files.length) {
      alert('Not found');
      return;
    }

    setIsFileUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    const token = sessionStorage.getItem('access_token');

    requestManager<string>('post', apiEndpoints.KeywordList, {
      data: formData,
      headers: { authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setFileUploadStatus(response);
      })
      .catch((error) => {
        console.log('error', error);
        setFileUploadStatus('Unable to upload file');
      })
      .finally(() => {
        setIsFileUploading(false);
      });
  };

  const dismissStatusCb = useCallback(() => {
    setFileUploadStatus('');
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        background: '#e8e8e8',
        height: '100px',
        position: 'relative',
      }}
    >
      {isFileUploading || !!fileUploadStatus ? (
        <Box
          sx={{
            background: '#e8e8e8',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={dismissStatusCb}
        >
          {isFileUploading ? (
            <Typography variant={'body1'}>
              Uploading, Please wait...
              <LinearProgress color="error" />
            </Typography>
          ) : (
            <Typography variant={'body1'}>{fileUploadStatus}</Typography>
          )}
        </Box>
      ) : (
        <Box
          component="label"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloudUploadIcon sx={{ mr: 1 }} /> Upload keywords (csv only)
          <VisuallyHiddenInput type="file" accept="text/csv" onChange={handleFileChange} />
        </Box>
      )}
    </Box>
  );
};

export default UploadKeywordCsv;
