import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const OnePiece: React.FC = () => {
  useEffect(() => {
    const audio = new Audio('/overtaken.mp3');
    audio.loop = true;
    audio.play().catch(error => console.log('Audio playback failed:', error));

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#1976d2',
        padding: '20px'
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: '#fff',
          mb: 4
        }}
      >
        You Found the Secret Page! 🏴‍☠️
      </Typography>
      <Box
        component="img"
        src="/luffy.jpg"
        alt="Monkey D. Luffy"
        sx={{
          maxWidth: 500,
          width: '100%',
          borderRadius: 2,
          boxShadow: 3
        }}
      />
    </Box>
  );
};

export default OnePiece;
