import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAAgj6lmOmtB5cI48Jp0CgMuq6JIXg-jpI",
  authDomain: "codelense-ai.firebaseapp.com",
  projectId: "codelense-ai",
  storageBucket: "codelense-ai.firebasestorage.app",
  messagingSenderId: "742518289458",
  appId: "1:742518289458:web:24e3ec81e3fbcf94f4b82b",
  measurementId: "G-MHYZ4RQXDM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();