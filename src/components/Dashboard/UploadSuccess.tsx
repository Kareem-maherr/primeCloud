import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Zoom,
  keyframes,
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

interface UploadSuccessProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
}

const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const UploadSuccess: React.FC<UploadSuccessProps> = ({ open, onClose, fileName }) => {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: (theme) => theme.shadows[10],
        }
      }}
    >
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 3,
          }}
        >
          <CheckCircleOutline
            sx={{
              color: 'success.main',
              fontSize: 64,
              animation: `${bounceIn} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              color: 'success.main',
              fontWeight: 600,
              animation: `${fadeInUp} 0.4s ease-out 0.3s both`,
            }}
          >
            Upload Successful!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 1,
              color: 'text.secondary',
              textAlign: 'center',
              animation: `${fadeInUp} 0.4s ease-out 0.5s both`,
            }}
          >
            {fileName} has been uploaded
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSuccess;
