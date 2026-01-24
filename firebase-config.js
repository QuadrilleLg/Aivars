// ============================================
// FIREBASE KONFIGURĀCIJA
// ============================================
// AIZPILDI AR SAVIEM DATIEM no Firebase Console!

const firebaseConfig = {
    apiKey: "AIzaSyDZSqwa06UpBkvpHYK0VTGvkQvZvjE-QCk",                    // ← Tavs API Key
    authDomain: "kadrilas-app.firebaseapp.com", // ← Tavs Auth Domain
    projectId: "kadrilas-app",                  // ← Tavs Project ID
    storageBucket: "kadrilas-app.firebasestorage.app",   // ← Tavs Storage Bucket
    messagingSenderId: "830702928679",              // ← Tavs Sender ID
    appId: "1:830702928679:web:ee5d528d5432fcd8ca5f02",
    measurementId: "G-Q3BD0MCBQ0" // ← Tavs App ID
};

// Inicializē Firebase
firebase.initializeApp(firebaseConfig);

// Eksportē servisa references
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore timestamp helper
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log('✅ Firebase inicializēts!');
