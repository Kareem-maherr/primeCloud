import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { storage, firestore } from '../../config/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface TextFileCreatorProps {
  currentFolder: string | null;
  onFileCreated: () => void;
  onClose: () => void;
}

const TextFileCreator: React.FC<TextFileCreatorProps> = ({
  currentFolder,
  onFileCreated,
  onClose,
}) => {
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleCreate = async () => {
    if (!currentUser) {
      setError('Please login to create files');
      return;
    }

    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    try {
      const finalFileName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
      const timestamp = new Date().getTime();
      const storagePath = `files/${currentUser.uid}${currentFolder ? `/${currentFolder}` : ''}/${timestamp}-${finalFileName}`;
      const storageRef = ref(storage, storagePath);

      // Upload the text content
      await uploadString(storageRef, content);
      const downloadURL = await getDownloadURL(storageRef);

      // Save file metadata to Firestore
      const fileData = {
        name: finalFileName,
        type: 'text/plain',
        size: new Blob([content]).size,
        path: storagePath,
        downloadURL,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        folderId: currentFolder,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(firestore, 'files'), fileData);
      onFileCreated();
      onClose();
    } catch (error) {
      console.error('Error creating text file:', error);
      setError('Failed to create file. Please try again.');
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        Create Text File
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ 
            color: 'text.secondary',
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            fullWidth
            placeholder="Enter file name (e.g., notes.txt)"
            error={!!error && !fileName.trim()}
            helperText={!fileName.trim() && error ? error : ''}
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={10}
            fullWidth
            placeholder="Enter your text here..."
          />
          {error && fileName.trim() && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained"
          disabled={!fileName.trim() || !content.trim()}
        >
          Create File
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextFileCreator;
