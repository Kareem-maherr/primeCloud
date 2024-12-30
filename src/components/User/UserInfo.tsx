import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import BottomBar from '../UI/CustomBottomBar';

const UserInfo: React.FC = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewDisplayName(currentUser?.displayName || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewDisplayName(currentUser?.displayName || '');
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await updateProfile(currentUser, {
        displayName: newDisplayName,
      });
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !event.target.files || !event.target.files[0]) return;

    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateProfile(currentUser, {
        photoURL,
      });

      setSnackbar({
        open: true,
        message: 'Profile picture updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setSnackbar({
        open: true,
        message: 'Error uploading profile picture',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Placeholder handlers for BottomBar
  const handleSearch = async (term: string) => {
    return [];
  };

  if (!currentUser) return null;

  return (
    <Box sx={{ pb: isMobile ? 7 : 0 }}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {/* Profile Picture */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={currentUser.photoURL || undefined}
              alt={currentUser.displayName || 'User'}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: -8,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'background.default' },
              }}
            >
              <PhotoCameraIcon />
            </IconButton>
          </Box>

          {/* Email */}
          <Typography variant="body1" color="text.secondary">
            {currentUser.email}
          </Typography>

          {/* Display Name */}
          {isEditing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', maxWidth: 300 }}>
              <TextField
                fullWidth
                size="small"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                disabled={loading}
                placeholder="Enter your name"
              />
              <IconButton 
                color="primary" 
                onClick={handleSaveProfile}
                disabled={loading}
              >
                <SaveIcon />
              </IconButton>
              <IconButton 
                color="default" 
                onClick={handleCancelEdit}
                disabled={loading}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">
                {currentUser.displayName || 'Anonymous User'}
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleEditClick}
                disabled={loading}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Loading Indicator */}
          {loading && (
            <CircularProgress size={24} sx={{ mt: 1 }} />
          )}
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>

      {/* Mobile Bottom Bar */}
      {isMobile && (
        <BottomBar
          onUpload={() => {}}
          onCreateFolder={() => {}}
          onCreateFile={() => {}}
          onSearch={handleSearch}
        />
      )}
    </Box>
  );
};

export default UserInfo;
