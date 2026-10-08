import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyAaZUZHbX3upXHCI1A3fxHixt_zCJdW_8I",
  authDomain: "campus-marketplace-8cf29.firebaseapp.com",
  projectId: "campus-marketplace-8cf29",
  storageBucket: "campus-marketplace-8cf29.firebasestorage.app",
  messagingSenderId: "1091433850297",
  appId: "1:1091433850297:web:9395f4c96897f170b54268",
  measurementId: "G-H8BPC6R55S",
};

// Initialize Firebase singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);

// Configure Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Analytics conditionally (null when unsupported, e.g. some browsers/iframes)
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((yes) => {
      if (yes) {
        analytics = getAnalytics(firebaseApp);
      }
    })
    .catch(() => {
      // Analytics unsupported in current browser/iframe context
    });
}

/**
 * Sign in with Google Popup via Firebase Authentication
 */
export async function signInWithGoogle(): Promise<{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error: unknown) {
    console.warn("Firebase Google popup sign-in notice:", error);
    throw error;
  }
}

/**
 * Sign out from Firebase Authentication
 */
export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Observer for Firebase Authentication state changes
 */
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
