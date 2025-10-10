import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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


const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
  authDomain: `${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}`,
  projectId: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}`,
  storageBucket: `${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.REACT_APP_FIREABSE_MESSAGING_SENDER_ID}`,
  appId: `${process.env.REACT_APP_FIREBASE_APP_ID}`,
  measurementId: `${process.env.REACT_APP_FIREBASE_MEASUREMENT_ID}`,
};

// const firebaseConfig = {
//   apiKey: "AIzaSyBrGNQKFXkwF2i3J2BWouABkFPnlatHW7k",
//   authDomain: "us-embassy-a20af.firebaseapp.com",
//   projectId: "us-embassy-a20af",
//   storageBucket: "us-embassy-a20af.firebasestorage.app",
//   messagingSenderId: "40204587374",
//   appId: "1:40204587374:web:95cfd11bfd50d5e58db17f",
//   measurementId: "G-97F3VDJ1YR"
// };

// Auth-only app
const authConfig = {
  apiKey: `${process.env.CUSTOM_FIREBASE_API_KEY}`,
  authDomain: `${process.env.CUSTOM_FIREBASE_AUTH_DOMAIN}`,
  projectId: `${process.env.CUSTOM_FIREBASE_PROJECT_ID}`,
  appId: `${process.env.CUSTOM_FIREBASE_APP_ID}`,
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage();
const realTimeDb = getDatabase(app)

export { db, storage, realTimeDb, app };
// Second initialization
export const authApp = initializeApp(authConfig, "authApp");
export const auth = getAuth(authApp);