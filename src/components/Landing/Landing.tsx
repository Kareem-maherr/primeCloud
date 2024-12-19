import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Fade,
  Link,
  Avatar,
  Paper,
  Stack
} from '@mui/material';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import appStoreLogo from '../../assets/app-store.svg';
import playStoreLogo from '../../assets/play-store.svg';
import OnePiece from '../EasterEgg/OnePiece';
import { useAuth } from '../../context/AuthContext';

// Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const { currentUser, logout } = useAuth();

  React.useEffect(() => {
    const handleAutoLogout = async () => {
      if (currentUser) {
        try {
          await logout();
        } catch (error) {
          console.error('Error logging out:', error);
        }
      }
    };

    handleAutoLogout();
  }, [currentUser, logout]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  };

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Toolbar>
          <MotionBox
            sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box 
              component="img" 
              src={logo} 
              alt="Logo" 
              sx={{ 
                height: 40, 
                mr: 2,
                cursor: 'pointer'
              }}
              onClick={() => setShowEasterEgg(true)}
            />
            <Typography
              variant="h6"
              sx={{
                ml: 1,
                display: { xs: 'none', sm: 'block' },
                color: 'primary.main',
                fontWeight: 600
              }}
            >
              PrimeCloud
            </Typography>
          </MotionBox>

          {/* Navigation Links */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 4,
            alignItems: 'center',
            mr: 4
          }}>
            <MotionButton
              color="inherit"
              {...scaleOnHover}
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  background: 'transparent'
                }
              }}
            >
              Pricing
            </MotionButton>
            <MotionButton
              color="inherit"
              {...scaleOnHover}
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  background: 'transparent'
                }
              }}
            >
              Contact Us
            </MotionButton>
          </Box>

          {/* Auth Dropdown */}
          <Box>
            <MotionButton
              variant="contained"
              color="secondary"
              onClick={handleClick}
              endIcon={<KeyboardArrowDownIcon />}
              {...scaleOnHover}
              sx={{
                fontWeight: 600,
                px: 3,
                color: 'primary.main',
                '&:hover': {
                  background: 'secondary.light'
                }
              }}
            >
              Account
            </MotionButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              TransitionComponent={Fade}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: theme.shadows[3],
                  mt: 1,
                }
              }}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('/login')}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Login
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/signup')}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Sign up
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <MotionBox
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: 4
          }}
          {...fadeInUp}
        >
          <Box sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h3" gutterBottom>
                Organize your files and access them from anywhere!
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography variant="subtitle1" color="text.secondary" paragraph>
                Enjoy secure storage with customizable themes for a personalized experience.
              </Typography>
            </motion.div>
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
          <MotionBox
            sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CloudUploadIcon sx={{ fontSize: 200, color: 'primary.main', opacity: 0.8 }} />
            </motion.div>
          </MotionBox>
        </MotionBox>

        <Grid container spacing={4} sx={{ py: 8 }}>
          {[
            { icon: <GroupIcon />, title: 'Customizable', desc: 'Engaged with a personalized experience' },
            { icon: <SecurityIcon />, title: 'Flexible', desc: 'Data securely stored' },
            { icon: <CloudUploadIcon />, title: 'Seamless', desc: 'Effortlessly upload files' },
            { icon: <SettingsIcon />, title: 'Experience', desc: 'Get started for free' }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {React.cloneElement(feature.icon, {
                        color: "primary",
                        sx: { fontSize: 40, mb: 2 }
                      })}
                    </motion.div>
                    <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Download Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          sx={{
            mt: 12,
            mb: 8,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4,
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 4,
            boxShadow: theme.shadows[4],
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              Download PrimeCloud
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Access your files from anywhere! Download our app and stay connected to your data on the go.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Available on multiple platforms for your convenience
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button
                variant="contained"
                startIcon={<AppleIcon />}
                href="#"
                sx={{
                  bgcolor: 'common.black',
                  color: 'common.white',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'common.black',
                    opacity: 0.9,
                  },
                }}
              >
                <Stack spacing={0} alignItems="flex-start">
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                    Download from the
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    App Store
                  </Typography>
                </Stack>
              </Button>
              <Button
                variant="contained"
                startIcon={<AndroidIcon />}
                href="#"
                sx={{
                  bgcolor: '#2E7D32',
                  color: 'common.white',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#1B5E20',
                  },
                }}
              >
                <Stack spacing={0} alignItems="flex-start">
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                    Get it on
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    Google Play
                  </Typography>
                </Stack>
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              height: { xs: 200, md: 300 },
              width: '100%',
              overflow: 'hidden',
              borderRadius: 4,
            }}
          >
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1536300007881-7e482242baa5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80"
              alt="Cloud Storage"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>
        </Box>

        <MotionBox
          sx={{ py: 4, borderTop: 1, borderColor: 'divider' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <motion.img
                  src={logo}
                  alt="PrimeCloud Logo"
                  style={{ height: '30px' }}
                  whileHover={{ scale: 1.1 }}
                />
                <Typography variant="subtitle1" sx={{ ml: 1 }}>PrimeCloud</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Your files delivered to you in the cloud!
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="subtitle2" gutterBottom>Need help?</Typography>
                <Typography variant="body2" color="text.secondary">
                  Our support is here for you 24/7
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (+966) 53 700 1843
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  kabdeldayem@primegate.net.sa
                </Typography>
                <MotionBox
                  sx={{ mt: 2 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  {[InstagramIcon, FacebookIcon, TwitterIcon].map((Icon, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ display: 'inline-block' }}
                    >
                      <IconButton
                        color="primary"
                        size="small"
                      >
                        <Icon />
                      </IconButton>
                    </motion.span>
                  ))}
                </MotionBox>
              </Box>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
      {showEasterEgg && <OnePiece />}
    </Box>
  );
};

export default Landing;
