import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button,
  Chip,
  Paper,
  Grid,
  Menu,
  MenuItem,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CardActions,
  useTheme,
  Tooltip,
  CircularProgress,
  Fade,
  Slide,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useMediaQuery,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Slider,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CloudUpload as CloudUploadIcon,
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CloudQueue as CloudIcon,
  DeleteOutline,
  CalendarToday,
  FolderShared,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Folder as FolderIcon,
  Create as RenameIcon,
  ArrowBack as ArrowBackIcon,
  Create as CreateIcon,
  DriveFileRenameOutline as DriveFileRenameOutlineIcon,
  Description as FileIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DefaultFileIcon,
  CreateNewFolder as CreateNewFolderIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { firestore, storage, auth } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, addDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import logo from '../../assets/logo.png';
import { useNavigate, useParams } from 'react-router-dom';
import Calendar from './Calendar';
import FolderManager from './FolderManager';
import FileUploader from './FileUploader';
import TextFileCreator from './TextFileCreator';
import MediaViewer from './MediaViewer';

// Styled Components
const StyledSearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 30,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 15,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const FolderCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
      : '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const FileCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
      : '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  height: 200,
  backgroundColor: theme.palette.grey[100],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  overflow: 'hidden',
}));

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  downloadURL: string;
  createdAt: string;
  path: string;
  folderPath?: string;
  folderId?: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
  sharedWith: string[];
}

interface User {
  displayName: string | null;
  email: string | null;
  photoURL: string | undefined;
  uid: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Mock user data
const mockUser: User = {
  displayName: "John Doe",
  email: "john.doe@example.com",
  photoURL: "https://ui-avatars.com/api/?name=John+Doe&background=random",
  uid: "mock-user-123"
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon />;
  if (type.startsWith('video/')) return <VideoIcon />;
  if (type === 'application/pdf') return <PdfIcon />;
  if (type.includes('text/')) return <FileIcon />;
  return <DefaultFileIcon />;
};

const DashboardV2: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { folderId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [cardSize, setCardSize] = useState<number>(3);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState('personal');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderNameError, setFolderNameError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileMenuAnchor, setFileMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [folderMenuAnchor, setFolderMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isTextFileCreatorOpen, setIsTextFileCreatorOpen] = useState(false);
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; value: string }>({
    open: false,
    value: ''
  });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: ''
  });
  const [selectedViewerFile, setSelectedViewerFile] = useState<FileItem | null>(null);
  const user = currentUser || mockUser;

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const showRenameDialog = (currentName: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setIsRenameDialogOpen(true);
      setRenameDialog({
        open: true,
        value: currentName
      });

      const handleClose = (newName: string | null) => {
        setIsRenameDialogOpen(false);
        setRenameDialog({ open: false, value: '' });
        resolve(newName);
      };

      (window as any).handleRenameDialogClose = handleClose;
    });
  };

  const showConfirmDialog = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        open: true,
        title,
        message
      });

      const handleClose = (confirmed: boolean) => {
        setConfirmDialog({ open: false, title: '', message: '' });
        resolve(confirmed);
      };

      (window as any).handleConfirmDialogClose = handleClose;
    });
  };

  const refreshFiles = useCallback(() => {
    fetchFiles();
  }, [/* dependencies */]);

  const renameFile = async (fileId: string, newName: string) => {
    try {
      const fileRef = doc(firestore, 'files', fileId);
      await updateDoc(fileRef, {
        name: newName
      });
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    console.log('Deleting file', fileId);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchFolders = async () => {
    if (!currentUser) return;
    try {
      const foldersRef = collection(firestore, 'folders');
      const q = query(
        foldersRef,
        where('parentId', '==', currentFolder),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const ownedFolders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt || new Date().toISOString(),
        parentId: doc.data().parentId,
        sharedWith: doc.data().sharedWith || []
      })) as FolderItem[];
      
      console.log('Fetched folders:', ownedFolders);
      setFolders(ownedFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const filesRef = collection(firestore, 'files');
      
      const ownedQuery = query(
        filesRef,
        where('userId', '==', currentUser.uid),
        where('folderId', '==', currentFolder)
      );
      const ownedSnapshot = await getDocs(ownedQuery);
      
      const fetchedFiles: FileItem[] = [];
      
      for (const doc of ownedSnapshot.docs) {
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
            path: storagePath
          });
        } catch (error) {
          console.error(`Error fetching file ${fileData.name}:`, error);
          console.log('File data:', fileData);
        }
      }
      
      console.log('Fetched files:', fetchedFiles);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFolderPath = async (folderId: string | null): Promise<string> => {
    if (!folderId) return '';
    try {
      const folderDoc = await getDoc(doc(firestore, 'folders', folderId));
      if (!folderDoc.exists()) return '';
      
      const folderData = folderDoc.data();
      const parentPath = await getFolderPath(folderData.parentId);
      return parentPath ? `${parentPath}/${folderData.name}` : folderData.name;
    } catch (error) {
      console.error('Error getting folder path:', error);
      return '';
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const searchLower = term.toLowerCase();

      // If search term is empty, reset to normal view
      if (!term.trim()) {
        fetchFolders();
        fetchFiles();
        return;
      }

      // Search in folders
      const foldersRef = collection(firestore, 'folders');
      const foldersQuery = query(
        foldersRef,
        where('userId', '==', currentUser.uid)
      );
      const foldersSnapshot = await getDocs(foldersQuery);
      const filteredFolders = foldersSnapshot.docs
        .filter(doc => {
          const folderData = doc.data();
          return (
            folderData.parentId === currentFolder &&
            folderData.name.toLowerCase().includes(searchLower)
          );
        })
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt || new Date().toISOString(),
          parentId: doc.data().parentId,
          sharedWith: doc.data().sharedWith || []
        })) as FolderItem[];
      
      // Search in all files
      const filesRef = collection(firestore, 'files');
      const filesQuery = query(
        filesRef,
        where('userId', '==', currentUser.uid)
      );
      const filesSnapshot = await getDocs(filesQuery);
      const filteredFiles: FileItem[] = [];

      for (const doc of filesSnapshot.docs) {
        const fileData = doc.data();
        if (fileData.name.toLowerCase().includes(searchLower)) {
          try {
            const storagePath = fileData.path || fileData.url;
            const fileRef = ref(storage, storagePath);
            const downloadURL = fileData.downloadURL || await getDownloadURL(fileRef);
            const folderPath = await getFolderPath(fileData.folderId);

            filteredFiles.push({
              id: doc.id,
              name: fileData.name,
              type: fileData.type || 'application/octet-stream',
              size: fileData.size || 0,
              downloadURL,
              createdAt: fileData.createdAt || new Date().toISOString(),
              path: storagePath,
              folderPath,
              folderId: fileData.folderId
            });
          } catch (error) {
            console.error(`Error fetching file ${fileData.name}:`, error);
          }
        }
      }

      setFolders(filteredFolders);
      setFiles(filteredFiles);

      // Log search results
      console.log(`Search results for "${term}":`, {
        folders: filteredFolders.length,
        files: filteredFiles.length
      });
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search to avoid too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (folderId) {
      setCurrentFolder(folderId);
    }
  }, [folderId]);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentUser, currentFolder]);

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  const handleBackClick = async () => {
    if (!currentFolder) return;
    
    try {
      const folderDoc = await getDoc(doc(firestore, 'folders', currentFolder));
      if (folderDoc.exists()) {
        setCurrentFolder(folderDoc.data().parentId);
      }
    } catch (error) {
      console.error('Error navigating back:', error);
    }
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      fetchFiles();
      return;
    }

    const filteredFiles = files.filter(file => {
      if (filter === 'pdf') return file.type === 'application/pdf';
      if (filter === 'image') return file.type.startsWith('image/');
      if (filter === 'document') {
        return ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain'].includes(file.type);
      }
      return true;
    });
    setFiles(filteredFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleAddMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  const handleSharedFolderClick = () => {
    navigate('/dashboard-v2/shared');
  };

  const handleFolderMenuClick = (event: React.MouseEvent<HTMLElement>, folder: FolderItem) => {
    event.stopPropagation();
    setFolderMenuAnchor({ ...folderMenuAnchor, [folder.id]: event.currentTarget });
    setSelectedFolder(folder);
  };

  const handleFolderMenuClose = (folderId: string) => {
    setFolderMenuAnchor({ ...folderMenuAnchor, [folderId]: null });
  };

  const handleShare = async () => {
    if (!selectedFolder || !shareEmail || !currentUser) return;
    
    try {
      console.log('Starting share process...');
      console.log('Current user:', currentUser.email);
      console.log('Sharing with:', shareEmail);
      
      // Check if the email is valid
      if (!shareEmail.includes('@')) {
        setShareError('Please enter a valid email address');
        return;
      }

      // Check if user is trying to share with themselves
      if (shareEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
        setShareError('You cannot share a folder with yourself');
        return;
      }

      const normalizedEmail = shareEmail.toLowerCase().trim();
      console.log('Normalized email:', normalizedEmail);

      // Check if the folder is already shared with this user
      const currentSharedWith = (selectedFolder.sharedWith || []) as string[];
      if (currentSharedWith.includes(normalizedEmail)) {
        setShareError('This folder is already shared with this user');
        return;
      }

      const folderRef = doc(firestore, 'folders', selectedFolder.id);
      
      console.log('Updating folder with new shared user');
      // Add the email to the shared list
      await updateDoc(folderRef, {
        sharedWith: [...currentSharedWith, normalizedEmail]
      });

      console.log('Share successful');
      setShareSuccess('Folder shared successfully!');
      setIsShareDialogOpen(false);
      setShareEmail('');
      fetchFolders();
    } catch (error) {
      console.error('Error sharing folder:', error);
      setShareError('Failed to share folder. Please try again.');
    }
  };

  const handleRemoveShare = async (emailToRemove: string) => {
    if (!selectedFolder) return;

    try {
      const folderRef = doc(firestore, 'folders', selectedFolder.id);
      const currentSharedWith = (selectedFolder.sharedWith || []) as string[];
      const updatedSharedWith = currentSharedWith.filter(
        email => email !== emailToRemove
      );

      await updateDoc(folderRef, {
        sharedWith: updatedSharedWith
      });

      setShareSuccess(`Removed ${emailToRemove} from shared users`);
      fetchFolders();
    } catch (error) {
      console.error('Error removing shared user:', error);
      setShareError('Failed to remove user. Please try again.');
    }
  };

  const handleRename = async () => {
    if (!selectedFolder || !newFolderName) return;
    try {
      const folderRef = doc(firestore, 'folders', selectedFolder.id);
      await updateDoc(folderRef, { name: newFolderName });
      setIsRenameDialogOpen(false);
      setNewFolderName('');
      fetchFolders();
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.includes('text/')) {
      try {
        // Get the download URL
        const storageRef = ref(storage, file.path);
        const downloadURL = await getDownloadURL(storageRef);
        
        setSelectedViewerFile({
          ...file,
          downloadURL
        });
      } catch (error) {
        console.error('Error getting download URL:', error);
      }
    } else {
      window.open(file.downloadURL, '_blank');
    }
  };

  const handleFileMenuClick = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
    event.stopPropagation();
    setFileMenuAnchor({ ...fileMenuAnchor, [file.id]: event.currentTarget });
    setSelectedFile(file);
  };

  const handleFileMenuClose = (fileId: string) => {
    setFileMenuAnchor({ ...fileMenuAnchor, [fileId]: null });
  };

  const handleFileDelete = async () => {
    if (!selectedFile) return;
    
    const confirmDelete = await showConfirmDialog(
      'Delete File',
      `Are you sure you want to delete "${selectedFile.name}"?`
    );
    
    if (confirmDelete) {
      try {
        await deleteFile(selectedFile.id);
        refreshFiles();
        showSnackbar('File deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting file:', error);
        showSnackbar('Failed to delete file', 'error');
      }
    }
    handleFileMenuClose(selectedFile.id);
  };

  const handleFileRename = async () => {
    if (!selectedFile) return;
    
    const newName = await showRenameDialog(selectedFile.name);
    if (newName && newName !== selectedFile.name) {
      try {
        await renameFile(selectedFile.id, newName);
        refreshFiles();
        showSnackbar('File renamed successfully', 'success');
      } catch (error) {
        console.error('Error renaming file:', error);
        showSnackbar('Failed to rename file', 'error');
      }
    }
    handleFileMenuClose(selectedFile.id);
  };

  const handleCreateFolderClick = () => {
    setCreateFolderDialogOpen(true);
    handleDrawerToggle(); // Close the drawer when opening dialog
  };

  const handleCloseCreateFolderDialog = () => {
    setCreateFolderDialogOpen(false);
    setFolderNameError(null);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setFolderNameError('Please enter a folder name');
      return;
    }

    setIsCreatingFolder(true);
    try {
      const folderRef = collection(firestore, 'folders');
      const newFolder = {
        name: newFolderName.trim(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.email || '',
        parentId: currentFolder,
        sharedWith: [],
        type: 'folder'
      };

      const docRef = await addDoc(folderRef, newFolder);
      const folderWithId = { ...newFolder, id: docRef.id };
      
      setFolders(prev => [...prev, folderWithId]);
      handleCloseCreateFolderDialog();
      setSnackbar({
        open: true,
        message: 'Folder created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      setSnackbar({
        open: true,
        message: 'Error creating folder',
        severity: 'error'
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 3 }, 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      pb: { xs: 7, sm: 3 } // Add padding bottom for mobile to account for bottom navigation
    }}>
      <Fade in timeout={1000}>
        <Box>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            gap: { xs: 1, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: { xs: 0.5, sm: 1 } }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <img
                src={logo}
                alt="PrimeCloud Logo"
                style={{ height: isMobile ? '32px' : '40px' }}
              />
              <Typography
                variant={isMobile ? "h6" : "h4"}
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px'
                }}
              >
                PrimeCloud
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              <IconButton 
                onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={settingsAnchorEl}
                open={Boolean(settingsAnchorEl)}
                onClose={() => setSettingsAnchorEl(null)}
                PaperProps={{
                  sx: {
                    width: 320,
                    p: 2,
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Card Size
                  </Typography>
                  <Slider
                    value={cardSize}
                    min={2}
                    max={6}
                    step={1}
                    onChange={(_, value) => setCardSize(value as number)}
                    marks={[
                      { value: 2, label: 'Large' },
                      { value: 4, label: 'Medium' },
                      { value: 6, label: 'Small' },
                    ]}
                    sx={{
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
              </Menu>
              <IconButton 
                onClick={toggleDarkMode}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                  cursor: 'pointer',
                }}
              >
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 }
          }}>
            <StyledSearchBar
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleAddMenuClick}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderRadius: 30,
                  px: { xs: 2, sm: 3 },
                  flex: { xs: 1, sm: 'none' },
                }}
              >
                Upload
              </Button>
              <Menu
                anchorEl={addMenuAnchorEl}
                open={Boolean(addMenuAnchorEl)}
                onClose={handleAddMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem
                  onClick={() => {
                    setIsUploadOpen(true);
                    handleAddMenuClose();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 200,
                  }}
                >
                  <ListItemIcon>
                    <CloudUploadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Upload Files</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setCreateFolderDialogOpen(true);
                    handleAddMenuClose();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 200,
                  }}
                >
                  <ListItemIcon>
                    <CreateNewFolderIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Create Folder</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setIsTextFileCreatorOpen(true);
                    handleAddMenuClose();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 200,
                  }}
                >
                  <ListItemIcon>
                    <CreateIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Create Text File</ListItemText>
                </MenuItem>
              </Menu>
              <IconButton 
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                <FilterIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 3
          }}>
            <Button
              variant="outlined"
              startIcon={<DeleteOutline />}
              onClick={() => navigate('/dashboard-v2/recycle-bin')}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderRadius: 2,
                px: 3,
                py: 1,
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter'
                }
              }}
            >
              Recycle Bin
            </Button>
            <Button
              variant="outlined"
              startIcon={<CalendarToday />}
              onClick={() => setShowCalendar(!showCalendar)}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderRadius: 2,
                px: 3,
                py: 1,
                color: showCalendar ? 'primary.main' : 'text.secondary',
                borderColor: showCalendar ? 'primary.main' : 'divider',
                bgcolor: showCalendar ? 'primary.lighter' : 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter'
                }
              }}
            >
              Calendar
            </Button>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 2
          }}>
            {currentFolder && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackClick}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  mb: 2,
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter'
                  }
                }}
              >
                Back
              </Button>
            )}
          </Box>
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={12} sm={6} md={cardSize} lg={cardSize} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <div>
                <FolderCard onClick={handleSharedFolderClick}>
                  <FilePreview>
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'secondary.lighter',
                      }}
                    >
                      <FolderShared
                        sx={{ fontSize: 64, color: 'secondary.main' }}
                      />
                    </Box>
                  </FilePreview>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    >
                      Shared
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Shared files and folders
                    </Typography>
                  </CardContent>
                </FolderCard>
              </div>
            </Grid>
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={cardSize} lg={cardSize} key={folder.id}>
                <div>
                  <FolderCard onClick={() => handleFolderClick(folder.id)}>
                    <FilePreview>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.lighter',
                        }}
                      >
                        <FolderIcon
                          sx={{ fontSize: 64, color: 'primary.main' }}
                        />
                      </Box>
                    </FilePreview>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="subtitle1"
                              noWrap
                              sx={{
                                fontWeight: 500,
                                color: 'text.primary',
                              }}
                            >
                              {folder.name}
                            </Typography>
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
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {new Date(folder.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderMenuClick(e, folder);
                          }}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </FolderCard>
                </div>
              </Grid>
            ))}
            {files
              .filter(file =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((file) => (
                <Grid item xs={12} sm={6} md={cardSize} lg={cardSize} key={file.id}>
                  <div>
                    <FileCard onClick={() => handleFileClick(file)}>
                      <FilePreview>
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.downloadURL}
                            alt={file.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}
                          >
                            <Typography variant="h1" color="textSecondary">
                              {file.name.slice(-3).toUpperCase()}
                            </Typography>
                          </Box>
                        )}
                      </FilePreview>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography
                            variant="subtitle1"
                            noWrap
                            sx={{
                              fontWeight: 500,
                              color: 'text.primary',
                              flex: 1,
                            }}
                          >
                            {file.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleFileMenuClick(e, file)}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': { bgcolor: 'action.hover' },
                              ml: 1,
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatFileSize(file.size)}
                        </Typography>
                      </CardContent>
                    </FileCard>
                  </div>
                </Grid>
              ))}
          </Grid>
          <Box sx={{ mt: 4 }}>
            {!loading && files.length === 0 && folders.length === 0 && (
              <Typography color="text.secondary" align="center">
                No files in this folder
              </Typography>
            )}
          </Box>
        </Box>
      </Fade>

      <Dialog
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Files
          <IconButton
            aria-label="close"
            onClick={() => setIsUploadOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FileUploader
            currentFolder={currentFolder}
            onFileUploaded={() => {
              fetchFiles();
              setIsUploadOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {isTextFileCreatorOpen && (
        <TextFileCreator
          currentFolder={currentFolder}
          onFileCreated={() => {
            fetchFiles();
            setIsTextFileCreatorOpen(false);
          }}
          onClose={() => setIsTextFileCreatorOpen(false)}
        />
      )}

      {selectedFolder && (
        <Menu
          anchorEl={folderMenuAnchor[selectedFolder.id]}
          open={Boolean(folderMenuAnchor[selectedFolder.id])}
          onClose={() => handleFolderMenuClose(selectedFolder.id)}
        >
          <MenuItem onClick={() => {
            setIsShareDialogOpen(true);
            handleFolderMenuClose(selectedFolder.id);
          }}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            setIsRenameDialogOpen(true);
            handleFolderMenuClose(selectedFolder.id);
          }}>
            <ListItemIcon>
              <RenameIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            // handleDeleteFolder(selectedFolder.id);
            handleFolderMenuClose(selectedFolder.id);
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

      {selectedFile && (
        <Menu
          anchorEl={fileMenuAnchor[selectedFile.id]}
          open={Boolean(fileMenuAnchor[selectedFile.id])}
          onClose={() => handleFileMenuClose(selectedFile.id)}
        >
          <MenuItem onClick={() => window.open(selectedFile.downloadURL, '_blank')}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleFileRename}>
            <ListItemIcon>
              <DriveFileRenameOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleFileDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

      <Dialog open={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)}>
        <DialogTitle>Share Folder</DialogTitle>
        <DialogContent>
          {shareError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {shareError}
            </Alert>
          )}
          {shareSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {shareSuccess}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          {selectedFolder?.sharedWith && selectedFolder.sharedWith.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Shared with:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(selectedFolder.sharedWith as string[]).map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleRemoveShare(email)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShare} variant="contained">Share</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!shareSuccess}
        autoHideDuration={6000} 
        onClose={() => setShareSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShareSuccess(null)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {shareSuccess}
        </Alert>
      </Snackbar>

      <Dialog open={renameDialog.open} onClose={() => (window as any).handleRenameDialogClose(null)}>
        <DialogTitle>Rename</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New name"
            fullWidth
            value={renameDialog.value}
            onChange={(e) => setRenameDialog(prev => ({ ...prev, value: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (window as any).handleRenameDialogClose(null)}>Cancel</Button>
          <Button onClick={() => (window as any).handleRenameDialogClose(renameDialog.value)}>Rename</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog.open} onClose={() => (window as any).handleConfirmDialogClose(false)}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (window as any).handleConfirmDialogClose(false)}>Cancel</Button>
          <Button onClick={() => (window as any).handleConfirmDialogClose(true)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog 
        open={createFolderDialogOpen} 
        onClose={handleCloseCreateFolderDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            error={!!folderNameError}
            helperText={folderNameError}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateFolderDialog}>Cancel</Button>
          <Button
            onClick={handleCreateFolder}
            variant="contained"
            disabled={!newFolderName.trim() || isCreatingFolder}
          >
            {isCreatingFolder ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <img
              src={logo}
              alt="PrimeCloud Logo"
              style={{ height: '32px' }}
            />
            <Typography
              variant="h6"
              sx={{
                ml: 2,
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px'
              }}
            >
              PrimeCloud
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ mt: 2 }}>
            {/* Upload Button */}
            <Box sx={{ px: 2, mb: 3 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<CloudUploadIcon />}
                onClick={() => {
                  setIsUploadOpen(true);
                  handleDrawerToggle();
                }}
                sx={{
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 2,
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                Upload
              </Button>
            </Box>

            {/* Create Actions */}
            <List sx={{ px: 1, mb: 2 }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleCreateFolderClick}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40, ml: 1 }}>
                    <CreateNewFolderIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Create Folder"
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                    sx={{ ml: -0.5 }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setIsTextFileCreatorOpen(true);
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40, fontSize: 24 }}>
                    <CreateIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Create Text File"
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>

            <Divider sx={{ my: 1 }} />

            {/* Navigation Items */}
            <List sx={{ px: 1 }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={toggleDarkMode}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40, fontSize: 24 }}>
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={darkMode ? "Light Mode" : "Dark Mode"}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setShowCalendar(!showCalendar);
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40, fontSize: 24 }}>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Calendar"
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate('/dashboard-v2/recycle-bin');
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40, fontSize: 24 }}>
                    <DeleteOutline />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Recycle Bin"
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>

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
        </BottomNavigation>
      </Paper>

      <MediaViewer
        open={!!selectedViewerFile}
        onClose={() => setSelectedViewerFile(null)}
        file={selectedViewerFile}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default DashboardV2;
