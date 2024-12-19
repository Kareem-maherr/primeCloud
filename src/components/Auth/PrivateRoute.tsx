import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, isAdmin } from '../../config/firebase';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, adminOnly = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndAdminStatus = async () => {
      try {
        const currentUser = auth.currentUser;
        console.log('[PrivateRoute] Checking auth status:', {
          currentUser: currentUser?.uid,
          adminOnly,
          path: location.pathname,
          timestamp: new Date().toISOString()
        });

        if (currentUser) {
          setIsAuthenticated(true);
          
          if (adminOnly) {
            try {
              console.log('[PrivateRoute] Checking admin status for user:', currentUser.uid);
              const adminStatus = await isAdmin(currentUser);
              console.log('[PrivateRoute] Admin status result:', {
                userId: currentUser.uid,
                isAdmin: adminStatus,
                timestamp: new Date().toISOString()
              });
              setIsUserAdmin(adminStatus);
            } catch (error) {
              console.error('[PrivateRoute] Error checking admin status:', {
                error,
                userId: currentUser.uid,
                timestamp: new Date().toISOString()
              });
              setIsUserAdmin(false);
            }
          } else {
            setIsUserAdmin(true);
          }
        } else {
          console.log('[PrivateRoute] No authenticated user found');
          setIsAuthenticated(false);
          setIsUserAdmin(false);
        }
      } catch (error) {
        console.error('[PrivateRoute] Unexpected error:', error);
        setIsAuthenticated(false);
        setIsUserAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    console.log('[PrivateRoute] Component mounted/updated:', {
      path: location.pathname,
      adminOnly,
      timestamp: new Date().toISOString()
    });

    setIsLoading(true);
    checkAuthAndAdminStatus();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('[PrivateRoute] Auth state changed:', {
        userId: user?.uid,
        timestamp: new Date().toISOString()
      });
      checkAuthAndAdminStatus();
    });

    return () => {
      console.log('[PrivateRoute] Cleanup - unsubscribing from auth state changes');
      unsubscribe();
    };
  }, [adminOnly, location.pathname]);

  // Detailed logging for routing decision
  useEffect(() => {
    console.log('[PrivateRoute] State updated:', {
      isAuthenticated,
      isUserAdmin,
      adminOnly,
      path: location.pathname,
      loading: isLoading,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, isUserAdmin, adminOnly, location.pathname, isLoading]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('[PrivateRoute] Redirecting to login:', {
      from: location.pathname,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isUserAdmin) {
    console.log('[PrivateRoute] Unauthorized access attempt:', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('[PrivateRoute] Rendering protected content:', {
    path: location.pathname,
    adminOnly,
    timestamp: new Date().toISOString()
  });

  return <>{children}</>;
};

export default PrivateRoute;
