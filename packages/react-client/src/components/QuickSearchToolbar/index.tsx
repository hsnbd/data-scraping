import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GridToolbarQuickFilter } from '@mui/x-data-grid';

const QuickSearchToolbar = (): React.JSX.Element => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        p: 1,
      }}
    >
      <Typography variant={'h5'}>Keywords</Typography>
      <GridToolbarQuickFilter />
    </Box>
  );
};

export default QuickSearchToolbar;
