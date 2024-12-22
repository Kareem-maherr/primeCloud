import React from 'react';
import {
  Box,
  TextField,
  Card,
  Typography,
  IconButton,
  InputAdornment,
  styled,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import AnimatedUploadIcon from '../Icons/AnimatedUploadIcon';
import {
  AnimatedAddIcon,
  AnimatedFolderIcon,
  AnimatedGetAppIcon,
  AnimatedTransferIcon,
  AnimatedShareIcon,
} from '../Icons/AnimatedActionIcons';
import { motion } from 'framer-motion';

const StyledSearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
    borderRadius: 8,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eeeeee',
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

const ActionCard = styled(motion(Card))(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  borderRadius: 8,
  border: '1px solid',
  borderColor: 'transparent',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eeeeee',
    borderColor: theme.palette.primary.main,
  },
}));

const AnimatedViewIcon = motion(IconButton);

interface ActionBarProps {
  onSearch: (query: string) => void;
  onUpload: () => void;
  onCreate: () => void;
  onCreateFolder: () => void;
  onGetApp: () => void;
  onTransfer: () => void;
  onShare: () => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
  onTrash: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onSearch,
  onUpload,
  onCreate,
  onCreateFolder,
  onGetApp,
  onTransfer,
  onShare,
  onViewChange,
  currentView,
  onTrash,
}) => {
  return (
    <Box sx={{ mb: 3, px: { xs: 2, sm: 3 }, py: 2 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        gap: { xs: 1, sm: 2 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flex: 1 }}>
          <StyledSearchBar
            fullWidth
            size="small"
            placeholder="Search files..."
            variant="outlined"
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap'
      }}>
        <ActionCard 
          onClick={onUpload} 
          sx={{ bgcolor: 'background.paper', color: 'primary.main' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatedUploadIcon />
          <Typography variant="body2">Upload or drop</Typography>
        </ActionCard>
        <ActionCard 
          onClick={onCreate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatedAddIcon />
          <Typography variant="body2">Create</Typography>
        </ActionCard>
        <ActionCard 
          onClick={onCreateFolder}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatedFolderIcon />
          <Typography variant="body2">Create folder</Typography>
        </ActionCard>
        <ActionCard 
          onClick={onGetApp}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatedGetAppIcon />
          <Typography variant="body2">Get the app</Typography>
        </ActionCard>
        <ActionCard 
          onClick={onTransfer}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatedTransferIcon />
          <Typography variant="body2">Transfer a copy</Typography>
        </ActionCard>
        <ActionCard 
          onClick={onShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatedShareIcon />
          <Typography variant="body2">Share</Typography>
        </ActionCard>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <ActionCard 
          onClick={onTrash}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          sx={{ bgcolor: 'error.lighter', color: 'error.main' }}
        >
          <DeleteOutlineIcon />
          <Typography variant="body2">Recycle Bin</Typography>
        </ActionCard>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <AnimatedViewIcon 
            onClick={() => onViewChange('grid')}
            sx={{ 
              bgcolor: currentView === 'grid' ? 'primary.main' : 'transparent',
              color: currentView === 'grid' ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: currentView === 'grid' ? 'primary.dark' : 'action.hover',
              }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ViewModuleIcon />
          </AnimatedViewIcon>
          <AnimatedViewIcon 
            onClick={() => onViewChange('list')}
            sx={{ 
              bgcolor: currentView === 'list' ? 'primary.main' : 'transparent',
              color: currentView === 'list' ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: currentView === 'list' ? 'primary.dark' : 'action.hover',
              }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ViewListIcon />
          </AnimatedViewIcon>
        </Box>
      </Box>
    </Box>
  );
};

export default ActionBar;
