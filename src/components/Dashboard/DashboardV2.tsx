import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  TextField,
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Grid,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Chip,
  Paper,
  InputAdornment,
  Divider,
  CardContent,
  CardActions,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  AppBar,
  Toolbar,
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
  Description,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DefaultFileIcon,
  CreateNewFolder as CreateNewFolderIcon,
  GetApp as GetAppIcon,
  SwapHoriz as SwapHorizIcon,
  NoteAdd as NoteAddIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { firestore, storage, auth } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { useNavigate, useParams } from 'react-router-dom';
import Calendar from './Calendar';
import FolderManager from './FolderManager';
import FileUploader from './FileUploader';
import TextFileCreator from './TextFileCreator';
import MediaViewer from './MediaViewer';
import UnderImplementation from './UnderImplementation';
import CalendarModal from './CalendarModal';
import UploadSuccess from './UploadSuccess';
import TopBar from '../Layout/TopBar';
import AnimatedUploadIcon from '../Icons/AnimatedUploadIcon';
import ActionBar from './ActionBar';
import logo from '../../assets/logo.png';
import DashboardHeader from './DashboardHeader';

// Styled Components
const StyledSearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1,
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
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

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Mock user data
const mockUser = {
  displayName: "John Doe",
  email: "john.doe@example.com",
  photoURL: "https://ui-avatars.com/api/?name=John+Doe&background=random",
  uid: "mock-user-123"
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon />;
  if (type.startsWith('video/')) return <VideoIcon />;
  if (type === 'application/pdf') return <PdfIcon />;
  if (type.includes('text/')) return <Description />;
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
  const [cardSize, setCardSize] = useState<number>(2);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderNameError, setFolderNameError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileMenuAnchor, setFileMenuAnchor] = useState<HTMLElement | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [folderMenuAnchor, setFolderMenuAnchor] = useState<null | HTMLElement>(null);
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
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<{ show: boolean; fileName: string }>({ show: false, fileName: '' });
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
    fetchFolders();
  }, [currentFolder, currentUser]);

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
    try {
      // Get the file reference from Firestore
      const fileRef = doc(firestore, 'files', fileId);
      const fileDoc = await getDoc(fileRef);
      
      if (!fileDoc.exists()) {
        throw new Error('File not found');
      }

      const fileData = fileDoc.data();
      
      // Delete the file from Firebase Storage
      const storageRef = ref(storage, fileData.path);
      await deleteObject(storageRef);
      
      // Delete the file metadata from Firestore
      await deleteDoc(fileRef);
      
      console.log('File deleted successfully:', fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
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
      const foldersQuery = query(
        foldersRef,
        where('userId', '==', currentUser.uid),
        where('parentId', '==', currentFolder)
      );
      
      const foldersSnapshot = await getDocs(foldersQuery);
      const fetchedFolders: FolderItem[] = foldersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt,
        parentId: doc.data().parentId,
        sharedWith: doc.data().sharedWith || []
      }));
      
      console.log('Fetched folders:', fetchedFolders);
      setFolders(fetchedFolders);
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
    refreshFiles();
  }, [currentUser, currentFolder]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles, currentFolder]);

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
    console.log('Menu Click - Event:', event);
    console.log('Menu Click - Folder:', folder);
    event.stopPropagation();
    setSelectedFolder(folder);
    setFolderMenuAnchor(event.currentTarget);
  };

  const handleFolderMenuClose = () => {
    console.log('Menu Close');
    setSelectedFolder(null);
    setFolderMenuAnchor(null);
  };

  const handleFolderMenuItemClick = async (action: string) => {
    console.log('Menu Item Click - Action:', action);
    console.log('Menu Item Click - Selected Folder:', selectedFolder);
    
    if (!selectedFolder) {
      console.log('No folder selected!');
      return;
    }

    switch (action) {
      case 'rename':
        console.log('Attempting rename...');
        await handleFolderRename(selectedFolder);
        break;
      case 'share':
        console.log('Opening share dialog...');
        setIsShareDialogOpen(true);
        setShareEmail('');
        setShareError(null);
        setShareSuccess(null);
        break;
      case 'delete':
        console.log('Attempting delete...');
        await handleFolderDelete(selectedFolder.id);
        break;
    }
    handleFolderMenuClose();
  };

  const handleShareDialogClose = () => {
    setIsShareDialogOpen(false);
    setShareEmail('');
    setShareError(null);
    setShareSuccess(null);
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

  const handleFileClick = (file: FileItem) => {
    if (isPreviewable(file.type)) {
      setSelectedFile(file);
    } else {
      // Handle download or other actions for non-previewable files
      window.open(file.downloadURL, '_blank');
    }
  };

  const isPreviewable = (type: string): boolean => {
    return [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mpeg', 'audio/ogg', 'audio/wav',
      'application/pdf',
      'text/plain'
    ].includes(type);
  };

  const handleFileMenuClick = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
    console.log('File Menu Click - Event:', event);
    console.log('File Menu Click - File:', file);
    event.stopPropagation();
    setSelectedFile(file);
    setFileMenuAnchor(event.currentTarget);
  };

  const handleFileMenuClose = () => {
    console.log('File Menu Close');
    setSelectedFile(null);
    setFileMenuAnchor(null);
  };

  const handleFileMenuItemClick = async (action: string) => {
    console.log('File Menu Item Click - Action:', action);
    console.log('File Menu Item Click - Selected File:', selectedFile);
    
    if (!selectedFile) {
      console.log('No file selected!');
      return;
    }

    switch (action) {
      case 'rename':
        console.log('Attempting file rename...');
        const newName = await showRenameDialog(selectedFile.name);
        if (newName) {
          try {
            const fileRef = doc(firestore, 'files', selectedFile.id);
            await updateDoc(fileRef, { name: newName });
            refreshFiles();
            showSnackbar('File renamed successfully', 'success');
          } catch (error) {
            console.error('Error renaming file:', error);
            showSnackbar('Error renaming file', 'error');
          }
        }
        break;
      case 'delete':
        console.log('Attempting file delete...');
        const confirmed = await showConfirmDialog(
          'Delete File',
          `Are you sure you want to delete "${selectedFile.name}"?`
        );
        if (confirmed) {
          try {
            await deleteDoc(doc(firestore, 'files', selectedFile.id));
            const storageRef = ref(storage, selectedFile.path);
            await deleteObject(storageRef);
            refreshFiles();
            showSnackbar('File deleted successfully', 'success');
          } catch (error) {
            console.error('Error deleting file:', error);
            showSnackbar('Error deleting file', 'error');
          }
        }
        break;
    }
    handleFileMenuClose();
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

    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to create folders',
        severity: 'error'
      });
      return;
    }

    setIsCreatingFolder(true);
    try {
      const folderRef = collection(firestore, 'folders');
      const newFolder = {
        name: newFolderName.trim(),
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
        createdBy: currentUser.email || '',
        parentId: currentFolder,
        sharedWith: [],
        type: 'folder'
      };

      const docRef = await addDoc(folderRef, newFolder);
      
      // Refresh folders instead of manually updating state
      await refreshFiles();
      
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

  const handleTrashClick = () => {
    setIsTrashDialogOpen(true);
  };

  const handleCalendarClick = () => {
    setIsCalendarOpen(true);
  };

  const handleFolderDelete = async (folderId: string) => {
    if (!currentUser) return;
    
    const confirmed = await showConfirmDialog(
      'Delete Folder',
      'Are you sure you want to delete this folder? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const folderRef = doc(firestore, 'folders', folderId);
      await deleteDoc(folderRef);
      refreshFiles();
      showSnackbar('Folder deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting folder:', error);
      showSnackbar('Failed to delete folder', 'error');
    }
  };

  const handleFolderRename = async (folder: FolderItem) => {
    const newName = await showRenameDialog(folder.name);
    if (!newName || newName === folder.name) return;

    try {
      const folderRef = doc(firestore, 'folders', folder.id);
      await updateDoc(folderRef, { name: newName });
      refreshFiles();
      showSnackbar('Folder renamed successfully', 'success');
    } catch (error) {
      console.error('Error renaming folder:', error);
      showSnackbar('Failed to rename folder', 'error');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (window.location.pathname === '/trash') {
      return <UnderImplementation />;
    }

    if (window.location.pathname === '/calendar') {
      return <Calendar />;
    }

    return (
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
                    ) : file.type.startsWith('video/') ? (
                      <video
                        src={file.downloadURL}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        preload="metadata"
                      />
                    ) : file.type === 'application/pdf' ? (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#ffebee'
                        }}
                      >
                        <PdfIcon sx={{ fontSize: 48, color: '#f44336' }} />
                      </Box>
                    ) : file.type.startsWith('text/') ? (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#e3f2fd'
                        }}
                      >
                        <Description sx={{ fontSize: 48, color: '#2196f3' }} />
                      </Box>
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
                        {getFileIcon(file.type)}
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
    );
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
          <TopBar 
            onDrawerToggle={isMobile ? handleDrawerToggle : undefined}
            onLogout={handleLogout}
            user={user}
            cardSize={cardSize}
            onCardSizeChange={setCardSize}
            onSearch={handleSearch}
            showSearch={isMobile}
          />
          {/* Desktop Action Bar */}
          {!isMobile && (
            <ActionBar
              onSearch={handleSearch}
              onUpload={() => setIsUploadOpen(true)}
              onCreate={() => setIsTextFileCreatorOpen(true)}
              onCreateFolder={() => setCreateFolderDialogOpen(true)}
              onGetApp={() => {
                window.open('https://drive.google.com/drive/download', '_blank');
              }}
              onTransfer={() => {
                showSnackbar('Transfer feature coming soon!', 'success');
              }}
              onShare={() => setIsShareDialogOpen(true)}
              onViewChange={(view) => setCurrentView(view)}
              currentView={currentView}
              onTrash={() => setIsTrashDialogOpen(true)}
            />
          )}
          <Box sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              mb: 3
            }}>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleTrashClick}
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
            {renderContent()}
            <Box sx={{ mt: 4 }}>
              {!loading && files.length === 0 && folders.length === 0 && (
                <Typography color="text.secondary" align="center">
                  No files in this folder
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Fade>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          <Box sx={{ overflow: 'auto' }}>
            {/* Logo and Name */}
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <img src={logo} alt="Logo" style={{ width: 32, height: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                PrimeCloud
              </Typography>
            </Box>

            <List>
              {/* File Operations */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  setIsUploadOpen(true);
                  handleDrawerToggle();
                }}>
                  <ListItemIcon>
                    <CloudUploadIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Upload" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  setIsTextFileCreatorOpen(true);
                  handleDrawerToggle();
                }}>
                  <ListItemIcon>
                    <NoteAddIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Create File" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  setCreateFolderDialogOpen(true);
                  handleDrawerToggle();
                }}>
                  <ListItemIcon>
                    <CreateNewFolderIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="New Folder" />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />

              {/* Sharing & Transfer */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  setIsShareDialogOpen(true);
                  handleDrawerToggle();
                }}>
                  <ListItemIcon>
                    <ShareIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Share" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  showSnackbar('Transfer feature coming soon!', 'success');
                  handleDrawerToggle();
                }}>
                  <ListItemIcon>
                    <SwapHorizIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Transfer" />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />

              {/* System Operations */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  window.open('https://drive.google.com/drive/download', '_blank');
                  handleDrawerToggle();
                }}>
                  <ListItemIcon>
                    <GetAppIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Get App" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  setIsTrashDialogOpen(true);
                  handleDrawerToggle();
                }}>
                  <ListItemIcon>
                    <DeleteIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Trash" />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />
              
              {/* Account */}
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      )}
      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onClose={() => (window as any).handleRenameDialogClose(null)}>
        <DialogTitle>Rename</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={renameDialog.value}
            onChange={(e) => setRenameDialog({ ...renameDialog, value: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (window as any).handleRenameDialogClose(null)}>Cancel</Button>
          <Button onClick={() => (window as any).handleRenameDialogClose(renameDialog.value)} variant="contained" color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => (window as any).handleConfirmDialogClose(false)}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (window as any).handleConfirmDialogClose(false)}>Cancel</Button>
          <Button onClick={() => (window as any).handleConfirmDialogClose(true)} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Folder Menu */}
      <Menu
        anchorEl={folderMenuAnchor}
        open={Boolean(folderMenuAnchor)}
        onClose={handleFolderMenuClose}
      >
        <MenuItem onClick={() => handleFolderMenuItemClick('rename')}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFolderMenuItemClick('share')}>
          <ListItemIcon>
            <ShareIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFolderMenuItemClick('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onClose={handleShareDialogClose}>
        <DialogTitle>Share Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            error={Boolean(shareError)}
            helperText={shareError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareDialogClose}>Cancel</Button>
          <Button onClick={handleShare} variant="contained" color="primary">
            Share
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        maxWidth="md"
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
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FileUploader
            currentFolder={currentFolder}
            onFileUploaded={() => {
              setIsUploadOpen(false);
              refreshFiles();
              setUploadSuccess({ show: true, fileName: 'Files' });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Upload Success Dialog */}
      <UploadSuccess
        open={uploadSuccess.show}
        onClose={() => setUploadSuccess({ show: false, fileName: '' })}
        fileName={uploadSuccess.fileName}
      />
      {/* Create Folder Dialog */}
      <Dialog
        open={createFolderDialogOpen}
        onClose={handleCloseCreateFolderDialog}
        aria-labelledby="create-folder-dialog-title"
      >
        <DialogTitle id="create-folder-dialog-title">Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="folder-name"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            error={!!folderNameError}
            helperText={folderNameError}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateFolderDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolder} 
            color="primary"
            disabled={isCreatingFolder}
          >
            {isCreatingFolder ? (
              <CircularProgress size={24} />
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Menu */}
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={handleFileMenuClose}
      >
        <MenuItem onClick={() => handleFileMenuItemClick('rename')}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFileMenuItemClick('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DashboardV2;
