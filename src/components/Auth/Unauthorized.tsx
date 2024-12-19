import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xs">
      <Box 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" color="error">
          Unauthorized Access
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          You do not have permission to access this page.
          Please contact an administrator if you believe this is an error.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
