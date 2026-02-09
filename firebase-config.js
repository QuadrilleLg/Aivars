// ============================================
// FIREBASE KONFIGURĀCIJA (VECAIS)
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyDZSqwa06UpBkvpHYK0VTGvkQvZvjE-QCk",
    authDomain: "kadrilas-app.firebaseapp.com",
    projectId: "kadrilas-app",
    storageBucket: "kadrilas-app.firebasestorage.app",
    messagingSenderId: "830702928679",
    appId: "1:830702928679:web:ee5d528d5432fcd8ca5f02",
    measurementId: "G-Q3BD0MCBQ0"
};

// Inicializē Firebase
firebase.initializeApp(firebaseConfig);

// Eksportē servisa references
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore timestamp helper
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log('✅ Firebase inicializēts!');


