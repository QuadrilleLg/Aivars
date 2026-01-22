// ============================================
// FIREBASE KONFIGURĀCIJA - AIZPILDĪTS
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyDKOM8dgoNnzzmfLJfmDGdg_iC_MNDBodI",
    authDomain: "kadrilas-lv.firebaseapp.com",
    projectId: "kadrilas-lv",
    storageBucket: "kadrilas-lv.firebasestorage.app",
    messagingSenderId: "607969548841",
    appId: "1:607969548841:web:e2e4ad7e8c1fdc33c7da38",
    measurementId: "G-G6Y4L5ZY6E"
};

// Inicializē Firebase
firebase.initializeApp(firebaseConfig);

// Eksportē servisa references
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore timestamp helper
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log('✅ Firebase inicializēts!');
