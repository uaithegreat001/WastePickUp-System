// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);