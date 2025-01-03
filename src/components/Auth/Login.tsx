import React, { useState, useEffect } from "react";
import HeartDrawingModal from "../EasterEgg/HeartDrawingModal";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Link,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  adminLogin,
  createFirstAdminUser,
  isAdmin,
} from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../../config/firebase";
import logo from "../../assets/logo.png";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkFirstTimeSetup = async () => {
      try {
        const usersCollection = collection(firestore, "users");
        const adminQuery = query(usersCollection, where("role", "==", "admin"));
        const adminSnapshot = await getDocs(adminQuery);

        console.log("[Login] Checking first time setup:", {
          adminUsers: adminSnapshot.docs.length,
        });

        setIsFirstTimeSetup(adminSnapshot.docs.length === 0);
      } catch (error) {
        console.error("[Login] Error checking first time setup:", error);
        setIsFirstTimeSetup(false);
      }
    };

    checkFirstTimeSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError("");

      console.log("[Login] Submission Details:", {
        isFirstTimeSetup,
        isAdminLogin,
        email,
      });

      if (isFirstTimeSetup) {
        const adminUser = await createFirstAdminUser(email, password);
        console.log("[Login] First admin user created:", {
          uid: adminUser.uid,
          email: adminUser.email,
        });

        const adminStatus = await isAdmin(adminUser);
        console.log("[Login] First admin user admin status:", adminStatus);

        if (adminStatus) {
          navigate("/admin", { replace: true });
        } else {
          setError("Failed to set admin privileges. Please try again.");
        }
        return;
      }

      if (isAdminLogin) {
        const adminLoginResult = await adminLogin(email, password);
        console.log("[Login] Admin login successful:", {
          uid: adminLoginResult.uid,
          email: adminLoginResult.email,
        });

        const adminStatus = await isAdmin(adminLoginResult);
        console.log("[Login] Admin status after login:", adminStatus);

        if (adminStatus) {
          navigate("/admin", { replace: true });
        } else {
          setError("User does not have admin privileges.");
        }
      } else {
        const loginResult = await login(email, password);
        console.log("[Login] Regular user login successful:", {
          uid: loginResult.user.uid,
          email: loginResult.user.email,
        });

        const userDoc = await getDoc(
          doc(firestore, "users", loginResult.user.uid)
        );
        if (!userDoc.exists()) {
          await setDoc(doc(firestore, "users", loginResult.user.uid), {
            uid: loginResult.user.uid,
            email: loginResult.user.email,
            photoURL: loginResult.user.photoURL,
            createdAt: new Date().toISOString(),
          });
        }

        navigate("/dashboard-v2", { replace: true });
      }
    } catch (err: any) {
      console.error("[Login] Login Error:", {
        message: err.message,
        code: err.code,
        details: err,
      });
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardNavigation = async (version: "v1" | "v2") => {
    if (!currentUser) {
      try {
        setLoading(true);
        setError("");
        await login(email, password);
        navigate(version === "v1" ? "/dashboard" : "/dashboard-v2");
      } catch (err: any) {
        console.error("Login error:", err);
        setError(err.message || "Failed to log in. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    } else {
      navigate(version === "v1" ? "/dashboard" : "/dashboard-v2");
    }
  };

  return (
    <Container maxWidth="xs">
      {/* Pass the email state as a prop to HeartDrawingModal */}
      <HeartDrawingModal emailValue={email} />
      <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {isFirstTimeSetup ? "Create First Admin User" : "Log In"}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <img
            src={logo}
            alt="Prime Gate Logo"
            style={{ maxWidth: "150px", height: "auto" }}
          />
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Updates email state
            autoFocus
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
          {!isFirstTimeSetup && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  color="primary"
                />
              }
              label="Login as Admin"
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
