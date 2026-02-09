// ============================================
// FIREBASE KONFIGURĀCIJA
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyBiPpwnhxiQQ16ujSVh0mNEB4UOdT0fWEw",
    authDomain: "kadrilas-app.firebaseapp.com",
    projectId: "kadrilas-app",
    storageBucket: "kadrilas-app.firebasestorage.app",
    messagingSenderId: "830702928679",
    appId: "1:830702928679:web:12ca73ec3607f95cca5f02",
    measurementId: "G-LNPWYFBR61"
};

// Inicializē Firebase
firebase.initializeApp(firebaseConfig);

// Eksportē servisa references
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore timestamp helper
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log('✅ Firebase inicializēts!');


