import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  CreateNewFolder,
  Add as AddIcon
} from '@mui/icons-material';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface FolderManagerProps {
  currentFolder: string | null;
  onFolderCreated: () => void;
}

const FolderManager: React.FC<FolderManagerProps> = ({
  currentFolder,
  onFolderCreated,
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentUser } = useAuth();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setOpen(true);
    handleMenuClose();
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to create folders');
      return;
    }

    try {
      await addDoc(collection(firestore, 'folders'), {
        name: folderName.trim(),
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
        parentId: currentFolder,
      });

      setFolderName('');
      setError('');
      setOpen(false);
      onFolderCreated();
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <IconButton
        onClick={handleMenuClick}
        size="small"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <AddIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCreateClick}>
          <ListItemIcon>
            <CreateNewFolder fontSize="small" />
          </ListItemIcon>
          New Folder
        </MenuItem>
      </Menu>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FolderManager;
