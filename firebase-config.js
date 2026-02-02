// ============================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZSqwa06UpBkvpHYK0VTGvkQvZvjE-QCk",
  authDomain: "kadrilas-app.firebaseapp.com",
  projectId: "kadrilas-app",
  storageBucket: "kadrilas-app.firebasestorage.app",
  messagingSenderId: "830702928679",
  appId: "1:830702928679:web:ee5d528d5432fcd8ca5f02",
  measurementId: "G-Q3BD0MCBQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
