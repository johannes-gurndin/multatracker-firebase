// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2-IcznYkSWb6Zce7gkNcS_J3yMde9vM4",
  authDomain: "multatracker.firebaseapp.com",
  projectId: "multatracker",
  storageBucket: "multatracker.appspot.com",
  messagingSenderId: "743749448549",
  appId: "1:743749448549:web:36ef964f0b6d21eb18e78c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);