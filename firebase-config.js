// ============================================
// FIREBASE KONFIGURĀCIJA
// ============================================
// AIZPILDI AR SAVIEM DATIEM no Firebase Console!

const firebaseConfig = {
    apiKey: "AIzaSy...",                    // ← Tavs API Key
    authDomain: "tavs-projekts.firebaseapp.com",  // ← Tavs Auth Domain
    projectId: "tavs-projekts",                   // ← Tavs Project ID
    storageBucket: "tavs-projekts.appspot.com",   // ← Tavs Storage Bucket
    messagingSenderId: "123456789",               // ← Tavs Sender ID
    appId: "1:123456789:web:abc123..."           // ← Tavs App ID
};

// Inicializē Firebase
firebase.initializeApp(firebaseConfig);

// Eksportē servisa references
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore timestamp helper
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log('✅ Firebase inicializēts!');
