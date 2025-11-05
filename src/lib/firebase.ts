import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD44eFsXLzZsUIwcZkgJSE4moWhaboJPgY",
  authDomain: "nuclestock.firebaseapp.com",
  projectId: "nuclestock",
  storageBucket: "nuclestock.firebasestorage.app",
  messagingSenderId: "728758878935",
  appId: "1:728758878935:web:7a478f9ce36970daefe692",
  measurementId: "G-RN9ZLQK7CX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
