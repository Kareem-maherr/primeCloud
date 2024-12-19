import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator
} from 'firebase/auth';
import { 
  getStorage,
  connectStorageEmulator
} from 'firebase/storage';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  collection,
  getDocs,
  query,
  where,
  connectFirestoreEmulator,
  enableIndexedDbPersistence
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(firestore)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not available in this browser');
    }
  });

// Detailed logging function
const logError = (message: string, error?: any) => {
  console.error(`[Firebase Error] ${message}`, error);
};

// Admin role management with retry logic
export const isAdmin = async (user: User | null, retryCount = 3): Promise<boolean> => {
  if (!user) {
    logError('Checking admin status for null user');
    return false;
  }
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      console.log('[Admin Check] User Document:', {
        exists: userDoc.exists(),
        data: userDoc.data(),
        userId: user.uid,
        attempt: attempt + 1
      });

      // Check if document exists and has admin role
      const isAdminUser = userDoc.exists() && userDoc.data()?.role === 'admin';
      
      if (isAdminUser) {
        return true;
      }

      // Only check for first user if this is the first attempt
      if (attempt === 0) {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        
        console.log('[Admin Check] Total Users:', usersSnapshot.docs.length);

        // If this is the first user, automatically grant admin
        if (usersSnapshot.docs.length === 0) {
          await setDoc(userDocRef, { 
            email: user.email, 
            role: 'admin', 
            createdAt: new Date() 
          }, { merge: true });
          console.log('[Admin Check] First user granted admin');
          return true;
        }
      }

      // If not admin and not first user, wait before retry
      if (attempt < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    } catch (error: any) {
      logError(`Error checking admin status (attempt ${attempt + 1}/${retryCount})`, error);
      
      // If it's a network error, wait before retry
      if (error.code === 'unavailable' || error.code === 'network-request-failed') {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        // If it's not a network error, break the retry loop
        break;
      }
    }
  }
  
  return false;
};

export const setAdminRole = async (userId: string) => {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    await setDoc(userDocRef, { role: 'admin' }, { merge: true });
    console.log('[Admin Role] Set admin role for user:', userId);
  } catch (error) {
    logError('Error setting admin role', error);
  }
};

// Create first admin user with retry logic
export const createFirstAdminUser = async (email: string, password: string): Promise<User> => {
  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('[Admin Creation] User created:', {
      uid: user.uid,
      email: user.email
    });

    // Set admin role with retry
    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,
          role: 'admin',
          createdAt: new Date()
        });
        success = true;
        console.log('[Admin Creation] Admin document created successfully');
        break;
      } catch (error) {
        logError(`Error setting admin role (attempt ${attempt + 1}/3)`, error);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    if (!success) {
      throw new Error('Failed to set admin role after multiple attempts');
    }

    return user;
  } catch (error) {
    logError('Error creating admin user', error);
    throw error;
  }
};

// Login function for admin
export const adminLogin = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verify admin status with retries
    const adminStatus = await isAdmin(user);
    if (!adminStatus) {
      logError('Login attempt by non-admin user');
      throw new Error('User is not an admin');
    }

    return user;
  } catch (error) {
    logError('Admin login error', error);
    throw error;
  }
};

export default app;
