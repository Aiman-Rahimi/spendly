import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAB-eNJPZENltbUyaiYJXLYt0-KjtCONMU",
  authDomain: "spendly-remi.firebaseapp.com",
  projectId: "spendly-remi",
  storageBucket: "spendly-remi.firebasestorage.app",
  messagingSenderId: "264660094335",
  appId: "1:264660094335:web:cd9fe5481eab9fed4c1e4a",
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();