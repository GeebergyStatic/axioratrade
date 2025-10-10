import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Main Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Auth-only config
const authConfig = {
  apiKey: process.env.CUSTOM_FIREBASE_API_KEY,
  authDomain: process.env.CUSTOM_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.CUSTOM_FIREBASE_PROJECT_ID,
  appId: process.env.CUSTOM_FIREBASE_APP_ID,
};

// Initialize main app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize analytics only if supported (prevents SSR or errors)
let analytics;
analyticsSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app);
  })
  .catch((err) => console.warn("Analytics not supported:", err));

// Firestore, Storage, Realtime DB
const db = getFirestore(app);
const storage = getStorage(app);
const realTimeDb = getDatabase(app);

// Initialize auth-only app safely
const authApp = !getApps().some((a) => a.name === "authApp")
  ? initializeApp(authConfig, "authApp")
  : getApp("authApp");

const auth = getAuth(authApp);

export { app, analytics, db, storage, realTimeDb, auth, authApp };
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  query,
  getDocs,
  collection,
  where,
  addDoc,
};
