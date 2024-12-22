import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  //Breadcrumbs,
  //Link,
  Tooltip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
  //Home as HomeIcon,
  MoreVert as MoreIcon,
  CloudQueue as CloudIcon,
  InsertDriveFile as FileIcon,
  FolderShared as FolderSharedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FolderItem, FileItem } from '../../types/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { firestore, storage } from '../../config/firebase';

const SharedFolder: React.FC = () => {
  const [sharedFolders, setSharedFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  //const theme = useTheme();
  const [currentView, setCurrentView] = useState<'shared' | 'personal'>('shared');

  const fetchFolders = async (parentId: string | null = null) => {
    if (!currentUser?.email) return;

    try {
      setLoading(true);
      const foldersRef = collection(firestore, 'folders');
      const q = query(
        foldersRef,
        where('sharedWith', 'array-contains', currentUser.email.toLowerCase()),
        where('parentId', '==', parentId)
      );

      const querySnapshot = await getDocs(q);
      const folders: FolderItem[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        folders.push({ id: doc.id, ...doc.data() } as FolderItem);
      });

      setSharedFolders(folders);
    } catch (error) {
      console.error('Error fetching shared folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (folderId: string | null = null) => {
    if (!currentUser?.email) return;

    try {
      setLoading(true);
      const filesRef = collection(firestore, 'files');
      const q = query(
        filesRef,
        where('folderId', '==', folderId)
      );

      const querySnapshot = await getDocs(q);
      const fetchedFiles: FileItem[] = [];

      for (const doc of querySnapshot.docs) {
        const fileData = doc.data();
        try {
          const storagePath = fileData.path || fileData.url;
          const fileRef = ref(storage, storagePath);
          const downloadURL = fileData.downloadURL || await getDownloadURL(fileRef);
          
          fetchedFiles.push({
            id: doc.id,
            name: fileData.name,
            type: fileData.type || 'application/octet-stream',
            size: fileData.size || 0,
            downloadURL,
            createdAt: fileData.createdAt || new Date().toISOString(),
            path: storagePath,
            createdBy: fileData.createdBy || fileData.userId || 'unknown'
          });
        } catch (error) {
          console.error(`Error fetching file ${fileData.name}:`, error);
        }
      }

      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      await fetchFolders(currentFolder);
      if (currentFolder) {
        await fetchFiles(currentFolder);
      } else {
        setFiles([]);
      }
    };
    loadContent();
  }, [currentUser, currentFolder]);

  const handleFolderClick = (folderId: string) => {
    setFolderStack(prev => [...prev, currentFolder || '']);
    setCurrentFolder(folderId);
  };

  const handleBack = () => {
    const previousFolder = folderStack.pop();
    setFolderStack([...folderStack]);
    setCurrentFolder(previousFolder || null);
  };

  const handleFileClick = (file: FileItem) => {
    console.log('File clicked:', file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 3 }, 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      pb: { xs: 7, sm: 3 } // Add padding bottom for mobile to account for bottom navigation
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => {
            if (currentFolder) {
              handleBack();
            } else {
              navigate('/dashboard-v2');
            }
          }} 
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          {currentFolder ? 'Folder Contents' : 'Shared with Me'}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : sharedFolders.length === 0 && files.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {currentFolder ? 'This folder is empty' : 'No folders have been shared with you yet'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {sharedFolders.map((folder) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  onClick={() => handleFolderClick(folder.id)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <FolderIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{folder.name}</Typography>
                      {folder.sharedWith && folder.sharedWith.length > 0 && (
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                Shared with:
                              </Typography>
                              {folder.sharedWith.map((email, idx) => (
                                <Typography key={idx} variant="body2">
                                  {email}
                                </Typography>
                              ))}
                            </Box>
                          }
                        >
                          <CloudIcon 
                            sx={{ 
                              fontSize: 20,
                              color: 'text.secondary',
                              opacity: 0.6,
                              transition: 'opacity 0.2s',
                              '&:hover': {
                                opacity: 1
                              }
                            }} 
                          />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(folder.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Paper>
              </motion.div>
            </Grid>
          ))}
          {files.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  onClick={() => handleFileClick(file)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <FileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{file.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Bottom Navigation for Mobile */}
      <Paper
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        elevation={3}
      >
        <BottomNavigation
          value={currentView}
          onChange={(_, newValue) => {
            setCurrentView(newValue);
            if (newValue === 'shared') {
              navigate('/dashboard-v2/shared');
            } else {
              navigate('/dashboard-v2');
            }
          }}
          showLabels
          sx={{
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <BottomNavigationAction 
            label="Personal" 
            icon={<FolderIcon />}
            value="personal"
          />
          <BottomNavigationAction 
            label="Shared" 
            icon={<FolderSharedIcon />}
            value="shared"
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default SharedFolder;
