import React from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  styled,
  useTheme,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  GetApp as GetAppIcon,
  SwapHoriz as TransferIcon,
  Share as ShareIcon,
  Apps as AppsIcon,
  Monitor as MonitorIcon,
  History as HistoryIcon,
  Star as StarIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 12px',
  },
  flex: 1,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  padding: '6px 16px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
}));

const ViewToggleButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
}));

interface DashboardHeaderProps {
  onUpload?: () => void;
  onCreate?: () => void;
  onCreateFolder?: () => void;
  onGetApp?: () => void;
  onTransfer?: () => void;
  onShare?: () => void;
  onViewChange?: (view: 'grid' | 'list') => void;
  currentView?: 'grid' | 'list';
  onSearch?: (query: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onUpload,
  onCreate,
  onCreateFolder,
  onGetApp,
  onTransfer,
  onShare,
  onViewChange,
  currentView = 'grid',
  onSearch,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchBar
          fullWidth
          placeholder="Search"
          variant="outlined"
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: 8, textTransform: 'none', px: 3 }}
        >
          Invite members
        </Button>
        <IconButton>
          <AppsIcon />
        </IconButton>
        <IconButton>
          <MonitorIcon />
        </IconButton>
        <Badge badgeContent={1} color="error">
          <IconButton>
            <HistoryIcon />
          </IconButton>
        </Badge>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: 8, textTransform: 'none', bgcolor: '#8BC34A' }}
        >
          Click to upgrade
        </Button>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ActionButton
          startIcon={<AddIcon />}
          variant="text"
          onClick={onUpload}
          sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
        >
          Upload or drop
        </ActionButton>
        <ActionButton startIcon={<AddIcon />} onClick={onCreate}>
          Create
        </ActionButton>
        <ActionButton startIcon={<CreateNewFolderIcon />} onClick={onCreateFolder}>
          Create folder
        </ActionButton>
        <ActionButton startIcon={<GetAppIcon />} onClick={onGetApp}>
          Get the app
        </ActionButton>
        <ActionButton startIcon={<TransferIcon />} onClick={onTransfer}>
          Transfer a copy
        </ActionButton>
        <ActionButton startIcon={<ShareIcon />} onClick={onShare}>
          Share
        </ActionButton>
      </Box>

      {/* Files Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            All files
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Recent files">
              <ActionButton startIcon={<HistoryIcon />}>
                Recents
              </ActionButton>
            </Tooltip>
            <Tooltip title="Starred files">
              <ActionButton startIcon={<StarIcon />}>
                Starred
              </ActionButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ViewToggleButton
            onClick={() => onViewChange?.('grid')}
            color={currentView === 'grid' ? 'primary' : 'default'}
          >
            <GridViewIcon />
          </ViewToggleButton>
          <ViewToggleButton
            onClick={() => onViewChange?.('list')}
            color={currentView === 'list' ? 'primary' : 'default'}
          >
            <ListViewIcon />
          </ViewToggleButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
