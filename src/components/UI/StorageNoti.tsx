import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StorageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const StorageNoti: React.FC = () => {
  // Placeholder values
  const usagePercentage = 45;
  const usedStorage = "2.25 GB";
  const totalStorage = "5.00 GB";

  return (
    <StorageContainer>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Storage Usage
      </Typography>
      <LinearProgress
        variant="determinate"
        value={usagePercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: usagePercentage > 90 ? 'error.main' : 'primary.main',
          },
        }}
      />
      <Typography variant="caption" color="textSecondary">
        {usedStorage} of {totalStorage} used
      </Typography>
    </StorageContainer>
  );
};

export default StorageNoti;
