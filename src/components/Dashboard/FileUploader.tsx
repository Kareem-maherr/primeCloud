import React, { useState, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';

interface FileUploaderProps {
  currentFolder: string | null;
  onFileUploaded: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ currentFolder, onFileUploaded }) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentUser) {
      setError('Please login to upload files');
      return;
    }

    setError('');
    setSuccess('');

    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        // Create storage path
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${file.name}`;
        const storagePath = `files/${currentUser.uid}${currentFolder ? `/${currentFolder}` : ''}/${uniqueFileName}`;
        const storageRef = ref(storage, storagePath);

        // Create upload task
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Monitor upload progress
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          },
          (error) => {
            console.error('Upload error:', error);
            setError(`Error uploading ${file.name}: ${error.message}`);
          }
        );

        // Wait for upload to complete
        await uploadTask;

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Save file metadata to Firestore
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          path: storagePath,
          downloadURL: downloadURL,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          folderId: currentFolder,
          createdAt: new Date().toISOString()
        };

        console.log('[FileUploader] Saving file metadata:', {
          name: file.name,
          userId: currentUser.uid,
          userEmail: currentUser.email
        });

        await addDoc(collection(firestore, 'files'), fileData);

        // Clear progress for this file
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });

        return true;
      } catch (error) {
        console.error('Error uploading file:', error);
        setError(`Error uploading ${file.name}`);
        return false;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const allSuccessful = results.every(result => result);
      
      if (allSuccessful) {
        setSuccess('All files uploaded successfully!');
        onFileUploaded();
      }
    } catch (error) {
      console.error('Error in upload process:', error);
      setError('Some files failed to upload. Please try again.');
    }
  }, [currentUser, currentFolder, onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true
  });

  return (
    <Dialog 
      open={true} 
      maxWidth="sm" 
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
        Upload Files
        <IconButton 
          onClick={() => onFileUploaded()} 
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
        <Box 
          {...getRootProps()} 
          sx={{ 
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            padding: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="h6" gutterBottom color={isDragActive ? 'primary' : 'textPrimary'}>
            {isDragActive ? 'Drop the files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select files
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            {currentFolder ? `Uploading to current folder` : 'Uploading to root directory'}
          </Typography>
        </Box>

        {Object.entries(uploadProgress).map(([fileName, progress]) => (
          <Box key={fileName} sx={{ mt: 2 }}>
            <Typography variant="body2" noWrap>{fileName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: 'primary.main'
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 35 }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>
        ))}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileUploader;
