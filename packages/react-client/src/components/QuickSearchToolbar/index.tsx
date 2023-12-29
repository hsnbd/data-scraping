import React, { useCallback, useEffect } from 'react';

import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridToolbarQuickFilter } from '@mui/x-data-grid';

interface QuickSearchToolbarProps {
  mutate: () => void;
}

const QuickSearchToolbar = ({ mutate }: QuickSearchToolbarProps): React.JSX.Element => {
  useEffect(() => {
    const id = setInterval(() => {
      mutate();
    }, 1000 * 30);

    return () => clearInterval(id);
  }, [mutate]);

  useEffect(() => {}, [mutate]);

  const onClickRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        p: 1,
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Typography variant={'h5'}>Keywords</Typography>
        <Tooltip title="Automatically refresh every 30 seconds">
          <Button color={'error'} onClick={onClickRefresh} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Tooltip>
      </Box>
      <GridToolbarQuickFilter />
    </Box>
  );
};

export default QuickSearchToolbar;
