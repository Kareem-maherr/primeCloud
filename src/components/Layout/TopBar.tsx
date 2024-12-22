import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Avatar,
  Slider,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';
import { User } from '../../types/user';

interface TopBarProps {
  onDrawerToggle?: () => void;
  onLogout?: () => void;
  user?: User;
  cardSize?: number;
  onCardSizeChange?: (size: number) => void;
  onSearch?: (term: string) => void;
  showSearch?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ 
  onDrawerToggle, 
  onLogout,
  user,
  cardSize = 2,
  onCardSizeChange,
  onSearch,
  showSearch = false
}) => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleCardSizeChange = (_: Event, value: number | number[]) => {
    if (onCardSizeChange && typeof value === 'number') {
      onCardSizeChange(value);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    onSearch?.(term);
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 2 },
        px: { xs: 1.5, sm: 2 },
        py: 1,
        bgcolor: theme.palette.mode === 'light' ? '#E8E2D7' : 'grey.900',
        borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#D8D0C3' : theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'light' ? '0 2px 4px rgba(0,0,0,0.03)' : 'none',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {isMobile && onDrawerToggle && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: { xs: 0.5, sm: 0.5 } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <img
            src={logo}
            alt="PrimeCloud Logo"
            style={{ height: isMobile ? '28px' : '32px' }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
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
        {showSearch && (
          <Box sx={{ 
            flexGrow: 1, 
            mx: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            <TextField
              size="small"
              placeholder="Search files..."
              value={searchTerm}
              onChange={handleSearch}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }
              }}
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
            <>
              <IconButton
                onClick={(e) => setUserMenuAnchorEl(e.currentTarget)}
                sx={{
                  p: 0,
                  '&:hover': {
                    backgroundColor: 'transparent',
                  }
                }}
              >
                <Avatar
                  src={user.photoURL || undefined}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: theme.palette.primary.main,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.displayName || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                {onCardSizeChange && (
                  <Box sx={{ px: 2, py: 1, width: 200 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Card Size
                    </Typography>
                    <Slider
                      value={cardSize}
                      min={2}
                      max={12}
                      step={2}
                      marks
                      onChange={handleCardSizeChange}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => 
                        value === 2 ? 'XS' : 
                        value === 4 ? 'S' : 
                        value === 6 ? 'M' : 
                        value === 8 ? 'L' : 'XL'
                      }
                    />
                  </Box>
                )}
                <MenuItem dense onClick={toggleDarkMode}>
                  {darkMode ? (
                    <>
                      <LightModeIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <DarkModeIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                      Dark Mode
                    </>
                  )}
                </MenuItem>
                <MenuItem dense onClick={() => setSettingsAnchorEl(null)}>
                  <SettingsIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                  Settings
                </MenuItem>
                {onLogout && (
                  <MenuItem 
                    dense
                    onClick={() => {
                      handleUserMenuClose();
                      onLogout();
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <LogoutIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Logout
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>
      </Box>
      <Divider />
    </>
  );
};

export default TopBar;
