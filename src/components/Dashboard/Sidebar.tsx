import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { User as FirebaseUser } from 'firebase/auth';
import StorageNoti from '../UI/StorageNoti';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: Partial<FirebaseUser> | null;
  onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  user,
  onNavigate,
}) => {
  const theme = useTheme();

  const menuItems = [
    { text: 'My Files', icon: <FolderIcon />, path: '/' },
    { text: 'Starred', icon: <StarIcon />, path: '/starred' },
    { text: 'Shared', icon: <ShareIcon />, path: '/shared' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Recycle Bin', icon: <DeleteIcon />, path: '/trash' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={user?.photoURL || undefined}
            alt={user?.displayName || 'User'}
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              onNavigate(item.path);
              onClose();
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItem>
        ))}
        <ListItem>
          <StorageNoti />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
