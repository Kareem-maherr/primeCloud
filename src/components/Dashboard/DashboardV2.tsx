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
import { collection, query, where, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import logo from '../../assets/logo.png';
import { useNavigate, useParams } from 'react-router-dom';
import Calendar from './Calendar';
import FolderManager from './FolderManager';
import FileUploader from './FileUploader';
import TextFileCreator from './TextFileCreator';
import MediaViewer from './MediaViewer';
import UnderImplementation from './UnderImplementation';
import CalendarModal from './CalendarModal';
import UploadSuccess from './UploadSuccess';
import ActionBar from './ActionBar';
import Sidebar from './Sidebar';
import CustomBottomBar from '../UI/CustomBottomBar';
import { User as FirebaseUser } from 'firebase/auth';
import WeatherCard from '../UI/WeatherCard';
import CollaborativeEditor from '../Editor/CollaborativeEditor';
import StorageNoti from '../UI/StorageNoti';

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
  fullPath?: string;
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

interface User extends Partial<FirebaseUser> {}

// Mock user data
const mockUser: User = {
  displayName: "John Doe",
  email: "john.doe@example.com",
  photoURL: undefined,
  uid: "mock-user-id"
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
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
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
  const [cardSize, setCardSize] = useState<number>(2.2);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<{ show: boolean; fileName: string }>({ show: false, fileName: '' });
  const [bottomNavValue, setBottomNavValue] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
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
  }, [currentFolderId, currentUser]);

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
        where('parentId', '==', currentFolderId)
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
        where('folderId', '==', currentFolderId)
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

  const handleSearch = async (term: string): Promise<Array<{ id: string; name: string; type: string; path: string; displayPath?: string }>> => {
    setSearchTerm(term);
    if (!currentUser) return [];
    
    try {
      setLoading(true);
      
      if (!term.trim()) {
        fetchFolders();
        fetchFiles();
        return [];
      }

      const searchLower = term.toLowerCase();
      
      // Search in folders
      const foldersRef = collection(firestore, 'folders');
      const foldersQuery = query(
        foldersRef,
        where('userId', '==', currentUser.uid)
      );
      const foldersSnapshot = await getDocs(foldersQuery);
      
      const filteredFolders = foldersSnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return (
            data.parentId === currentFolderId &&
            data.name.toLowerCase().includes(searchLower)
          );
        })
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            type: 'folder',
            path: doc.id,
            displayPath: data.parentId || 'root'
          };
        });
      
      // Search in files
      const filesRef = collection(firestore, 'files');
      const filesQuery = query(
        filesRef,
        where('userId', '==', currentUser.uid)
      );
      const filesSnapshot = await getDocs(filesQuery);
      const searchResults = [];

      for (const doc of filesSnapshot.docs) {
        const fileData = doc.data();
        if (fileData.name.toLowerCase().includes(searchLower)) {
          try {
            const storagePath = fileData.path || fileData.url;
            searchResults.push({
              id: doc.id,
              name: fileData.name,
              type: 'file',
              path: storagePath,
              displayPath: fileData.folderPath
            });
          } catch (error) {
            console.error(`Error fetching file ${fileData.name}:`, error);
          }
        }
      }

      // Log search results
      console.log(`Search results for "${term}":`, {
        folders: filteredFolders.length,
        files: searchResults.length
      });

      return [...filteredFolders, ...searchResults];
    } catch (error) {
      console.error('Error during search:', error);
      return [];
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
      setCurrentFolderId(folderId);
    }
  }, [folderId]);

  useEffect(() => {
    refreshFiles();
  }, [currentUser, currentFolderId]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles, currentFolderId]);

  useEffect(() => {
    if (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      setCurrentFolder(folder || null);
    } else {
      setCurrentFolder(null);
    }
  }, [currentFolderId, folders]);

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };
  
  const handleBackClick = async () => {
    if (!currentFolderId) return;
    
    try {
      const folderDoc = await getDoc(doc(firestore, 'folders', currentFolderId));
      if (folderDoc.exists()) {
        setCurrentFolderId(folderDoc.data().parentId);
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
    setSelectedFolder(folder);
    setFolderMenuAnchor({ ...folderMenuAnchor, [folder.id]: event.currentTarget });
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

  const handleFileClick = (file: FileItem, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('File clicked:', {
      name: file.name,
      type: file.type,
      path: file.path,
      downloadURL: file.downloadURL,
      fullPath: file.fullPath
    });

    // Check for text files by extension or MIME type
    const textExtensions = ['.txt', '.json', '.md', '.csv', '.log'];
    const isTextFile = file.type.startsWith('text/') || 
                      file.type === 'application/json' ||
                      textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (isTextFile) {
      console.log('Opening in editor:', file.name);
      setSelectedFile({ ...file, fullPath: file.path });
      setIsEditorOpen(true);
      return;
    }

    // For non-text files, open in new tab
    window.open(file.downloadURL, '_blank');
  };

  const handleFileMenuClick = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
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
  };

  const handleCreateFolderClick = () => {
    setCreateFolderDialogOpen(true);
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
        parentId: currentFolderId,
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

  const handleFolderMenuItemClick = async (action: string) => {
    if (!selectedFolder) return;

    switch (action) {
      case 'rename':
        await handleFolderRename(selectedFolder);
        break;
      case 'delete':
        await handleFolderDelete(selectedFolder.id);
        break;
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
            <FolderCard>
              <FilePreview sx={{ minHeight: '200px' }}>
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
                  <WeatherCard />
                </Box>
              </FilePreview>
            </FolderCard>
          </div>
        </Grid>
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
          .filter((file) =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((file) => (
            <Grid item xs={12} sm={6} md={cardSize} lg={cardSize} key={file.id}>
              <div>
                <Box
                  component="div"
                  onClick={(e: React.MouseEvent<HTMLElement>) => handleFileClick(file, e)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      '& .MuiPaper-root': {
                        boxShadow: 6,
                      },
                    },
                  }}
                >
                  <FileCard>
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
                          onClick={(e: React.MouseEvent<HTMLElement>) => handleFileMenuClick(e, file)}
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
                </Box>
              </div>
            </Grid>
          ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <ActionBar
        onSearch={handleSearch}
        onViewChange={(view) => setViewMode(view)}
        currentView={viewMode}
        onMenuClick={() => setMobileOpen(true)}
        darkMode={theme.palette.mode === 'dark'}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        onProfileClick={() => showSnackbar('Profile feature coming soon!', 'success')}
        onCreateFolder={() => setCreateFolderDialogOpen(true)}
        onCreateFile={() => setIsTextFileCreatorOpen(true)}
        onUpload={() => setIsUploadOpen(true)}
        onShare={() => showSnackbar('Share feature coming soon!', 'success')}
        user={user}
      />

      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        onNavigate={(path) => {
          if (path === '/') {
            setCurrentFolderId(null);
          } else if (path === '/trash') {
            setIsTrashDialogOpen(true);
          } else if (path === '/calendar') {
            setIsCalendarOpen(true);
          } else {
            showSnackbar('This feature is coming soon!', 'success');
          }
        }}
      />

      <Box sx={{ 
        p: { xs: 1, sm: 3 },
        flex: 1,
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mb: 3
        }}>
          {currentFolderId && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{
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
              Back
            </Button>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mb: 2
        }}>
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
            open={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            currentFolder={currentFolderId}
            onFileUploaded={() => {
              fetchFiles();
              setIsUploadOpen(false);
              setUploadSuccess({ show: true, fileName: '' });
            }}
          />
        </DialogContent>
      </Dialog>

      {isTextFileCreatorOpen && (
        <TextFileCreator
          currentFolder={currentFolderId}
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
            handleFolderMenuItemClick('rename');
          }}>
            <ListItemIcon>
              <RenameIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleFolderMenuItemClick('delete');
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
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
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
                {(selectedFolder.sharedWith as string[]).map((email, idx) => (
                  <Chip
                    key={idx}
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

      <Dialog
        open={isTrashDialogOpen}
        onClose={() => setIsTrashDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 3,
          }
        }}
      >
        <UnderImplementation />
      </Dialog>

      <UploadSuccess
        open={uploadSuccess.show}
        onClose={() => setUploadSuccess({ show: false, fileName: '' })}
        fileName={uploadSuccess.fileName}
      />

      <CalendarModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <Box sx={{ display: { xs: 'block', sm: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CustomBottomBar
          onUpload={() => setIsUploadOpen(true)}
          onCreateFolder={() => setCreateFolderDialogOpen(true)}
          onCreateFile={() => setIsTextFileCreatorOpen(true)}
          onSearch={handleSearch}
          onSearchItemClick={(item) => {
            if (item.type === 'folder') {
              setCurrentFolderId(item.id);
              setSearchTerm('');
            } else {
              const file = files.find(f => f.id === item.id);
              if (file) {
                setSelectedViewerFile(file);
              }
            }
          }}
        />
      </Box>

      {selectedFile && (
        <MediaViewer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          open={!!selectedFile}
        />
      )}

      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
          },
          onClick: (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{selectedFile?.name}</Typography>
            <IconButton 
              onClick={() => setIsEditorOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent 
          sx={{ flex: 1, p: 0 }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {selectedFile && (
            <CollaborativeEditor
              documentId={selectedFile.id}
              filePath={selectedFile.path}
              currentUser={{
                displayName: user.displayName || 'Anonymous',
                email: user.email || '',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardV2;