import React, { ReactNode, useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  styled,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  CreateNewFolder as CreateNewFolderIcon,
  NoteAdd as NoteAddIcon,
  CloudUpload as CloudUploadIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import CustomBar from '../UI/CustomBar';
import CustomButton from '../UI/CustomButton';
import logo from '../../assets/logo.png';
import { User as FirebaseUser } from 'firebase/auth';

interface ActionBarProps {
  onSearch: (term: string) => Promise<Array<{ id: string; name: string; type: string; path: string; displayPath?: string }>>;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: string;
  onMenuClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
  onUpload: () => void;
  onShare: () => void;
  user: Partial<FirebaseUser>;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onSearch,
  onViewChange,
  currentView,
  onMenuClick,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onProfileClick,
  onCreateFolder,
  onCreateFile,
  onUpload,
  onShare,
  user,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddClose = () => {
    setAddMenuAnchor(null);
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}>
      <IconButton
        onClick={onMenuClick}
        sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
        <img
          src={logo}
          alt="PrimeCloud Logo"
          style={{ height: isMobile ? '32px' : '40px' }}
        />
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            display: { xs: 'none', sm: 'block' },
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

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CustomBar
          placeholder="Search files and folders..."
          onSearch={onSearch}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <CustomButton
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={onUpload}
          >
            Upload
          </CustomButton>

          <CustomButton
            variant="contained"
            startIcon={<CreateNewFolderIcon />}
            onClick={onCreateFolder}
          >
            Create Folder
          </CustomButton>

          <CustomButton
            variant="contained"
            startIcon={<NoteAddIcon />}
            onClick={onCreateFile}
          >
            Create File
          </CustomButton>
        </Box>

        <IconButton
          onClick={handleUserMenuClick}
          size="small"
          sx={{ ml: 2 }}
        >
          <Avatar
            alt={user?.displayName || 'User'}
            src={user?.photoURL || undefined}
            sx={{ width: 32, height: 32 }}
          >
            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200
            }
          }}
        >
          <MenuItem onClick={() => { onProfileClick(); handleUserMenuClose(); }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" secondary={user?.email} />
          </MenuItem>
          <MenuItem onClick={() => { onToggleDarkMode(); handleUserMenuClose(); }}>
            <ListItemIcon>
              {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{darkMode ? 'Light Mode' : 'Dark Mode'}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { onLogout(); handleUserMenuClose(); }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default ActionBar;
