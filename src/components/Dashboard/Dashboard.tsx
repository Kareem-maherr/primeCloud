import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Container,
  Typography,
  Button,
  Box,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Drawer,
  CssBaseline,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Switch,
  Tooltip,
  Alert,
  Paper,
  Breadcrumbs,
  Link,
  Stack
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack,
  Menu as MenuIcon,
  Home as HomeIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  DriveFileRenameOutline as RenameIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import FolderManager from './FolderManager';
import FileUploader from './FileUploader';
import { useNavigate } from 'react-router-dom';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import Calendar from './Calendar';
import logo from '../../assets/logo.png';
import { useTheme, useMediaQuery, ThemeProvider, createTheme } from '@mui/material';
import { useKonamiCode } from '../../hooks/useKonamiCode';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  downloadURL: string;
  createdAt: string;
}

interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
}

const drawerWidth = 240;

const Dashboard: React.FC = () => {
  useKonamiCode();

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderItem | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderItem | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [fileDeleteDialogOpen, setFileDeleteDialogOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const openDeleteDialog = (folder: FolderItem) => {
    setFolderToDelete(folder);
    setDeleteDialogOpen(true);
  };

  const openRenameDialog = (folder: FolderItem) => {
    setFolderToRename(folder);
    setNewFolderName(folder.name);
    setRenameDialogOpen(true);
  };

  const handleDeleteFolder = async () => {
    // Implement folder deletion logic
    setDeleteDialogOpen(false);
  };

  const handleRenameFolder = async () => {
    // Implement folder renaming logic
    setRenameDialogOpen(false);
  };

  const handleFolderMenuOpen = (event: React.MouseEvent<HTMLElement>, folderId: string) => {
    event.stopPropagation();
    setFolderMenuAnchorEl({ ...folderMenuAnchorEl, [folderId]: event.currentTarget });
  };

  const handleFolderMenuClose = (folderId: string) => {
    setFolderMenuAnchorEl({ ...folderMenuAnchorEl, [folderId]: null });
  };

  const openFileDeleteDialog = (file: FileItem) => {
    setFileToDelete(file);
    setFileDeleteDialogOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const fileRef = ref(storage, fileToDelete.downloadURL);
      await deleteObject(fileRef);
      // Remove file from state
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      setFileDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file');
    }
  };

  const fetchFoldersAndFiles = async () => {
    // Implement fetching logic
  };

  const fetchFolderPath = async (folderId: string | null) => {
    // Implement path fetching logic
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchFoldersAndFiles();
    fetchFolderPath(currentFolder);
  }, [currentFolder]);

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleFileClick = (file: FileItem) => {
    window.open(file.downloadURL, '_blank');
  };

  const handleTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#4A154B',
      },
      secondary: {
        main: '#ECB22E',
      },
    },
  });

  return (
    <ThemeProvider theme={handleTheme}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: darkMode ? 'background.paper' : 'white', color: darkMode ? 'text.primary' : 'black', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleSidebarToggle}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={logo} alt="Prime Gate Logo" style={{ maxWidth: '40px', height: 'auto', marginRight: '10px' }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              PrimeGate Cloud
            </Typography>
          </Box>
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
          <IconButton onClick={handleMenu} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>
              {currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Tooltip title="Toggle Dark Mode">
            <Switch checked={darkMode} onChange={handleThemeToggle} />
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant={isMobile ? "temporary" : "persistent"}
          open={isSidebarOpen}
          onClose={isMobile ? handleSidebarToggle : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: 'width 0.2s ease-in-out',
              ...(isSidebarOpen ? {} : { width: 0, overflow: 'hidden' }),
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{
                mx: 2,
                mb: 2,
                bgcolor: '#1a73e8',
                '&:hover': {
                  bgcolor: '#1557b0'
                }
              }}
              onClick={() => setIsUploadOpen(true)}
            >
              Upload Files
            </Button>
            <List>
              <ListItem disablePadding>
                <ListItemButton selected={!currentFolder}>
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Drive" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText primary="Starred" />
                </ListItemButton>
              </ListItem>
              <ListItem 
                button 
                onClick={() => setShowCalendar(!showCalendar)}
                sx={{
                  bgcolor: showCalendar ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: showCalendar ? 'action.selected' : 'action.hover'
                  }
                }}
              >
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText primary="Calendar" />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: {
              xs: '100%',
              sm: `calc(100% - ${isSidebarOpen ? drawerWidth : 0}px)`
            },
            transition: theme.transitions.create(['width', 'margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: {
              xs: 0,
              sm: 0
            },
          }}
        >
          <Toolbar /> {/* This creates space for the AppBar */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, width: '100%', borderRadius: 2 }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          
          {showCalendar ? (
            <Calendar />
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link
                    href="#"
                    onClick={() => setCurrentFolder(null)}
                    color="inherit"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    My Drive
                  </Link>
                  {folderPath.map((folder) => (
                    <Link
                      key={folder.id}
                      href="#"
                      onClick={() => setCurrentFolder(folder.id)}
                      color="inherit"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <FolderIcon sx={{ mr: 0.5 }} fontSize="small" />
                      {folder.name}
                    </Link>
                  ))}
                </Breadcrumbs>
              </Box>

              <FolderManager
                currentFolder={currentFolder}
                onFolderCreated={fetchFoldersAndFiles}
              />

              {isUploadOpen && (
                <FileUploader
                  currentFolder={currentFolder}
                  onFileUploaded={() => {
                    fetchFoldersAndFiles();
                    setIsUploadOpen(false);
                  }}
                />
              )}

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
                    Folders
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    {folders.map((folder) => (
                      <Paper
                        key={folder.id}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f8f9fa' },
                          position: 'relative'
                        }}
                      >
                        <Box
                          onClick={() => handleFolderClick(folder.id)}
                          sx={{ display: 'flex', alignItems: 'center', pr: 4 }}
                        >
                          <FolderIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          <Typography noWrap>{folder.name}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {formatDate(folder.createdAt)}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={(e) => handleFolderMenuOpen(e, folder.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
                    Files
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    {files.map((file) => (
                      <Paper
                        key={file.id}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f8f9fa' },
                          position: 'relative'
                        }}
                        onClick={() => handleFileClick(file)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', pr: 4 }}>
                          <FileIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          <Typography noWrap>{file.name}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openFileDeleteDialog(file);
                          }}
                        >
                          <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                        </IconButton>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Stack>
            </>
          )}
        </Box>
      </Box>

      {/* Menus and Dialogs */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{folderToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteFolder} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
      >
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New folder name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameFolder} color="primary">Rename</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={fileDeleteDialogOpen}
        onClose={() => setFileDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{fileToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteFile} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Dashboard;
