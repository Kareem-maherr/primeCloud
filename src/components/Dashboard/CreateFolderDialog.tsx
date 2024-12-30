import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
}

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      setError('Please enter a folder name');
      return;
    }

    onCreate(trimmedName);
    setFolderName('');
    setError('');
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create New Folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Folder Name"
          fullWidth
          variant="outlined"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          error={!!error}
          helperText={error}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCreate();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          color="primary" 
          variant="contained"
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolderDialog;
