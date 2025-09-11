// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config 
const firebaseConfig = {
  apiKey: "AIzaSyCELhNO1WkzSssrDoawYNL_g8Sftu4KaqE",
  authDomain: "wastepickup-system.firebaseapp.com",
  projectId: "wastepickup-system",
  storageBucket: "wastepickup-system.firebasestorage.app",
  messagingSenderId: "315209919819",
  appId: "1:315209919819:web:c9d1cdafb6a9c2b1788cce",
  measurementId: "G-DR1Z1TWEFE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth & db
export const auth = getAuth(app);
export const db = getFirestore(app);
