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
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';

interface FileUploaderProps {
  currentFolder: string | null;
  onFileUploaded: () => void;
  onClose?: () => void;
  onUploadSuccess?: (fileName: string) => void;
  open: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  currentFolder, 
  onFileUploaded, 
  onClose, 
  onUploadSuccess,
  open
}) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClose = () => {
    console.log('FileUploader: handleClose called', { isUploading, onClose: !!onClose });
    if (!isUploading && onClose) {
      console.log('FileUploader: Not uploading, proceeding with close');
      setFiles([]);
      setUploadProgress({});
      setError('');
      setSuccess('');
      onClose();
    } else {
      console.log('FileUploader: Cannot close - ' + (isUploading ? 'upload in progress' : 'no onClose handler'));
    }
  };

  const handleFileUpload = async () => {
    console.log('FileUploader: handleFileUpload called', { fileCount: files.length });
    if (!currentUser) {
      console.error('FileUploader: No current user');
      setError('Please login to upload files');
      return;
    }

    if (files.length === 0) {
      console.warn('FileUploader: No files selected');
      setError('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');
    console.log('FileUploader: Starting upload process');

    try {
      const uploadPromises = files.map(async (file) => {
        console.log(`FileUploader: Processing file: ${file.name}`);
        const timestamp = new Date().getTime();
        const storagePath = `files/${currentUser.uid}${currentFolder ? `/${currentFolder}` : ''}/${timestamp}-${file.name}`;
        const storageRef = ref(storage, storagePath);

        // Upload file
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`FileUploader: Upload progress for ${file.name}: ${progress}%`);
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: progress,
              }));
            },
            (error) => {
              console.error(`FileUploader: Upload error for ${file.name}:`, error);
              reject(error);
            },
            async () => {
              try {
                console.log(`FileUploader: Upload completed for ${file.name}, getting download URL`);
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Create file document in Firestore
                console.log(`FileUploader: Creating Firestore document for ${file.name}`);
                const filesRef = collection(firestore, 'files');
                await addDoc(filesRef, {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  downloadURL,
                  path: storagePath,
                  folderId: currentFolder,
                  userId: currentUser.uid,
                  createdAt: new Date().toISOString(),
                });

                console.log(`FileUploader: Successfully processed ${file.name}`);
                resolve(file.name);
              } catch (firestoreError) {
                console.error(`FileUploader: Firestore error for ${file.name}:`, firestoreError);
                reject(firestoreError);
              }
            }
          );
        });
      });

      console.log('FileUploader: Waiting for all uploads to complete');
      const uploadedFileNames = await Promise.all(uploadPromises);
      
      console.log('FileUploader: All uploads completed successfully', uploadedFileNames);
      // Reset state
      setFiles([]);
      setUploadProgress({});
      setSuccess('Files uploaded successfully');
      
      // Call callbacks
      console.log('FileUploader: Calling callbacks');
      onFileUploaded();
      if (onUploadSuccess) {
        onUploadSuccess(uploadedFileNames.join(', '));
      }
    } catch (err) {
      console.error('FileUploader: Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      console.log('FileUploader: Upload process finished');
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        console.log('FileUploader: Dialog onClose', { reason, isUploading });
        if ((reason === 'backdropClick' || reason === 'escapeKeyDown') && !isUploading) {
          handleClose();
        }
      }}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        Upload Files
        <IconButton 
          onClick={handleClose}
          size="small"
          disabled={isUploading}
          sx={{ 
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
            visibility: isUploading ? 'hidden' : 'visible'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
        {/* Dropzone */}
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'primary.lighter' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter'
            }
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ textAlign: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select files
            </Typography>
          </Box>
        </Paper>

        {/* File List */}
        {files.length > 0 && (
          <Paper variant="outlined" sx={{ mt: 2 }}>
            <List sx={{ p: 0 }}>
              {files.map((file, index) => (
                <ListItem
                  key={`${file.name}-${index}`}
                  secondaryAction={
                    !isUploading && (
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => removeFile(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                  sx={{
                    borderBottom: index < files.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <FileIcon sx={{ color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                        {uploadProgress[file.name] !== undefined && (
                          <>
                            <LinearProgress 
                              variant="determinate" 
                              value={uploadProgress[file.name]}
                              sx={{ flexGrow: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(uploadProgress[file.name])}%
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={isUploading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleFileUpload}
          variant="contained"
          disabled={files.length === 0 || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploader;
