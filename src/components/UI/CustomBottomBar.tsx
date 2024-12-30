import React, { useState } from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FolderShared as FolderSharedIcon,
  Person as PersonIcon,
  CloudUpload as CloudUploadIcon,
  CreateNewFolder as CreateNewFolderIcon,
  NoteAdd as NoteAddIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchDialog from './SearchDialog';

interface BottomBarProps {
  onUpload: () => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
  onSearch: (term: string) => Promise<Array<{ id: string; name: string; type: string; path: string; displayPath?: string }>>;
  onSearchItemClick?: (item: { id: string; name: string; type: string; path: string; displayPath?: string }) => void;
}

const CustomBottomBar: React.FC<BottomBarProps> = ({ 
  onUpload,
  onCreateFolder,
  onCreateFile,
  onSearch,
  onSearchItemClick
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path.includes('/shared')) return 'shared';
    if (path.includes('/profile')) return 'profile';
    if (path === '/dashboard-v2') return 'home';
    return 'home';
  };

  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleMenuItemClick = (action: () => void) => {
    handleMenuClose();
    action();
  };

  const handleSearchClick = () => {
    setSearchDialogOpen(true);
  };

  const handleProfileClick = () => {
    navigate('/dashboard-v2/profile');
  };

  return (
    <>
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: theme.zIndex.appBar,
          borderRadius: 0,
          boxShadow: 3,
        }} 
        elevation={3}
      >
        <BottomNavigation
          value={getCurrentValue()}
          onChange={(_, newValue) => {
            switch (newValue) {
              case 'home':
                navigate('/dashboard-v2');
                break;
              case 'search':
                handleSearchClick();
                break;
              case 'shared':
                navigate('/dashboard-v2/shared');
                break;
              case 'profile':
                handleProfileClick();
                break;
            }
          }}
          showLabels
        >
          <BottomNavigationAction 
            label="Home" 
            value="home" 
            icon={<HomeIcon />} 
          />
          <BottomNavigationAction 
            label="Search" 
            value="search" 
            icon={<SearchIcon />} 
          />
          <BottomNavigationAction
            label="Add"
            value="add"
            icon={<AddIcon />}
            onClick={handleAddClick}
          />
          <BottomNavigationAction 
            label="Shared" 
            value="shared" 
            icon={<FolderSharedIcon />} 
          />
          <BottomNavigationAction 
            label="Profile" 
            value="profile" 
            icon={<PersonIcon />} 
          />
        </BottomNavigation>
      </Paper>

      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick(onUpload)}>
          <ListItemIcon>
            <CloudUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Upload Files</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(onCreateFolder)}>
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Folder</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(onCreateFile)}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New File</ListItemText>
        </MenuItem>
      </Menu>

      <SearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onSearch={onSearch}
        onItemClick={(item) => {
          if (onSearchItemClick) {
            onSearchItemClick(item);
          }
          setSearchDialogOpen(false);
        }}
      />
    </>
  );
};

export default CustomBottomBar;
