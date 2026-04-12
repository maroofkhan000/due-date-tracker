// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace these with your own project's configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6FCzGWZiwJjwLnWZXR4CfD4HvUTM9udw",
  authDomain: "academics-tracker-7f776.firebaseapp.com",
  projectId: "academics-tracker-7f776",
  storageBucket: "academics-tracker-7f776.firebasestorage.app",
  messagingSenderId: "832163143871",
  appId: "1:832163143871:web:3ea71fae7566ae82aea60a",
  measurementId: "G-YB6DC06VWK"};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
