import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { keyframes } from '@mui/system';
import { Construction, Engineering } from '@mui/icons-material';

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const UnderImplementation: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Construction
          sx={{
            fontSize: 48,
            color: 'warning.main',
            animation: `${bounce} 2s infinite ease-in-out`,
          }}
        />
        <Engineering
          sx={{
            fontSize: 48,
            color: 'primary.main',
            animation: `${rotate} 4s infinite linear`,
          }}
        />
      </Box>
      
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Under Construction
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          animation: `${bounce} 1.5s infinite ease-in-out`,
          animationDelay: '0.5s',
        }}
      >
        Our team of digital architects is hard at work! 🚧
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          mt: 2,
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        This feature will be available soon!
      </Typography>
    </Box>
  );
};

export default UnderImplementation;
