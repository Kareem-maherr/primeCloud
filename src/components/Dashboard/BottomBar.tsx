import React from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  styled,
} from '@mui/material';
import {
  Folder as FolderIcon,
  CloudUpload as CloudUploadIcon,
  NoteAdd as NoteAddIcon,
  Share as ShareIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

interface BottomBarProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onShare: () => void;
  onMenuOpen: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  value,
  onChange,
  onUpload,
  onCreateFile,
  onCreateFolder,
  onShare,
  onMenuOpen,
}) => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', sm: 'none' },
        zIndex: 1100,
      }}
      elevation={3}
    >
      <StyledBottomNavigation
        value={value}
        onChange={(_, newValue) => {
          onChange(newValue);
          switch (newValue) {
            case 'upload':
              onUpload();
              break;
            case 'file':
              onCreateFile();
              break;
            case 'folder':
              onCreateFolder();
              break;
            case 'share':
              onShare();
              break;
            case 'menu':
              onMenuOpen();
              break;
          }
        }}
        showLabels
      >
        <BottomNavigationAction
          label="Upload"
          value="upload"
          icon={<CloudUploadIcon />}
        />
        <BottomNavigationAction
          label="New File"
          value="file"
          icon={<NoteAddIcon />}
        />
        <BottomNavigationAction
          label="New Folder"
          value="folder"
          icon={<FolderIcon />}
        />
        <BottomNavigationAction
          label="Share"
          value="share"
          icon={<ShareIcon />}
        />
        <BottomNavigationAction
          label="Menu"
          value="menu"
          icon={<MenuIcon />}
        />
      </StyledBottomNavigation>
    </Paper>
  );
};

export default BottomBar;
