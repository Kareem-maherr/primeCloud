import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc,
  //query,
  //where,
  getDoc
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage, isAdmin } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  AppBar,
  Toolbar,
  IconButton,
  Link,
  //Tooltip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import logo from '../../assets/logo.png';

interface UserFile {
  id: string;
  name: string;
  userId: string;
  userEmail?: string;
  uploadedAt: Date;
  path: string;
  url?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  createdAt?: Date;
}

const AdminDashboard: React.FC = () => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAdminDashboard = async () => {
      try {
        console.log('[AdminDashboard] Initializing...');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          console.error('[AdminDashboard] No user found');
          setError('No authenticated user found');
          return;
        }

        console.log('[AdminDashboard] Current user:', currentUser.email);

        try {
          console.log('[AdminDashboard] Checking admin status for:', currentUser.uid);
          const adminStatus = await isAdmin(currentUser);
          console.log('[AdminDashboard] Admin status:', adminStatus);
          setIsUserAdmin(adminStatus);

          if (!adminStatus) {
            console.error('[AdminDashboard] User is not an admin');
            setError('User does not have admin privileges');
            return;
          }
        } catch (adminError) {
          console.error('[AdminDashboard] Error checking admin status:', adminError);
          setError('Failed to verify admin status');
          return;
        }

        try {
          // Fetch all users first from Firestore
          console.log('[AdminDashboard] Fetching users from Firestore...');
          const usersCollection = collection(firestore, 'users');
          const usersSnapshot = await getDocs(usersCollection);
          const usersList = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('[AdminDashboard] User data from Firestore:', {
              id: doc.id,
              data: data,
              email: data.email
            });
            return {
              id: doc.id,
              email: data.email || 'No Email',
              role: data.role || 'User',
              createdAt: data.createdAt ? new Date(data.createdAt) : undefined
            } as User;
          });

          // Create initial map of user IDs to emails
          const userEmailMap = new Map(usersList.map(user => [user.id, user.email]));

          // Fetch files first to get all unique user IDs
          console.log('[AdminDashboard] Fetching files...');
          const filesCollection = collection(firestore, 'files');
          const filesSnapshot = await getDocs(filesCollection);
          
          // Get unique user IDs from files that aren't in our map
          const uniqueUserIds = Array.from(new Set(
            filesSnapshot.docs
              .map(doc => doc.data().userId || doc.data().uid)
              .filter(id => id && !userEmailMap.has(id))
          ));

          console.log('[AdminDashboard] Found additional user IDs from files:', uniqueUserIds);

          // For each unique user ID, try to get user data from Firestore users collection
          for (const userId of uniqueUserIds) {
            try {
              // Try to get user from Firestore first
              const userDoc = await getDoc(doc(firestore, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.email) {
                  console.log('[AdminDashboard] Found user in Firestore:', {
                    id: userId,
                    email: userData.email
                  });
                  userEmailMap.set(userId, userData.email);
                  continue;
                }
              }

              // If not found in Firestore or no email, try to get from auth state
              const userAuth = auth.currentUser;
              if (userAuth && userAuth.uid === userId && userAuth.email) {
                console.log('[AdminDashboard] Found user in current auth state:', {
                  id: userId,
                  email: userAuth.email
                });
                userEmailMap.set(userId, userAuth.email);
              }
            } catch (error) {
              console.error('[AdminDashboard] Error fetching user:', {
                userId,
                error
              });
            }
          }

          console.log('[AdminDashboard] Final user email map:', 
            Array.from(userEmailMap.entries()).map(([id, email]) => ({ id, email }))
          );

          // Now process files with the updated user email map
          const filesList = await Promise.all(filesSnapshot.docs.map(async doc => {
            try {
              const data = doc.data();
              console.log('[AdminDashboard] Raw file data:', {
                id: doc.id,
                data: data,
                userId: data.userId,
                userEmail: data.userEmail,
                mappedEmail: userEmailMap.get(data.userId)
              });

              const userId = data.userId || data.uid || 'Unknown';
              // First try to use the stored email, then fall back to the mapped email
              const email = data.userEmail || userEmailMap.get(userId) || 'Unknown User';
              
              console.log('[AdminDashboard] Processing file user info:', {
                fileId: doc.id,
                userId: userId,
                storedEmail: data.userEmail,
                mappedEmail: userEmailMap.get(userId),
                finalEmail: email
              });

              const fileData = {
                id: doc.id,
                name: data.name || data.fileName || 'Unnamed File',
                userId: userId,
                userEmail: email,
                uploadedAt: data.uploadedAt || data.createdAt ? new Date(data.uploadedAt || data.createdAt) : new Date(),
                path: data.url || data.storagePath || data.path || '',
                url: data.downloadURL || null
              } as UserFile;

              // Only try to get download URL if we don't already have it
              if (!fileData.url && fileData.path) {
                try {
                  const storageRef = ref(storage, fileData.path);
                  fileData.url = await getDownloadURL(storageRef);
                  console.log('[AdminDashboard] Got download URL for file:', {
                    id: fileData.id,
                    name: fileData.name,
                    path: fileData.path,
                    url: fileData.url
                  });
                } catch (urlError: any) {
                  console.error('[AdminDashboard] Error getting download URL:', {
                    error: urlError.message,
                    code: urlError.code,
                    file: fileData.name,
                    path: fileData.path
                  });
                }
              }

              return fileData;
            } catch (fileError) {
              console.error('[AdminDashboard] Error processing file:', {
                docId: doc.id,
                error: fileError
              });
              return {
                id: doc.id,
                name: 'Error Loading File',
                userId: 'Error',
                userEmail: 'Error',
                uploadedAt: new Date(),
                path: ''
              } as UserFile;
            }
          }));

          console.log('[AdminDashboard] Files processed:', {
            total: filesList.length,
            withUrls: filesList.filter(f => f.url).length,
            files: filesList.map(f => ({
              id: f.id,
              name: f.name,
              email: f.userEmail,
              path: f.path,
              hasUrl: !!f.url
            }))
          });
          setFiles(filesList);

          // Remove duplicates based on email
          const uniqueUsers = usersList.reduce((acc: User[], current) => {
            const existingUser = acc.find(user => user.email === current.email);
            if (!existingUser) {
              acc.push(current);
            } else if (current.role === 'admin' && existingUser.role !== 'admin') {
              existingUser.role = 'admin';
            }
            return acc;
          }, []);

          console.log('[AdminDashboard] Unique users:', uniqueUsers.length);
          setUsers(uniqueUsers);

        } catch (dataError: any) {
          console.error('[AdminDashboard] Error fetching data:', {
            error: dataError,
            message: dataError.message,
            code: dataError.code,
            stack: dataError.stack
          });
          setError(`Failed to load data: ${dataError.message}`);
        }

      } catch (error: any) {
        console.error('[AdminDashboard] Critical error:', {
          error,
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        setError(`Failed to load admin dashboard: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdminDashboard();
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteDoc(doc(firestore, 'files', fileId));
      setFiles(files.filter(file => file.id !== fileId));
      console.log('[AdminDashboard] File deleted:', fileId);
    } catch (error) {
      console.error('[AdminDashboard] Error deleting file:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('[AdminDashboard] User logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('[AdminDashboard] Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !isUserAdmin) {
    return (
      <Container>
        <Box mt={4}>
          <Typography variant="h5" color="error" align="center">
            {error || 'Access Denied: Admin privileges required'}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Box display="flex" alignItems="center" width="100%">
            <Box display="flex" alignItems="center" flexGrow={1}>
              <img 
                src={logo} 
                alt="Logo" 
                style={{ 
                  height: '40px', 
                  marginRight: '16px',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/admin')}
              />
              <Typography variant="h6" component="div">
                Admin Dashboard
              </Typography>
            </Box>
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              title="Logout"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box my={4}>
          <Paper sx={{ mb: 4, p: 2 }}>
            <Typography variant="h5" gutterBottom>
              All Files ({files.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Uploaded At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map(file => (
                    <TableRow key={file.id}>
                      <TableCell>
                        {file.url ? (
                          <Link 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {file.name}
                            <CloudDownloadIcon fontSize="small" />
                          </Link>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            {file.name}
                            <Typography variant="caption" color="error">
                              (URL not available)
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{file.userEmail}</TableCell>
                      <TableCell>{file.uploadedAt?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              All Users ({users.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.createdAt?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default AdminDashboard;
