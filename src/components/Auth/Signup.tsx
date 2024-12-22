import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Container, 
  Typography, 
  Box, 
  Paper,
  Link,
  Alert
} from '@mui/material';
//import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firestore } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import logo from '../../assets/logo.png';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      console.log('Creating new user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: username
        });

        const normalizedEmail = email.toLowerCase().trim();
        console.log('Creating user document with normalized email:', normalizedEmail);

        // Create a user document in Firestore
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: normalizedEmail,
          displayName: username,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date().toISOString()
        });
        console.log('User document created successfully');
      }
      navigate('/dashboard-v2');
    } catch (err: any) {
      console.error('Error during signup:', err);
      setError(err.message || 'Failed to create an account');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign Up
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src={logo} alt="Prime Gate Logo" style={{ maxWidth: '150px', height: 'auto' }} />
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Box textAlign="center">
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
